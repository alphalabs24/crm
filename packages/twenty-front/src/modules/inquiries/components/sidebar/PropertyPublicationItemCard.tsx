import { DateFormat } from '@/localization/constants/DateFormat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { IconCalendar, IconPhoto } from 'twenty-ui';

const StyledPublicationItem = styled(Link)<{ isLast?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3, 2)};
  text-decoration: none;
  transition: background-color 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }

  ${({ isLast }) =>
    isLast &&
    css`
      border-bottom: none;
    `}
`;

const StyledImageContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 48px;
  justify-content: center;
  overflow: hidden;
  width: 48px;
  flex-shrink: 0;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledPublicationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

const StyledPublicationTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPublicationDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type PropertyPublicationItemCardProps = {
  publication: ObjectRecord;
  isLast?: boolean;
};

export const PropertyPublicationItemCard = ({
  publication,
  isLast,
}: PropertyPublicationItemCardProps) => {
  const images = usePropertyImages({
    id: publication.propertyId,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  return (
    <StyledPublicationItem
      isLast={isLast}
      to={getLinkToShowPage(CoreObjectNameSingular.Publication, publication)}
    >
      <StyledImageContainer>
        {images?.[0]?.fullPath ? (
          <StyledImage src={images[0].fullPath} alt="" />
        ) : (
          <IconPhoto size={24} />
        )}
      </StyledImageContainer>
      <StyledPublicationInfo>
        <StyledPublicationTitle>
          {publication.name}
          <StatusBadge status={publication.stage} size="small" />
        </StyledPublicationTitle>
        {publication.createdAt && (
          <StyledPublicationDate>
            <IconCalendar size={14} />
            {format(new Date(publication.createdAt), DateFormat.DAY_FIRST)}
          </StyledPublicationDate>
        )}
      </StyledPublicationInfo>

      <PlatformBadge platformId={publication.platform} size="small" />
    </StyledPublicationItem>
  );
};
