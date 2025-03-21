import { Note } from '@/activities/types/Note';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { EmailTemplateForm } from './components/EmailTemplateForm';

export const SettingsEmailTemplateDetail = () => {
  const { t } = useLingui();
  const { emailTemplateId = '' } = useParams();

  const { record: emailTemplate, loading } = useFindOneRecord<Note>({
    objectNameSingular: CoreObjectNameSingular.Note,
    objectRecordId: emailTemplateId,
  });

  if (!emailTemplate && !loading) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={emailTemplate?.title || t`Email Template`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Email Templates`,
          href: getSettingsPath(SettingsPath.EmailTemplates),
        },
        { children: emailTemplate?.title || t`Email Template` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Email Template`}
            description={t`Edit your email template.`}
          />
          <EmailTemplateForm emailTemplate={emailTemplate} loading={loading} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
