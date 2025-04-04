import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useLingui } from '@lingui/react/macro';
import { IconBuildingSkyscraper } from 'twenty-ui';

type PublicationStatusCardProps = {
  stage: string;
};

export const PublicationStatusCard = ({
  stage,
}: PublicationStatusCardProps) => {
  const { t } = useLingui();

  return (
    <Section
      title={t`Status`}
      icon={<IconBuildingSkyscraper size={16} />}
      preserveHeight
    >
      <StatusBadge status={stage} />
    </Section>
  );
};
