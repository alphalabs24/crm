import { Injectable } from '@nestjs/common';

import { assertUnreachable, ConnectedAccountProvider } from 'twenty-shared';
import { z } from 'zod';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

interface SendMessageInput {
  body: string;
  subject: string;
  to: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string[];
  externalThreadId?: string;
  externalMessageId?: string;
}

@Injectable()
export class MessagingSendMessageService {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const gmailClient =
          await this.gmailClientProvider.getGmailClient(connectedAccount);

        const message = [
          `To: ${sendMessageInput.to}`,
          `Subject: ${this.encodeSubject(sendMessageInput.subject || '')}`,
          'MIME-Version: 1.0',
          sendMessageInput.isHtml
            ? 'Content-Type: text/html; charset="UTF-8"'
            : 'Content-Type: text/plain; charset="UTF-8"',
          '',
          sendMessageInput.body,
        ].join('\n');

        const encodedMessage = Buffer.from(message).toString('base64');

        await gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
            threadId: sendMessageInput.externalThreadId,
            payload: {
              headers: [
                {
                  name: 'In-Reply-To',
                  value: sendMessageInput.inReplyTo || '',
                },
                {
                  name: 'References',
                  value: sendMessageInput.references?.join(' ') || '',
                },
              ],
            },
          },
        });
        break;
      }
      case ConnectedAccountProvider.MICROSOFT: {
        const microsoftClient =
          await this.microsoftClientProvider.getMicrosoftClient(
            connectedAccount,
          );

        // Check if we're replying to a message
        if (sendMessageInput.inReplyTo && sendMessageInput.externalMessageId) {
          try {
            // Get the original message to obtain its conversationId
            const originalMessage = await microsoftClient
              .api(`/me/messages/${sendMessageInput.externalMessageId}`)
              .select('conversationId,subject,from,toRecipients,ccRecipients')
              .get();

            // Create a reply draft
            const replyResponse = await microsoftClient
              .api(
                `/me/messages/${sendMessageInput.externalMessageId}/createReply`,
              )
              .post({});

            const replyId = replyResponse.id;

            z.string().parse(replyId);

            const updatePayload = {
              subject: originalMessage.subject,
              body: {
                contentType: sendMessageInput.isHtml ? 'HTML' : 'Text',
                content: sendMessageInput.body,
              },
              toRecipients: [
                { emailAddress: { address: sendMessageInput.to } },
              ],
              conversationId: originalMessage.conversationId,
            };

            await microsoftClient
              .api(`/me/messages/${replyId}`)
              .update(updatePayload);

            await microsoftClient.api(`/me/messages/${replyId}/send`).post({});
          } catch (error) {
            // Fallback to standard send if reply API fails
            const message = {
              subject: sendMessageInput.subject,
              body: {
                contentType: sendMessageInput.isHtml ? 'HTML' : 'Text',
                content: sendMessageInput.body,
              },
              toRecipients: [
                { emailAddress: { address: sendMessageInput.to } },
              ],
            };

            const response = await microsoftClient
              .api(`/me/messages`)
              .post(message);

            z.string().parse(response.id);
            await microsoftClient
              .api(`/me/messages/${response.id}/send`)
              .post({});
          }
        } else {
          const message = {
            subject: sendMessageInput.subject,
            body: {
              contentType: sendMessageInput.isHtml ? 'HTML' : 'Text',
              content: sendMessageInput.body,
            },
          };

          const response = await microsoftClient
            .api(`/me/messages`)
            .post(message);

          z.string().parse(response.id);

          await microsoftClient
            .api(`/me/messages/${response.id}/send`)
            .post({});
        }
        break;
      }
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for sending messages`,
        );
    }
  }

  private encodeSubject(subject: string): string {
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(subject)) {
      return '=?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=';
    }

    return subject;
  }
}
