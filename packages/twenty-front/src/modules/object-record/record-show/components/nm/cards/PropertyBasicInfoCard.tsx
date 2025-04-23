import { LinkedPropertyCard } from '@/object-record/record-show/components/nm/cards/LinkedPropertyCard';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ShowPagePropertySummaryCard } from '@/ui/layout/show-page/components/nm/ShowPagePropertySummaryCard';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconBuilding } from 'twenty-ui';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  flex: 1;
`;

const StyledPropertyContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledPropertyLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlatformBadgesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type PropertyBasicInfoCardProps = {
  record: any;
  loading?: boolean;
  isPublication?: boolean;
  property?: ObjectRecord;
  platforms?: PlatformId[];
};

export const PropertyBasicInfoCard = ({
  record,
  loading = false,
  isPublication,
  property,
  platforms,
}: PropertyBasicInfoCardProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  const platformBadge = isPublication ? (
    <PlatformBadge
      platformId={record.platform ?? PlatformId.Newhome}
      variant="no-background"
    />
  ) : null;

  // Create the platforms badge component for the section header
  const PlatformBadges = () => (
    <StyledPlatformBadgesContainer>
      {platforms?.map((platformId) => (
        <PlatformBadge
          key={platformId}
          platformId={platformId}
          size="small"
          variant="default"
        />
      ))}
    </StyledPlatformBadgesContainer>
  );

  return (
    <Section
      title={t`Overview`}
      icon={<IconBuilding size={16} />}
      rightComponent={
        platformBadge ? platformBadge : platforms ? <PlatformBadges /> : null
      }
    >
      <StyledContent>
        <ShowPagePropertySummaryCard
          date={record.createdAt ?? ''}
          loading={loading}
          title={record.name?.firstName ? record.name.firstName : record.name}
          description={record.description}
          address={
            record.address &&
            (record.address.addressStreet1 || record.address.addressCity)
              ? `${record.address?.addressStreet1 || ''} ${record.address?.addressCity || ''} ${record.address?.addressState || ''} ${record.address?.addressPostcode || ''} ${record.address?.addressCountry || ''}`
              : undefined
          }
          isMobile={isMobile}
        />
        {isPublication && property && (
          <StyledPropertyContainer>
            <StyledPropertyLabel>{t`Created from property`}</StyledPropertyLabel>
            <LinkedPropertyCard property={property} />
          </StyledPropertyContainer>
        )}
      </StyledContent>
    </Section>
  );
};
