import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useSearchParams } from 'react-router-dom';
import { IconX } from 'twenty-ui';

const StyledFilterHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledFilterInfo = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPublicationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledRefTag = styled.span`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledSkeletonWrapper = styled.div`
  width: 120px;
`;

type InquiriesFilterHeaderProps = {
  propertyId?: string;
  publicationId?: string;
};

export const InquiriesFilterHeader = ({
  propertyId,
  publicationId,
}: InquiriesFilterHeaderProps) => {
  const { t } = useLingui();
  const [, setSearchParams] = useSearchParams();

  const { record: property } = useFindOneRecord({
    objectNameSingular: 'property',
    objectRecordId: propertyId,
    skip: !propertyId,
  });

  const { record: publication } = useFindOneRecord({
    objectNameSingular: 'publication',
    objectRecordId: publicationId,
    skip: !publicationId,
  });

  const handleClearFilter = () => {
    setSearchParams((params) => {
      const newParams = new URLSearchParams(params);
      newParams.delete('propertyId');
      newParams.delete('publicationId');
      return newParams;
    });
  };

  const propertyRef = useMemo(() => {
    if (propertyId) {
      return property?.refProperty;
    }
    return publication?.refProperty;
  }, [propertyId, property, publication]);

  if (!propertyId && !publicationId) {
    return null;
  }

  return (
    <StyledFilterHeader>
      <StyledFilterInfo>
        {t`Filtered by`}{' '}
        {propertyId && (
          <StyledPropertyName>
            {property?.name || (
              <StyledSkeletonWrapper>
                <Skeleton width={120} height={16} />
              </StyledSkeletonWrapper>
            )}
          </StyledPropertyName>
        )}
        {publicationId && (
          <StyledPublicationInfo>
            <StyledPropertyName>
              {publication?.name || (
                <StyledSkeletonWrapper>
                  <Skeleton width={120} height={16} />
                </StyledSkeletonWrapper>
              )}
            </StyledPropertyName>
            {publication?.platform && (
              <PlatformBadge
                platformId={publication.platform}
                size="tiny"
                variant="no-background"
              />
            )}
          </StyledPublicationInfo>
        )}
        {propertyRef && <StyledRefTag>{t`Ref: ${propertyRef}`}</StyledRefTag>}
      </StyledFilterInfo>
      <StyledClearButton onClick={handleClearFilter}>
        <IconX size={14} />
        {t`Clear filter`}
      </StyledClearButton>
    </StyledFilterHeader>
  );
};
