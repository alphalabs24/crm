export type WorkflowSendEmailActionInput = {
  connectedAccountId: string;
  email: string;
  subject?: string;
  html?: string;
  text?: string;
  workspaceId?: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string[];
  externalThreadId?: string;
};
