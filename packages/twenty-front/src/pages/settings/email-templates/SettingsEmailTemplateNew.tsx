import { Note } from '@/activities/types/Note';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { EmailTemplateForm } from './components/EmailTemplateForm';

const emptyEmailTemplate: Note = {
  id: '',
  title: '',
  body: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __typename: 'Note',
  bodyV2: {
    blocknote: null,
    markdown: null,
  },
};

type NoteWithTemplate = Note & {
  type: string;
};

export const SettingsEmailTemplateNew = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');

  const { createOneRecord } = useCreateOneRecord<NoteWithTemplate>({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const newTemplate = await createOneRecord({
        title: subject,
        type: 'EmailTemplate',
      });

      if (newTemplate?.id) {
        navigateSettings(SettingsPath.EmailTemplateDetail, {
          emailTemplateId: newTemplate.id,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`New Template`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Email Templates`,
          href: getSettingsPath(SettingsPath.EmailTemplates),
        },
        { children: t`New Template` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={isLoading}
          onCancel={() => navigateSettings(SettingsPath.EmailTemplates)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Email Template`}
            description={t`Create a new email template.`}
          />
          <EmailTemplateForm
            emailTemplate={emptyEmailTemplate}
            loading={isLoading}
            onUpdate={setSubject}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
