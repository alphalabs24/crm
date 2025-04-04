import { useNumberField } from '@/object-record/record-field/meta-types/hooks/useNumberField';
import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { useFieldValueAsDraft } from '@/object-record/record-field/meta-types/input/hooks/useFieldValueAsDraft';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useState } from 'react';
import { IconComponent } from 'twenty-ui';

export const NumberFormInput = ({ icon }: { icon?: IconComponent }) => {
  const { fieldDefinition, maxWidth } = useNumberField();
  const [draftValue, setDraftValue] = useState<number | string | undefined>();

  const { fieldValue } = useNumberFieldDisplay();

  // Makes sure no empty field is created, since the value is only initialized once in the child component
  const initialized = useFieldValueAsDraft(
    fieldValue?.toString() ?? '',
    setDraftValue,
  );

  const { updateField, getUpdatedFields } = useRecordEdit();

  // Save the field in the store to update once the form is submitted
  const updateFieldInStore = (newText: number | string | null) => {
    updateField({
      fieldName: fieldDefinition.metadata.fieldName,
      value: newText,
    });
  };

  const handleChange = (newText: string) => {
    if (newText.length === 0) {
      setDraftValue(newText);
      updateFieldInStore(null);
      return;
    }

    // Allow numbers including:
    // - Whole numbers (e.g., "2")
    // - Decimals starting with a dot (e.g., ".5")
    // - Numbers with a decimal part (e.g., "2.5")
    if (/^\d*\.?\d*$/.test(newText)) {
      setDraftValue(newText);

      // Only update store if the input isn't just "." or ends with "."
      if (newText !== '.' && !newText.endsWith('.')) {
        const parsedValue = parseFloat(newText);
        if (!isNaN(parsedValue)) {
          updateFieldInStore(parsedValue);
        }
      } else {
        updateFieldInStore(newText);
      }
    }
  };

  const editDraftValue = getUpdatedFields()[fieldDefinition.metadata.fieldName];

  const isInitializedOrDraftEqualsValue =
    initialized ||
    draftValue === fieldValue?.toString() ||
    editDraftValue === fieldValue?.toString();

  return (
    <FieldInputContainer minWidth={maxWidth}>
      {isInitializedOrDraftEqualsValue ? (
        <TextInputV2
          placeholder={fieldDefinition.metadata.placeHolder}
          value={(editDraftValue || draftValue)?.toString() ?? ''}
          LeftIcon={icon}
          onChange={handleChange}
          width={maxWidth}
        />
      ) : (
        <TextInputV2
          placeholder={fieldDefinition.metadata.placeHolder}
          value={''}
          onChange={handleChange}
          width={maxWidth}
          LeftIcon={icon}
        />
      )}
    </FieldInputContainer>
  );
};
