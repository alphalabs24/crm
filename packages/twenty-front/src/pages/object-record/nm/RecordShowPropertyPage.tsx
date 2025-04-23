import { useParams } from 'react-router-dom';

import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordShowPropertyBreadcrumb } from '@/object-record/record-show/components/nm/RecordShowPropertyBreadcrumb';
import { RecordShowPropertyContainer } from '@/object-record/record-show/components/nm/RecordShowPropertyContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { RecordShowPageWorkflowHeader } from '@/workflow/components/RecordShowPageWorkflowHeader';
import { RecordShowPageWorkflowVersionHeader } from '@/workflow/components/RecordShowPageWorkflowVersionHeader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { FeatureFlagKey } from '~/generated/graphql';
import { useNestermind } from '@/api/hooks/useNestermind';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { generatePropertyPdfTemplate } from '@/pdf/components/templates/property-template';

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};

  flex-wrap: wrap;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.font.color.inverted};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.color.blue80};
  }
`;

export const RecordShowPropertyPage = () => {
  const parameters = useParams<{
    objectRecordId: string;
    objectNameSingular: string;
  }>();

  const { useMutations } = useNestermind();
  const { useGeneratePdf } = useMutations;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: parameters.objectNameSingular ?? '',
  });

  const { formatField } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  const { mutate: generatePdf } = useGeneratePdf({
    onSuccess: (pdfBlob: Blob) => {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record?.name || 'property'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });

  const {
    objectNameSingular,
    objectRecordId,
    loading,
    pageTitle,
    pageName,
    isFavorite,
    record,
    objectMetadataItem: recordObjectMetadataItem,
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

  const { navigateToIndexView } = useRecordShowPagePagination(
    objectNameSingular,
    objectRecordId,
  );

  // const html = generatePropertyPdfTemplate(record, formatField);

  // const handleGeneratePdf = () => {
  //   if (!record) return;
  //   generatePdf({ html });
  // };

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: `record-show-${objectRecordId}` }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: `record-show-${objectRecordId}` }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: `record-show-${objectRecordId}` }}
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
                      showBackButton
                      handleCloseClick={navigateToIndexView}
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
                    <RecordShowPropertyContainer
                      objectNameSingular={objectNameSingular}
                      objectRecordId={objectRecordId}
                      loading={loading}
                      isPublication={
                        objectNameSingular ===
                        CoreObjectNameSingular.Publication
                      }
                    />
                  </TimelineActivityContext.Provider>
                </PageBody>
              </PageContainer>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFieldValueSelectorContextProvider>
  );
};
