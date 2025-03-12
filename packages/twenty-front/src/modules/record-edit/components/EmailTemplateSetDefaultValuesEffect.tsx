import { useEffect } from 'react';
import { useRecordEdit } from '../contexts/RecordEditContext';
import { useEmailTemplateContextOrThrow } from '../contexts/EmailTemplateContext';

// Sets default values for email templates inside RecordEditContext
export const EmailTemplateSetDefaultValuesEffect = () => {
  const {
    setEmailTemplateSubject,
    setEmailTemplate: setEmailTemplateDraft,
    emailTemplate: emailTemplateDraft,
    emailTemplateSubject,
  } = useRecordEdit();
  const { emailTemplate, emailTemplateId } = useEmailTemplateContextOrThrow();

  useEffect(() => {
    if (emailTemplate) {
      if (!emailTemplateSubject) setEmailTemplateSubject(emailTemplate.title);

      if (!emailTemplateDraft)
        setEmailTemplateDraft({
          id: emailTemplateId,
          template: emailTemplate,
        });
    }
  }, [
    emailTemplate,
    setEmailTemplateSubject,
    setEmailTemplateDraft,
    emailTemplateId,
    emailTemplateSubject,
    emailTemplateDraft,
  ]);

  return null;
};
