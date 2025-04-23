import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { AppTooltip, IconMap } from 'twenty-ui';
import { v4 as uuidV4 } from 'uuid';

import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

type ShowPagePropertySummaryCardProps = {
  title: ReactNode;
  description: ReactNode;
  address?: ReactNode;
  date: string;
  loading: boolean;
  isMobile?: boolean;
};

export const StyledShowPageSummaryCard = styled.div<{
  isMobile: boolean;
}>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(2) : theme.spacing(3)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  box-sizing: border-box;
`;

const StyledAddressAndDateContainer = styled.div<{ isMobile: boolean }>`
  align-items: flex-start;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
  width: 100%;
`;

const StyledAddressContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledInfoContainer = styled.div<{ isMobile: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledDate = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTitle = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  max-width: 90%;
`;

const StyledDescription = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.secondary};
  word-break: break-word;
  line-height: 22px;
`;

const StyledAddress = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  word-break: break-word;
`;

const StyledAvatarWrapper = styled.div<{ isAvatarEditable: boolean }>`
  cursor: ${({ isAvatarEditable }) =>
    isAvatarEditable ? 'pointer' : 'default'};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledSubSkeleton = styled.div`
  align-items: center;
  display: flex;
  height: 37px;
  justify-content: center;
  width: 108px;
`;

const StyledShowPageSummaryCardSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={250} height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs} />
      <Skeleton width={150} height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
      <Skeleton width={300} height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl} />
    </SkeletonTheme>
  );
};

export const ShowPagePropertySummaryCard = ({
  date,
  title,
  description,
  address,
  loading,
  isMobile = false,
}: ShowPagePropertySummaryCardProps) => {
  const beautifiedCreatedAt =
    date !== '' ? beautifyPastDateRelativeToNow(date) : '';
  const exactCreatedAt = date !== '' ? beautifyExactDateTime(date) : '';
  const dateElementId = `date-id-${uuidV4()}`;
  const theme = useTheme();

  if (loading)
    return (
      <StyledShowPageSummaryCard isMobile={isMobile}>
        <StyledShowPageSummaryCardSkeletonLoader />
      </StyledShowPageSummaryCard>
    );

  return (
    <StyledShowPageSummaryCard isMobile={isMobile}>
      <StyledInfoContainer isMobile={isMobile}>
        <StyledAddressAndDateContainer isMobile={isMobile}>
          {address && (
            <StyledAddressContainer>
              <IconMap size={16} color={theme.font.color.secondary} />
              <StyledAddress isMobile={isMobile}>{address}</StyledAddress>
            </StyledAddressContainer>
          )}
          {beautifiedCreatedAt && (
            <StyledDate isMobile={isMobile} id={dateElementId}>
              Added {beautifiedCreatedAt}
            </StyledDate>
          )}
        </StyledAddressAndDateContainer>

        <StyledTitle isMobile={isMobile}>{title}</StyledTitle>
        <StyledDescription isMobile={isMobile}>{description}</StyledDescription>

        <AppTooltip
          anchorSelect={`#${dateElementId}`}
          content={exactCreatedAt}
          clickable
          noArrow
          place="right"
        />
      </StyledInfoContainer>
    </StyledShowPageSummaryCard>
  );
};
