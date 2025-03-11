import { useEffect } from 'react';
import { useRecordEdit } from '../contexts/RecordEditContext';
import { useEmailTemplateContextOrThrow } from '../contexts/EmailTemplateContext';

// Sets default values for email templates inside RecordEditContext
export const EmailTemplateSetDefaultValuesEffect = () => {
  const { setEmailTemplateSubject, setEmailTemplate, emailTemplateSubject } =
    useRecordEdit();
  const { emailTemplate, emailTemplateId } = useEmailTemplateContextOrThrow();

  useEffect(() => {
    if (emailTemplate) {
      if (!emailTemplateSubject) setEmailTemplateSubject(emailTemplate.title);

      if (!emailTemplate)
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
    emailTemplateSubject,
  ]);

  return null;
};
