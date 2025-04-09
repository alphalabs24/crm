import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { isDefined, isValidUuid } from 'twenty-shared';
import { z } from 'zod';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import {
  SendEmailActionException,
  SendEmailActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/exceptions/send-email-action.exception';
import { WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';

export type WorkflowSendEmailStepOutputSchema = {
  success: boolean;
};

@Injectable()
export class SendEmailWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messagingSendMessageService: MessagingSendMessageService,
  ) {}

  async execute(
    workflowActionInput: WorkflowSendEmailActionInput,
  ): Promise<WorkflowActionResult> {
    if (!isValidUuid(workflowActionInput.connectedAccountId)) {
      throw new SendEmailActionException(
        `Connected Account ID is not a valid UUID`,
        SendEmailActionExceptionCode.INVALID_CONNECTED_ACCOUNT_ID,
      );
    }

    const { workspaceId } = workflowActionInput.workspaceId
      ? { workspaceId: workflowActionInput.workspaceId }
      : this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOneBy({
      id: workflowActionInput.connectedAccountId,
    });

    if (!isDefined(connectedAccount) || !connectedAccount) {
      throw new SendEmailActionException(
        `Connected Account '${workflowActionInput.connectedAccountId}' not found`,
        SendEmailActionExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    const { email, body, subject } = workflowActionInput;

    const emailSchema = z.string().trim().email('Invalid email');

    const result = emailSchema.safeParse(email);

    if (!result.success) {
      throw new SendEmailActionException(
        `Email '${email}' invalid`,
        SendEmailActionExceptionCode.INVALID_EMAIL,
      );
    }

    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const safeBody = purify.sanitize(body || '');
    const safeSubject = purify.sanitize(subject || '');

    this.messagingSendMessageService.sendMessage(
      {
        body: safeBody,
        subject: safeSubject,
        to: email,
        isHtml: workflowActionInput.isHtml,
        inReplyTo: workflowActionInput.inReplyTo,
        references: workflowActionInput.references,
        externalThreadId: workflowActionInput.externalThreadId,
      },
      connectedAccount,
    );

    this.logger.log(`Email sent successfully`);

    return {
      result: { success: true } satisfies WorkflowSendEmailStepOutputSchema,
    };
  }
}
