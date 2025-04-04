import { Nullable } from 'twenty-ui';

import { useDateField } from '@/object-record/record-field/meta-types/hooks/useDateField';
import { DateInput } from '@/ui/field/input/components/DateInput';

import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { isDefined } from 'twenty-shared';

type FieldInputEvent = (persist: () => void) => void;

type DateFormInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onClear?: FieldInputEvent;
  onSubmit?: FieldInputEvent;
};

export const DateFormInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onClear,
  onSubmit,
}: DateFormInputProps) => {
  const { fieldValue, hotkeyScope, fieldDefinition } = useDateField();

  const { getUpdatedFields, updateField } = useRecordEdit();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      updateField({
        fieldName: fieldDefinition.metadata.fieldName,
        value: null,
      });
    } else {
      const month = newDate?.getMonth();
      const newDateWithoutTime = `${newDate?.getFullYear()}-${(month + 1)
        .toString()
        .padStart(2, '0')}-${newDate?.getDate().toString().padStart(2, '0')}`;

      updateField({
        fieldName: fieldDefinition.metadata.fieldName,
        value: newDateWithoutTime,
      });
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.(() => persistDate(newDate));
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.(() => persistDate(newDate));
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    onEscape?.(() => persistDate(newDate));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    onClickOutside?.(() => persistDate(newDate), event);
  };

  const handleChange = (newDate: Nullable<Date>) => {
    persistDate(newDate);
  };

  const handleClear = () => {
    onClear?.(() => persistDate(null));
  };

  const draftField = getUpdatedFields()[fieldDefinition.metadata.fieldName];

  const dateValue = draftField
    ? new Date(draftField as string)
    : fieldValue
      ? new Date(fieldValue)
      : null;

  return (
    <DateInput
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable
      onChange={handleChange}
      onClear={handleClear}
      onSubmit={handleSubmit}
      hotkeyScope={hotkeyScope}
    />
  );
};
