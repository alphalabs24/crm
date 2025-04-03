import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class MessagingMessageService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  private async getObjectMetadata(
    objectMetadataName: string,
    workspaceId: string,
  ) {
    return this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: objectMetadataName,
        workspaceId,
      },
    });
  }

  public async saveMessagesWithinTransaction(
    messages: MessageWithParticipants[],
    messageChannelId: string,
    transactionManager: EntityManager,
  ): Promise<Map<string, string>> {
    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const messageRepository =
      await this.twentyORMManager.getRepository<MessageWorkspaceEntity>(
        'message',
      );

    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const messageExternalIdsAndIdsMap = new Map<string, string>();

    for (const message of messages) {
      const existingMessageChannelMessageAssociation =
        await messageChannelMessageAssociationRepository.findOne(
          {
            where: {
              messageExternalId: message.externalId,
              messageChannelId: messageChannelId,
            },
          },
          transactionManager,
        );

      if (existingMessageChannelMessageAssociation) {
        continue;
      }

      const existingMessage = await messageRepository.findOne({
        where: {
          headerMessageId: message.headerMessageId,
        },
      });

      if (existingMessage) {
        await messageChannelMessageAssociationRepository.upsert(
          {
            messageChannelId,
            messageId: existingMessage.id,
            messageExternalId: message.externalId,
            messageThreadExternalId: message.messageThreadExternalId,
          },
          {
            conflictPaths: ['messageChannelId', 'messageId'],
            indexPredicate: '"deletedAt" IS NULL',
          },
          transactionManager,
        );

        continue;
      }

      const existingThread = await messageThreadRepository.findOne(
        {
          where: {
            messages: {
              messageChannelMessageAssociations: {
                messageThreadExternalId: message.messageThreadExternalId,
                messageChannelId,
              },
            },
          },
        },
        transactionManager,
      );

      let newOrExistingMessageThreadId = existingThread?.id;

      if (!existingThread) {
        newOrExistingMessageThreadId = v4();

        await messageThreadRepository.insert(
          { id: newOrExistingMessageThreadId },
          transactionManager,
        );
      }

      const newMessageId = v4();

      await messageRepository.insert(
        {
          id: newMessageId,
          headerMessageId: message.headerMessageId,
          subject: message.subject,
          receivedAt: message.receivedAt,
          text: message.text,
          messageThreadId: newOrExistingMessageThreadId,
        },
        transactionManager,
      );

      messageExternalIdsAndIdsMap.set(message.externalId, newMessageId);

      await messageChannelMessageAssociationRepository.insert(
        {
          messageChannelId,
          messageId: newMessageId,
          messageExternalId: message.externalId,
          messageThreadExternalId: message.messageThreadExternalId,
          direction: message.direction,
        },
        transactionManager,
      );

      // Get each created entry
      const createdAssociation =
        await messageChannelMessageAssociationRepository.findOne(
          {
            where: {
              messageId: newMessageId,
              messageChannelId: messageChannelId,
            },
          },
          transactionManager,
        );

      const createdMessage = await messageRepository.findOne(
        {
          where: {
            id: newMessageId,
          },
        },
        transactionManager,
      );

      const createdThread = await messageThreadRepository.findOne(
        {
          where: {
            id: newOrExistingMessageThreadId,
          },
        },
        transactionManager,
      );

      // Get workspace id for email
      const workspaceDataSource = await this.twentyORMManager.getDatasource();
      const workspaceId = workspaceDataSource.internalContext.workspaceId;

      // Get Metadata for each created entry type
      const messageMetadata = await this.getObjectMetadata(
        'message',
        workspaceId,
      );

      const messageAssociationMetadata = await this.getObjectMetadata(
        'messageChannelMessageAssociation',
        workspaceId,
      );

      const messageThreadMetadata = await this.getObjectMetadata(
        'messageThread',
        workspaceId,
      );

      // Emit events for each created entry
      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'message',
        action: DatabaseEventAction.CREATED,
        events: [
          {
            recordId: createdMessage?.id ?? '',
            objectMetadata: messageMetadata,
            properties: {
              after: {
                ...createdMessage,
                participants: message.participants,
                externalThreadId: message.messageThreadExternalId,
                messageChannelId: messageChannelId,
              },
            },
          },
        ],
        workspaceId,
      });

      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'messageChannelMessageAssociation',
        action: DatabaseEventAction.CREATED,
        events: [
          {
            recordId: createdAssociation?.id ?? '',
            objectMetadata: messageAssociationMetadata,
            properties: {
              after: createdAssociation,
            },
          },
        ],
        workspaceId,
      });

      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'messageThread',
        action: DatabaseEventAction.CREATED,
        events: [
          {
            recordId: createdThread?.id ?? '',
            objectMetadata: messageThreadMetadata,
            properties: {
              after: createdThread,
            },
          },
        ],
        workspaceId,
      });
    }

    return messageExternalIdsAndIdsMap;
  }
}
