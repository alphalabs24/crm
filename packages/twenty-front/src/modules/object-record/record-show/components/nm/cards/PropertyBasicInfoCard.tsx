import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { ShowPagePropertySummaryCard } from '@/ui/layout/show-page/components/nm/ShowPagePropertySummaryCard';
import { PlatformId } from '@/ui/layout/show-page/components/nm/types/Platform';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconBuilding } from 'twenty-ui';

const StyledContent = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

type PropertyBasicInfoCardProps = {
  record: any;
  loading?: boolean;
  isPublication?: boolean;
};

export const PropertyBasicInfoCard = ({
  record,
  loading = false,
  isPublication,
}: PropertyBasicInfoCardProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  const platformBadge = isPublication ? (
    <PlatformBadge
      platformId={record.platform ?? PlatformId.Newhome}
      isActive
    />
  ) : null;

  return (
    <Section
      title={t`Overview`}
      icon={<IconBuilding size={16} />}
      rightComponent={platformBadge}
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
      </StyledContent>
    </Section>
  );
};
