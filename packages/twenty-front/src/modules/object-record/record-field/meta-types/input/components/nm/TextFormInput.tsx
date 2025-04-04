import { useTextField } from '@/object-record/record-field/meta-types/hooks/useTextField';
import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { useFieldValueAsDraft } from '@/object-record/record-field/meta-types/input/hooks/useFieldValueAsDraft';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextAreaFormInput } from '@/ui/field/input/components/TextAreaFormInput';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useMemo } from 'react';
import { IconComponent } from 'twenty-ui';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '../DateTimeFieldInput';

export type TextFormInputProps = {
  Icon?: IconComponent;
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const TextFormInput = ({
  Icon,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TextFormInputProps) => {
  const { fieldDefinition, hotkeyScope, maxWidth, formType } = useTextField();

  const { fieldValue } = useTextFieldDisplay();

  const { updateField, getUpdatedFields, draftValues, updateDraftValue } =
    useRecordEdit();

  const draftValue = useMemo(() => {
    return draftValues[fieldDefinition.metadata.fieldName];
  }, [draftValues, fieldDefinition.metadata.fieldName]);

  const initialized = useFieldValueAsDraft(
    fieldDefinition.metadata.fieldName,
    turnIntoUndefinedIfWhitespacesOnly(fieldValue) ?? '',
    updateDraftValue,
  );

  const updateFieldInStore = (newText: string) => {
    const trimmedValue = newText.trim();
    updateField({
      fieldName: fieldDefinition.metadata.fieldName,
      value: turnIntoUndefinedIfWhitespacesOnly(trimmedValue) ?? '',
    });
  };

  const handleEnter = (newText: string) => {
    updateFieldInStore(newText);
    onEnter?.(() => {});
  };

  const handleEscape = (newText: string) => {
    updateFieldInStore(newText);
    onEscape?.(() => {});
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    updateFieldInStore(newText);
    onClickOutside?.(() => {}, event);
  };

  const handleTab = (newText: string) => {
    updateFieldInStore(newText);
    onTab?.(() => {});
  };

  const handleShiftTab = (newText: string) => {
    updateFieldInStore(newText);
    onShiftTab?.(() => {});
  };

  const handleChange = (newText: string) => {
    const value = turnIntoUndefinedIfWhitespacesOnly(newText);
    updateDraftValue(fieldDefinition.metadata.fieldName, value);
    updateFieldInStore(value ?? '');
  };

  return (
    <FieldInputContainer minWidth={maxWidth}>
      {initialized ||
      fieldValue === draftValue ||
      (getUpdatedFields()[fieldDefinition.metadata.fieldName] === draftValue &&
        draftValue) ? (
        formType === 'multiLine' ? (
          <TextAreaFormInput
            placeholder={fieldDefinition.metadata.placeHolder}
            value={draftValue?.toString() || ''}
            onClickOutside={handleClickOutside}
            onEnter={handleEnter}
            onEscape={handleEscape}
            onShiftTab={handleShiftTab}
            onTab={handleTab}
            hotkeyScope={hotkeyScope}
            onChange={handleChange}
            copyButton={false}
            maxWidth={maxWidth}
            fullWidth={!maxWidth}
            minHeight={65}
          />
        ) : (
          <TextInputV2
            placeholder={fieldDefinition.metadata.placeHolder}
            value={draftValue?.toString() ?? ''}
            onChange={handleChange}
            width={maxWidth}
            LeftIcon={Icon}
            fullWidth={!maxWidth}
          />
        )
      ) : formType === 'multiLine' ? null : (
        <TextInputV2
          placeholder={fieldDefinition.metadata.placeHolder}
          value={''}
          onChange={handleChange}
          width={maxWidth}
          LeftIcon={Icon}
          fullWidth={!maxWidth}
        />
      )}
    </FieldInputContainer>
  );
};
