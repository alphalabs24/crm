import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { usePropertyDetailsFields } from '@/object-record/hooks/usePropertyDetailsFields';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { SelectOption } from '@/spreadsheet-import/types';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconBuilding, Tag } from 'twenty-ui';

const StyledContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledDetailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDetailLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledDetailValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// Define fixed group order
const GROUP_ORDER = [
  'Key Details',
  'Space Details',
  'Object Info',
  'Financial',
  'Features',
] as const;

const GROUP_LABELS = {
  'Key Details': <Trans>Key Details</Trans>,
  'Space Details': <Trans>Space Details</Trans>,
  'Object Info': <Trans>Object Info</Trans>,
  Financial: <Trans>Financial</Trans>,
  Features: <Trans>Features</Trans>,
} as const;

type GroupTitle = (typeof GROUP_ORDER)[number];
type GroupedFields = Record<GroupTitle, FieldMetadataItem[]>;

type PropertyDetailsCardProps = {
  record: any;
  loading?: boolean;
  objectMetadataItem: ObjectMetadataItem;
};

const renderFeaturesTags = (field: FieldMetadataItem, values: string[]) => {
  if (!field.options || !Array.isArray(field.options)) {
    return values.map((value, index) => (
      <Tag key={index} color="gray" text={value} preventShrink />
    ));
  }

  const options = field.options as SelectOption[];
  return values
    .map((value) => {
      const option = options.find((opt) => opt.value === value);
      if (!option) return null;

      return (
        <Tag
          key={value}
          color={option.color ?? 'gray'}
          text={option.label}
          Icon={option.icon || undefined}
          preventShrink
        />
      );
    })
    .filter(Boolean);
};

export const PropertyDetailsCard = ({
  record,
  loading = false,
  objectMetadataItem,
}: PropertyDetailsCardProps) => {
  const { t } = useLingui();
  const { formatFieldValue } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  const fieldGroups = usePropertyDetailsFields(record);

  if (loading) {
    return null;
  }

  // Group fields by predefined categories and filter out empty values
  const groupedFields = objectMetadataItem.fields.reduce((acc, field) => {
    // Skip fields that are already shown in the overview or not in our groups
    if (['name', 'address', 'description'].includes(field.name)) {
      return acc;
    }

    // Find which group this field belongs to
    const group = Object.entries(fieldGroups).find(([_, group]) =>
      group.fields.includes(field.name),
    )?.[0] as GroupTitle | undefined;

    // Skip if field is not in any group
    if (!group) return acc;

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as GroupedFields);

  // Sort fields within each group by label
  Object.values(groupedFields).forEach((fields) => {
    fields.sort((a, b) => a.label.localeCompare(b.label));
  });

  // Sort groups according to fixed order and translate group titles
  const sortedGroups = GROUP_ORDER.filter(
    (groupTitle) => groupedFields[groupTitle]?.length > 0,
  ).map((groupTitle) => [groupTitle, groupedFields[groupTitle]] as const);

  const renderFieldValue = (field: FieldMetadataItem, value: any) => {
    if (field.name === 'features' && Array.isArray(value)) {
      return (
        <StyledTagContainer>
          {renderFeaturesTags(field, value)}
        </StyledTagContainer>
      );
    }

    return (
      <StyledDetailValue>
        {formatFieldValue(field, value) || t`Empty`}
      </StyledDetailValue>
    );
  };

  return (
    <Section title={t`Details`} icon={<IconBuilding size={16} />}>
      <StyledContent>
        {sortedGroups.map(([groupTitle, fields]) => (
          <StyledDetailGroup key={groupTitle}>
            <StyledDetailGroupTitle>
              {GROUP_LABELS[groupTitle]}
            </StyledDetailGroupTitle>
            {fields.map((field: FieldMetadataItem) => (
              <StyledDetailItem key={field.name}>
                {field.name === 'features' ? null : (
                  <StyledDetailLabel>{field.label}</StyledDetailLabel>
                )}
                {renderFieldValue(field, record[field.name])}
              </StyledDetailItem>
            ))}
          </StyledDetailGroup>
        ))}
      </StyledContent>
    </Section>
  );
};
