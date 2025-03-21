import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { H2Title, Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { EmailTemplatesListCard } from './components/EmailTemplatesListCard';

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsEmailTemplates = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const { records: emailTemplates, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: { isTemplate: { eq: true } },
    recordGqlFields,
    skip: !objectMetadataItem,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      await deleteOneRecord(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  // Return null if metadata is not available
  if (!objectMetadataItem) {
    return null;
  }

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Email Settings`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: <Trans>Email Settings</Trans> },
        ]}
      >
        <SettingsPageContainer>
          <StyledContainer isMobile={isMobile}>
            <Section>
              <H2Title
                title={t`Email Templates`}
                description={t`Manage your email templates for properties and publications.`}
              />
              <EmailTemplatesListCard
                emailTemplates={emailTemplates}
                loading={loading}
                onDeleteClick={(id) => setTemplateToDelete(id)}
              />
            </Section>
          </StyledContainer>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>

      {templateToDelete && (
        <ConfirmationModal
          isOpen={!!templateToDelete}
          title={t`Delete email template`}
          subtitle={t`Are you sure you want to delete this email template? This cannot be undone.`}
          setIsOpen={() => setTemplateToDelete(null)}
          onConfirmClick={handleDeleteConfirm}
          deleteButtonText={t`Delete`}
        />
      )}
    </>
  );
};
