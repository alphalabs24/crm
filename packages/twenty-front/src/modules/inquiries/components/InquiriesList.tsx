import { useInquiries } from '@/inquiries/hooks/useInquiries';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { InquiryItem } from './InquiryItem';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const InquiriesList = () => {
  const { records } = useInquiries();

  const recordsWithPersonAndPublication = useMemo(() => {
    return records.filter((record) => record.person && record.publication);
  }, [records]);

  if (recordsWithPersonAndPublication.length === 0) {
    return <StyledEmptyState>No inquiries found</StyledEmptyState>;
  }

  return (
    <PageBody>
      <StyledList>
        {recordsWithPersonAndPublication.map((record) => (
          <InquiryItem id={record.id} key={record.id} inquiry={record} />
        ))}
      </StyledList>
    </PageBody>
  );
};
