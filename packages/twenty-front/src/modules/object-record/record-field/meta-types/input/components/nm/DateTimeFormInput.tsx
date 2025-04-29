import { DateInput } from '@/ui/field/input/components/DateInput';
import { isDefined } from 'twenty-shared';
import { Nullable } from 'twenty-ui';

import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { useDateTimeField } from '../../../hooks/useDateTimeField';

export type FieldInputEvent = (persist: () => void) => void;
export type FieldInputClickOutsideEvent = (
  persist: () => void,
  event: MouseEvent | TouchEvent,
) => void;

export type DateTimeFormInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onClear?: FieldInputEvent;
  onSubmit?: FieldInputEvent;
};

export const DateTimeFormInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onClear,
  onSubmit,
}: DateTimeFormInputProps) => {
  const { fieldValue, hotkeyScope, fieldDefinition } = useDateTimeField();

  const { getUpdatedFields, updateField } = useRecordEdit();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      updateField({
        fieldName: fieldDefinition.metadata.fieldName,
        value: null,
      });
    } else {
      const newDateISO = newDate?.toISOString();

      updateField({
        fieldName: fieldDefinition.metadata.fieldName,
        value: newDateISO,
      });
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.(() => persistDate(newDate));
  };

  const handleChange = (newDate: Nullable<Date>) => {
    persistDate(newDate);
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

  const handleClear = () => {
    onClear?.(() => persistDate(null));
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.(() => persistDate(newDate));
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
      onChange={handleChange}
      value={dateValue}
      clearable
      isDateTimeInput
      onClear={handleClear}
      onSubmit={handleSubmit}
      hotkeyScope={hotkeyScope}
    />
  );
};
