import { useParams } from 'react-router-dom';

import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordShowPropertyBreadcrumb } from '@/object-record/record-show/components/nm/RecordShowPropertyBreadcrumb';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordEditContainer } from '@/record-edit/components/RecordEditContainer';
import { EDIT_SECTIONS_TABS } from '@/record-edit/constants/EditSectionTabs';
import { RecordEditProvider } from '@/record-edit/contexts/RecordEditContext';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { RecordShowPageWorkflowHeader } from '@/workflow/components/RecordShowPageWorkflowHeader';
import { RecordShowPageWorkflowVersionHeader } from '@/workflow/components/RecordShowPageWorkflowVersionHeader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.noisy};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  height: ${PAGE_BAR_MIN_HEIGHT}px;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const RecordEditPage = () => {
  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const {
    objectNameSingular,
    objectRecordId,
    pageTitle,
    pageName,
    isFavorite,
    record,
    objectMetadataItem,
    handleFavoriteButtonClick,
  } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const { labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  if (!record) {
    return null;
  }

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordEditProvider
        initialRecord={record ?? null}
        objectMetadataItem={objectMetadataItem}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: `record-edit-${objectRecordId}` }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: `record-edit-${objectRecordId}` }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: `record-edit-${objectRecordId}` }}
            >
              <RecordValueSetterEffect recordId={objectRecordId} />
              <PageContainer>
                <PageTitle title={pageTitle} />
                <StyledHeader>
                  <StyledLeftContainer>
                    <RecordShowPropertyBreadcrumb
                      objectNameSingular={objectNameSingular}
                      objectRecordId={objectRecordId}
                      objectLabelPlural={objectMetadataItem.labelPlural}
                      labelIdentifierFieldMetadataItem={
                        labelIdentifierFieldMetadataItem
                      }
                      suffix="Edit"
                    />
                  </StyledLeftContainer>
                  <StyledRightContainer>
                    {!isCommandMenuV2Enabled &&
                      objectNameSingular ===
                        CoreObjectNameSingular.Workflow && (
                        <RecordShowPageWorkflowHeader
                          workflowId={objectRecordId}
                        />
                      )}
                    {!isCommandMenuV2Enabled &&
                      objectNameSingular ===
                        CoreObjectNameSingular.WorkflowVersion && (
                        <RecordShowPageWorkflowVersionHeader
                          workflowVersionId={objectRecordId}
                        />
                      )}
                    {(isCommandMenuV2Enabled ||
                      (objectNameSingular !== CoreObjectNameSingular.Workflow &&
                        objectNameSingular !==
                          CoreObjectNameSingular.WorkflowVersion)) && (
                      <RecordShowActionMenu
                        {...{
                          isFavorite,
                          record,
                          handleFavoriteButtonClick,
                          objectMetadataItem,
                          objectNameSingular,
                        }}
                      />
                    )}
                  </StyledRightContainer>
                </StyledHeader>
                <PageBody>
                  <TimelineActivityContext.Provider
                    value={{ labelIdentifierValue: pageName }}
                  >
                    <RecordEditContainer
                      objectNameSingular={objectNameSingular}
                      recordId={objectRecordId}
                      tabs={EDIT_SECTIONS_TABS}
                    />
                  </TimelineActivityContext.Provider>
                </PageBody>
              </PageContainer>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordEditProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
