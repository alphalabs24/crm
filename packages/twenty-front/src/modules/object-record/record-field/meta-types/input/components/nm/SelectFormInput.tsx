import { useSelectField } from '@/object-record/record-field/meta-types/hooks/useSelectField';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { useRecordEditContainerContext } from '@/record-edit/contexts/RecordEditContainerContext';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { SelectOption } from '@/spreadsheet-import/types';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared';

type SelectFormInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const SelectFormInput = ({
  onSubmit,
  onCancel,
}: SelectFormInputProps) => {
  const { fieldDefinition, hotkeyScope } = useSelectField();

  const { cleanUpdatedFields } = useRecordEditContainerContext();

  const { updateField, getUpdatedFields } = useRecordEdit();

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SINGLE_RECORD_SELECT_BASE_LIST,
  );

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) =>
      option.value === getUpdatedFields()[fieldDefinition.metadata.fieldName],
  );
  // handlers
  const handleClearField = () => {
    cleanUpdatedFields();
    updateField({
      fieldName: fieldDefinition.metadata.fieldName,
      value: null,
    });
    onCancel?.();
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.(() => {
      cleanUpdatedFields();
      updateField({
        fieldName: fieldDefinition.metadata.fieldName,
        value: option?.value,
      });
    });

    resetSelectedItem();
  };

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
      resetSelectedItem();
    },
    hotkeyScope,
    [onCancel, resetSelectedItem],
  );

  const optionIds = [
    `No ${fieldDefinition.label}`,
    ...filteredOptions.map((option) => option.value),
  ];

  return (
    <SelectInput
      selectableListId={SINGLE_RECORD_SELECT_BASE_LIST}
      selectableItemIdArray={optionIds}
      hotkeyScope={hotkeyScope}
      onEnter={(itemId) => {
        const option = filteredOptions.find(
          (option) => option.value === itemId,
        );
        if (isDefined(option)) {
          onSubmit?.(() =>
            updateField({
              fieldName: fieldDefinition.metadata.fieldName,
              value: option?.value,
            }),
          );
          resetSelectedItem();
        }
      }}
      onOptionSelected={handleSubmit}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      defaultOption={selectedOption}
      onFilterChange={setFilteredOptions}
      onClear={
        fieldDefinition.metadata.isNullable ? handleClearField : undefined
      }
      clearLabel={fieldDefinition.label}
    />
  );
};
