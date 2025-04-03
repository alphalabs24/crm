export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  email: string;
  subject?: string;
  body?: string;
  workspaceId?: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string[];
  externalThreadId?: string;
};
