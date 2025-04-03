import {
    Section,
    StyledComingSoonText,
} from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconChartBar } from 'twenty-ui';

export const PropertyReportingCard = () => {
  const { t } = useLingui();

  return (
    <Section
      title={t`Reporting`}
      icon={<IconChartBar size={16} />}
      preserveHeight
    >
      <StyledComingSoonText>
        <Trans>Reporting coming soon</Trans>
      </StyledComingSoonText>
    </Section>
  );
};
