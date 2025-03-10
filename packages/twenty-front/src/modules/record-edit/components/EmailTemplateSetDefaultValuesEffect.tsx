import { useEffect } from 'react';
import { useRecordEdit } from '../contexts/RecordEditContext';
import { useEmailTemplateContextOrThrow } from '../contexts/EmailTemplateContext';

// Sets default values for email templates inside RecordEditContext
export const EmailTemplateSetDefaultValuesEffect = () => {
  const { setEmailTemplateSubject, setEmailTemplate } = useRecordEdit();
  const { emailTemplate, emailTemplateId } = useEmailTemplateContextOrThrow();

  useEffect(() => {
    if (emailTemplate) {
      setEmailTemplateSubject(emailTemplate.title);
      setEmailTemplate({
        id: emailTemplateId,
        template: emailTemplate,
      });
    }
  }, [
    emailTemplate,
    setEmailTemplateSubject,
    setEmailTemplate,
    emailTemplateId,
  ]);

  return null;
};
