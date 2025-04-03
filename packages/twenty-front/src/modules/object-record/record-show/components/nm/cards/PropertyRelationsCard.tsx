import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineEntry } from '@/object-record/record-inline-cell/components/nm/RecordInlineEntry';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconUsers } from 'twenty-ui';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBottomBorder = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

type PropertyRelationsCardProps = {
  record: any;
  loading?: boolean;
  objectMetadataItem: ObjectMetadataItem;
};

const RELATION_FIELDS = ['agency', 'assignee', 'seller'];

export const PropertyRelationsCard = ({
  record,
  loading = false,
  objectMetadataItem,
}: PropertyRelationsCardProps) => {
  const { t } = useLingui();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: record.id,
    recordFromStore: record,
  });

  const { recordFromStore } = useRecordShowContainerData({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: record.id,
  });

  const isDefinedInRecord = (field: string) => {
    return (
      recordFromStore?.[field] !== undefined &&
      recordFromStore?.[field] !== null
    );
  };

  if (loading) {
    return null;
  }

  const relationFields = objectMetadataItem.fields.filter((field) =>
    RELATION_FIELDS.includes(field.name),
  );

  if (relationFields.length === 0) return null;

  return (
    <Section title={t`Stakeholders`} icon={<IconUsers size={16} />}>
      <StyledContent>
        {relationFields.map((field, index) => (
          <div key={field.id}>
            <FieldContext.Provider
              value={{
                recordId: record.id,
                maxWidth: 200,
                recoilScopeId: record.id + field.id,
                isLabelIdentifier: false,
                fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                  field,
                  position: index,
                  objectMetadataItem,
                  showLabel: true,
                  labelWidth: 90,
                }),
                useUpdateRecord: useUpdateOneObjectRecordMutation,
                hotkeyScope: InlineCellHotkeyScope.InlineCell,
              }}
            >
              <RecordInlineEntry
                loading={loading}
                isRequired={
                  !isDefinedInRecord(field.name) &&
                  RELATION_FIELDS.includes(field.name)
                }
              />
            </FieldContext.Provider>
            {index < relationFields.length - 1 && <StyledBottomBorder />}
          </div>
        ))}
      </StyledContent>
    </Section>
  );
};
