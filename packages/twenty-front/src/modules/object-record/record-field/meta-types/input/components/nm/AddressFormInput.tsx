import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { AddressInput } from '@/ui/field/input/components/AddressInput';

import { useAddressFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useAddressFieldDisplay';
import { useFieldValueAsDraft } from '@/object-record/record-field/meta-types/input/hooks/useFieldValueAsDraft';
import { useState } from 'react';
import { useRecordEdit } from '../../../../../../record-edit/contexts/RecordEditContext';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '../DateTimeFieldInput';

export type AddressFormInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const AddressFormInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: AddressFormInputProps) => {
  const { hotkeyScope, fieldDefinition } = useAddressField();

  const [draftValue, setDraftValue] = useState<
    FieldAddressDraftValue | undefined
  >();

  const { fieldValue } = useAddressFieldDisplay();

  const { updateField, getUpdatedFields } = useRecordEdit();

  // Custom hook to get the field value and initalize the draft value used by the input field
  useFieldValueAsDraft(fieldValue as FieldAddressDraftValue, setDraftValue);

  const updateFieldInStore = (newAddress: FieldAddressDraftValue) => {
    const address = convertToAddress(newAddress);
    updateField({
      fieldName: fieldDefinition.metadata.fieldName,
      value: address,
    });
  };

  const convertToAddress = (
    newAddress: FieldAddressDraftValue | undefined,
  ): FieldAddressDraftValue => {
    return {
      addressStreet1: newAddress?.addressStreet1 ?? '',
      addressStreet2: newAddress?.addressStreet2 ?? null,
      addressCity: newAddress?.addressCity ?? null,
      addressState: newAddress?.addressState ?? null,
      addressCountry: newAddress?.addressCountry ?? null,
      addressPostcode: newAddress?.addressPostcode ?? null,
      addressLat: newAddress?.addressLat ?? null,
      addressLng: newAddress?.addressLng ?? null,
    };
  };

  const handleEnter = (newAddress: FieldAddressDraftValue) => {
    updateFieldInStore(newAddress);
    onEnter?.(() => {});
  };

  const handleTab = (newAddress: FieldAddressDraftValue) => {
    updateFieldInStore(newAddress);
    onTab?.(() => {});
  };

  const handleShiftTab = (newAddress: FieldAddressDraftValue) => {
    updateFieldInStore(newAddress);
    onShiftTab?.(() => {});
  };

  const handleEscape = (newAddress: FieldAddressDraftValue) => {
    updateFieldInStore(newAddress);
    onEscape?.(() => {});
  };

  const handleChange = (newAddress: FieldAddressDraftValue) => {
    updateFieldInStore(newAddress);
    setDraftValue(convertToAddress(newAddress));
  };

  const editDraftValue = getUpdatedFields()[
    fieldDefinition.metadata.fieldName
  ] as FieldAddressDraftValue;

  return (
    <AddressInput
      listenToOutsideClick={false}
      autofocus={false}
      value={convertToAddress(editDraftValue || draftValue)}
      onClickOutside={(event) => {
        onClickOutside?.(() => {}, event);
      }}
      fullWidth={true}
      noPadding
      onEnter={handleEnter}
      onEscape={handleEscape}
      hotkeyScope={hotkeyScope}
      onChange={handleChange}
      onTab={handleTab}
      onShiftTab={handleShiftTab}
    />
  );
};
