import { PropertyPublicationItemCard } from '@/inquiries/components/sidebar/PropertyPublicationItemCard';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconNotes } from 'twenty-ui';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  min-height: 100px;
  width: 100%;
`;

type PropertyPublicationsCardProps = {
  record: any;
  loading?: boolean;
};

export const PropertyPublicationsCard = ({
  record,
  loading = false,
}: PropertyPublicationsCardProps) => {
  const { t } = useLingui();
  const publications = record.publications as ObjectRecord[];

  if (loading) {
    return null;
  }

  return (
    <Section title={t`Publications`} icon={<IconNotes size={16} />}>
      <StyledContent>
        {publications && publications.length > 0 ? (
          publications.map((publication, index) => (
            <PropertyPublicationItemCard
              key={publication.id}
              publication={publication}
              isLast={index === publications.length - 1}
            />
          ))
        ) : (
          <StyledEmptyState>
            <IconNotes size={32} />
            <div>{t`No publications available`}</div>
          </StyledEmptyState>
        )}
      </StyledContent>
    </Section>
  );
};
