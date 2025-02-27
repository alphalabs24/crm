import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    transactionManager?: EntityManager,
  ): Promise<void> {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const savedParticipants = await messageParticipantRepository.save(
      participants.map((participant) => {
        return {
          messageId: participant.messageId,
          role: participant.role,
          handle: participant.handle,
          displayName: participant.displayName,
        };
      }),
      {},
      transactionManager,
    );

    const participantMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'messageParticipant',
        },
      });

    // Get workspace id
    const workspaceDataSource = await this.twentyORMManager.getDatasource();
    const workspaceId = workspaceDataSource.internalContext.workspaceId;

    for (const participant of savedParticipants) {
      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'messageParticipant',
        action: DatabaseEventAction.CREATED,
        events: [
          {
            recordId: participant.id,
            objectMetadata: participantMetadata,
            properties: {
              after: participant,
            },
          },
        ],
        workspaceId,
      });
    }

    await this.matchParticipantService.matchParticipants(
      savedParticipants,
      'messageParticipant',
      transactionManager,
    );
  }
}
