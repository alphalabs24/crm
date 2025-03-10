import { Note } from '@/activities/types/Note';
import { createRequiredContext } from '~/utils/createRequiredContext';

type EmailTemplateContextValue = {
  emailTemplateId: string;
  emailTemplate: Note;
};

export const [EmailTemplateContextProvider, useEmailTemplateContextOrThrow] =
  createRequiredContext<EmailTemplateContextValue>('EmailTemplateContext');
