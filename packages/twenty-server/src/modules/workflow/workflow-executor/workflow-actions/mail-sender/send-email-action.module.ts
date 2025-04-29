import { Module } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    GmailClientProvider,
    MicrosoftClientProvider,
    ScopedWorkspaceContextFactory,
    SendEmailWorkflowAction,
    MessagingSendMessageService,
  ],
  exports: [SendEmailWorkflowAction],
})
export class SendEmailActionModule {}
