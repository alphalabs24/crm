import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { MainContextStoreProviderEffect } from '@/context-store/components/MainContextStoreProviderEffect';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { InquiriesList } from '@/inquiries/components/InquiriesList';
import { InquirySidebar } from '@/inquiries/components/InquirySidebar';
import {
  InquiryPageContextProvider,
  useInquiryPage,
} from '@/inquiries/contexts/InquiryPageContext';
import { useInquiries } from '@/inquiries/hooks/useInquiries';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconInbox, LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledSplitView = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledLeftPanel = styled.div<{ isSidebarOpen: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  flex-shrink: 0;
  transition: width 0.3s ease-in-out;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT + 1}px) {
    width: ${({ isSidebarOpen }) => (isSidebarOpen ? '400px' : '100%')};
  }
`;

const StyledPageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const RecordInquiriesPageContent = () => {
  const { isInquirySidebarOpen } = useInquiryPage();

  return (
    <StyledSplitView>
      <StyledLeftPanel isSidebarOpen={isInquirySidebarOpen}>
        <StyledPageContainer>
          <PageHeader title="Inquiries" Icon={IconInbox} />
          <InquiriesList />
        </StyledPageContainer>
      </StyledLeftPanel>
      <InquirySidebar />
    </StyledSplitView>
  );
};

export const RecordInquiriesPage = () => {
  const [searchParams] = useSearchParams();

  const propertyId = searchParams.get('propertyId') || undefined;
  const publicationId = searchParams.get('publicationId') || undefined;

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { records, loading, deleteOne, error } = useInquiries({
    propertyId,
    publicationId,
  });

  const recordIndexId = `${CoreObjectNamePlural.BuyerLead}-${contextStoreCurrentViewId}`;

  // Get the BuyerLead object metadata item to set in the context store
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const buyerLeadObjectMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === CoreObjectNameSingular.BuyerLead,
  );

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }}
    >
      {buyerLeadObjectMetadata && (
        <MainContextStoreProviderEffect
          objectMetadataItem={buyerLeadObjectMetadata}
          pageName="record-index"
          viewId={contextStoreCurrentViewId}
        />
      )}
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordSortsComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{
                instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
              }}
            >
              <InquiryPageContextProvider
                inquiries={records}
                loading={loading}
                deleteOne={deleteOne}
                error={error}
              >
                <RecordInquiriesPageContent />
              </InquiryPageContextProvider>
            </ActionMenuComponentInstanceContext.Provider>
          </RecordSortsComponentInstanceContext.Provider>
        </RecordFiltersComponentInstanceContext.Provider>
      </ViewComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
