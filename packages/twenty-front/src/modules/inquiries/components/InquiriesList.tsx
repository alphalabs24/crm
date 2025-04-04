import { PageBody } from '@/ui/layout/page/components/PageBody';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useInquiryPage } from '../contexts/InquiryPageContext';
import { InquiriesFilterHeader } from './InquiriesFilterHeader';
import { InquiryItem } from './InquiryItem';

const StyledPageBody = styled(PageBody)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

// Create styled components for skeleton loader
const StyledSkeletonCard = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledSkeletonProfileSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSkeletonProfilePicture = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  height: 40px;
  width: 40px;
`;

const StyledSkeletonRelationshipSection = styled.div`
  margin-left: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

// Create a skeleton card loader component
const InquirySkeletonItem = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard>
        <StyledSkeletonHeader>
          <StyledSkeletonProfileSection>
            <StyledSkeletonProfilePicture />
            <Skeleton width={120} height={16} />
          </StyledSkeletonProfileSection>
          <Skeleton width={80} height={12} />
        </StyledSkeletonHeader>
        <StyledSkeletonRelationshipSection>
          <Skeleton width={180} height={16} />
        </StyledSkeletonRelationshipSection>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

// Create a skeleton loader for the list
const InquirySkeletonLoader = () => {
  const skeletonItems = Array.from({ length: 5 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <StyledList>
      {skeletonItems.map(({ id }) => (
        <InquirySkeletonItem key={id} />
      ))}
    </StyledList>
  );
};

export const InquiriesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { inquiries, loading, deleteOne } = useInquiryPage();

  const propertyId = searchParams.get('propertyId') || undefined;
  const publicationId = searchParams.get('publicationId') || undefined;
  const id = searchParams.get('id');

  const {
    openInquirySidebar,
    setSelectedInquiry,
    closeInquirySidebar,
    refreshMessages,
    selectedInquiry,
  } = useInquiryPage();

  const handleInquiryClick = useCallback(
    (inquiryId: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('id', inquiryId);

      // Replace current state to avoid double entries in history
      navigate(
        {
          pathname: location.pathname,
          search: newParams.toString(),
        },
        { replace: true },
      );
      if (selectedInquiry?.id !== inquiryId) {
        refreshMessages();
        setSelectedInquiry(inquiryId);
      }
      openInquirySidebar(inquiryId);
    },
    [
      searchParams,
      navigate,
      location.pathname,
      selectedInquiry?.id,
      openInquirySidebar,
      refreshMessages,
      setSelectedInquiry,
    ],
  );

  const handleUnselectInquiry = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('id');

    // Update URL without adding to history
    navigate(
      {
        pathname: location.pathname,
        search: newParams.toString(),
      },
      { replace: true },
    );

    setSelectedInquiry(null);
    closeInquirySidebar();
  }, [
    navigate,
    location.pathname,
    searchParams,
    setSelectedInquiry,
    closeInquirySidebar,
  ]);

  // Listen to popstate (browser back/forward) events
  useEffect(() => {
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentId = currentParams.get('id');

      if (!currentId) {
        setSelectedInquiry(null);
        closeInquirySidebar();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedInquiry, closeInquirySidebar]);

  // Open inquiry on load if ID is present in URL
  useEffect(() => {
    if (id && inquiries.length > 0) {
      const inquiry = inquiries.find((record) => record.id === id);
      if (inquiry) {
        setSelectedInquiry(inquiry.id);
        openInquirySidebar(inquiry.id);
      } else {
        handleUnselectInquiry();
      }
    }
  }, [
    inquiries,
    id,
    setSelectedInquiry,
    openInquirySidebar,
    handleUnselectInquiry,
  ]);

  const recordsWithPersonAndPublication = useMemo(() => {
    return inquiries.filter((record) => record.person && record.publication);
  }, [inquiries]);

  if (loading) {
    return (
      <StyledPageBody>
        <InquiriesFilterHeader
          propertyId={propertyId}
          publicationId={publicationId}
          inquiries={[]}
        />
        <ScrollWrapper
          componentInstanceId="inquiries-list"
          contextProviderName="inquiriesList"
        >
          <InquirySkeletonLoader />
        </ScrollWrapper>
      </StyledPageBody>
    );
  }

  if (recordsWithPersonAndPublication.length === 0) {
    return (
      <StyledPageBody>
        <InquiriesFilterHeader
          propertyId={propertyId}
          publicationId={publicationId}
          inquiries={[]}
        />
        <StyledEmptyState>No inquiries found</StyledEmptyState>
      </StyledPageBody>
    );
  }

  return (
    <StyledPageBody>
      <InquiriesFilterHeader
        propertyId={propertyId}
        publicationId={publicationId}
        inquiries={recordsWithPersonAndPublication}
      />
      <ScrollWrapper
        componentInstanceId="inquiries-list"
        contextProviderName="inquiriesList"
      >
        <StyledList>
          {recordsWithPersonAndPublication.map((record, index) => (
            <InquiryItem
              key={record.id}
              inquiry={record}
              isLast={index === recordsWithPersonAndPublication.length - 1}
              onClick={() => handleInquiryClick(record.id)}
              onDelete={() => deleteOne(record.id)}
            />
          ))}
        </StyledList>
      </ScrollWrapper>
    </StyledPageBody>
  );
};
