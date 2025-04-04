import { PropertyPublicationItemCard } from '@/inquiries/components/sidebar/PropertyPublicationItemCard';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
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

const getPublicationSortOrder = (stage: string) => {
  switch (stage) {
    case 'PUBLISHED':
      return 0;
    case 'DRAFT':
      return 1;
    default:
      return 2;
  }
};

export const PropertyPublicationsCard = ({
  record,
  loading = false,
}: PropertyPublicationsCardProps) => {
  const { t } = useLingui();
  const publications = record.publications as ObjectRecord[];

  const sortedPublications = useMemo(() => {
    if (!publications) return [];

    return [...publications].sort((a, b) => {
      const aOrder = getPublicationSortOrder(a.stage);
      const bOrder = getPublicationSortOrder(b.stage);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // If same stage, sort by createdAt date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [publications]);

  if (loading) {
    return null;
  }

  return (
    <Section title={t`Publications`} icon={<IconNotes size={16} />}>
      <StyledContent>
        {sortedPublications.length > 0 ? (
          sortedPublications
            .filter((p) => p.stage !== 'OVERWRITTEN')
            .map((publication, index) => (
              <PropertyPublicationItemCard
                key={publication.id}
                publication={publication}
                isLast={index === sortedPublications.length - 1}
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
