import { InquiriesPreview } from '@/inquiries/components/InquiriesPreview';
import { ContactsByPlatformChart } from '@/object-record/record-show/components/nm/property/ContactsByPlatformChart';
import { ContactsByStageChart } from '@/object-record/record-show/components/nm/publication/ContactsByStageChart';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { propertyPlatformMetricsState } from '@/object-record/record-show/states/propertyPlatformMetricsState';
import { publicationMetricsState } from '@/object-record/record-show/states/publicationMetricsState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconMessageCircle2 } from 'twenty-ui';

type PropertyInquiriesCardProps = {
  recordId: string;
  isPublication?: boolean;
};

export const PropertyInquiriesCard = ({
  recordId,
  isPublication,
}: PropertyInquiriesCardProps) => {
  const { t } = useLingui();

  const propertyPlatformMetrics = useRecoilValue(
    propertyPlatformMetricsState(recordId),
  );

  const publicationMetrics = useRecoilValue(publicationMetricsState(recordId));

  return (
    <Section
      title={t`Inquiries Overview`}
      icon={<IconMessageCircle2 size={16} />}
      preserveHeight
    >
      {isPublication
        ? publicationMetrics?.contactsByStage && (
            <ContactsByStageChart
              contactsByStage={publicationMetrics.contactsByStage}
            />
          )
        : propertyPlatformMetrics?.contactsByPlatform && (
            <ContactsByPlatformChart
              contactsByPlatform={propertyPlatformMetrics.contactsByPlatform}
              totalContacts={propertyPlatformMetrics.contacts}
            />
          )}
      <InquiriesPreview
        propertyId={!isPublication ? recordId : undefined}
        publicationId={isPublication ? recordId : undefined}
        maxItems={5}
      />
    </Section>
  );
};
