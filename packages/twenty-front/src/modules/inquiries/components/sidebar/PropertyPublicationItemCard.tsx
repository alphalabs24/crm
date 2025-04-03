import { DateFormat } from '@/localization/constants/DateFormat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { IconCalendar } from 'twenty-ui';

const StyledPublicationItem = styled(Link)`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  text-decoration: none;
  transition: background-color 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
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
};

export const PropertyPublicationItemCard = ({
  publication,
}: PropertyPublicationItemCardProps) => {
  return (
    <StyledPublicationItem
      to={getLinkToShowPage(CoreObjectNameSingular.Publication, publication)}
    >
      <StyledPublicationInfo>
        <StyledPublicationTitle>
          {publication.name}
          <StatusBadge status={publication.status} size="small" />
        </StyledPublicationTitle>
        {publication.createdAt && (
          <StyledPublicationDate>
            <IconCalendar size={14} />
            {format(new Date(publication.createdAt), DateFormat.DAY_FIRST)}
          </StyledPublicationDate>
        )}
      </StyledPublicationInfo>

      <PlatformBadge platformId={publication.platform} isActive size="small" />
    </StyledPublicationItem>
  );
};
