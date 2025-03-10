import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';

type MultiSelectFormInputProps = {
  onCancel?: () => void;
};

export const MultiSelectFormInput = ({
  onCancel,
}: MultiSelectFormInputProps) => {
  const { fieldDefinition, fieldValues, hotkeyScope } = useMultiSelectField();

  const { updateField, getUpdatedFields } = useRecordEdit();

  const handleUpdate = (value: FieldMultiSelectValue) => {
    updateField({
      fieldName: fieldDefinition.metadata.fieldName,
      value: value,
    });
  };

  const valuesToShow = (getUpdatedFields()[
    fieldDefinition.metadata.fieldName
  ] ?? fieldValues) as FieldMultiSelectValue;

  return (
    <MultiSelectInput
      hotkeyScope={hotkeyScope}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={handleUpdate}
      values={valuesToShow}
    />
  );
};
