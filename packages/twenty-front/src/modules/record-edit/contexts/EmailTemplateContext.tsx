import { Note } from '@/activities/types/Note';
import { createRequiredContext } from '~/utils/createRequiredContext';

type EmailTemplateContextValue = {
  emailTemplateId: string;
  emailTemplate: Note;
  propertyId?: string;
  publicationId?: string;
};

export const [EmailTemplateContextProvider, useEmailTemplateContextOrThrow] =
  createRequiredContext<EmailTemplateContextValue>('EmailTemplateContext');
