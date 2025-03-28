import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useEffect, useMemo, useState } from 'react';
import { UserTutorialTask } from 'twenty-shared';
import { H2Title, Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { PublishersListCard } from './components/PublishersListCard';

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsPublishers = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const { setAsCompleted } = useTutorialSteps();

  const [publisherToDelete, setPublisherToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Agency,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const { records: publishers, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Agency,
    recordGqlFields,
    skip: !objectMetadataItem,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Agency,
  });

  const handleDelete = async () => {
    if (!publisherToDelete) return;

    setIsDeleting(true);
    try {
      await deleteOneRecord(publisherToDelete);
      enqueueSnackBar(t`Publisher deleted successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Error deleting publisher`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsDeleting(false);
      setPublisherToDelete(null);
    }
  };

  // If there are publishers, set the tutorial step as completed
  useEffect(() => {
    if (publishers.length > 0) {
      setAsCompleted({
        step: UserTutorialTask.TUTORIAL_EMAIL,
      });
    }
  }, [publishers.length, setAsCompleted]);

  // Return null if metadata is not available (e.g., during logout)
  if (!objectMetadataItem) {
    return null;
  }

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Platforms`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: <Trans>Platforms</Trans> },
        ]}
      >
        <SettingsPageContainer>
          <StyledContainer isMobile={isMobile}>
            <Section>
              <H2Title
                title={t`Publishers`}
                description={t`Manage your publishers and their platform credentials.`}
              />
              <PublishersListCard
                publishers={publishers}
                loading={loading}
                onDeleteClick={setPublisherToDelete}
              />
            </Section>
          </StyledContainer>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>

      <ConfirmationModal
        isOpen={!!publisherToDelete}
        setIsOpen={() => setPublisherToDelete(null)}
        title={t`Delete Publisher`}
        subtitle={t`Are you sure you want to delete this publisher? This action cannot be undone.`}
        loading={isDeleting}
        onConfirmClick={handleDelete}
        deleteButtonText={t`Delete Publisher`}
      />
    </>
  );
};
