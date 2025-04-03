import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconBuilding } from 'twenty-ui';

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

type PropertyDetailsCardProps = {
  record: any;
  loading?: boolean;
  objectMetadataItem: ObjectMetadataItem;
};

const FIELD_GROUPS = {
  'Key Details': ['category', 'constructionYear', 'refProperty'],
  'Physical Details': ['surface', 'livingSurface', 'rooms', 'floor'],
  Financial: ['offerType', 'sellingPrice', 'rentNet'],
  Availability: ['availableFrom', 'stage'],
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

  if (loading) {
    return null;
  }

  // Group fields by predefined categories and filter out empty values
  const groupedFields = objectMetadataItem.fields.reduce(
    (acc, field) => {
      // Skip fields that are already shown in the overview or not in our groups
      if (['name', 'address'].includes(field.name)) {
        return acc;
      }

      // Find which group this field belongs to
      const group = Object.entries(FIELD_GROUPS).find(([_, fields]) =>
        fields.includes(field.name),
      )?.[0];

      // Skip if field is not in any group
      if (!group) return acc;

      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(field);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <Section title={t`Details`} icon={<IconBuilding size={16} />}>
      <StyledContent>
        {Object.entries(groupedFields).map(([groupTitle, fields]) => (
          <StyledDetailGroup key={groupTitle}>
            <StyledDetailGroupTitle>{groupTitle}</StyledDetailGroupTitle>
            {fields.map((field) => {
              const value = formatFieldValue(field, record[field.name]);

              return (
                <StyledDetailItem key={field.name}>
                  <StyledDetailLabel>{field.label}</StyledDetailLabel>
                  <StyledDetailValue>{value || t`Empty`}</StyledDetailValue>
                </StyledDetailItem>
              );
            })}
          </StyledDetailGroup>
        ))}
      </StyledContent>
    </Section>
  );
};
