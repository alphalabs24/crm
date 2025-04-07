import { isNonEmptyString } from '@sniptt/guards';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

import { useCurrencyField } from '../../../hooks/useCurrencyField';

import { useFieldValueAsDraft } from '@/object-record/record-field/meta-types/input/hooks/useFieldValueAsDraft';
import { FieldCurrencyDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { useTheme } from '@emotion/react';
import { useCallback, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '../DateTimeFieldInput';

const SKELETON_LOADER_HEIGHT_SIZE = 32;

type CurrencyFormInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  maxWidth?: number;
};

export const CurrencyFormInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
  maxWidth,
}: CurrencyFormInputProps) => {
  const { fieldValue, hotkeyScope, defaultValue, fieldDefinition } =
    useCurrencyField();

  const { updateField, getUpdatedFields, draftValues, updateDraftValue } =
    useRecordEdit();

  const draftValue = useMemo(() => {
    return draftValues[
      fieldDefinition.metadata.fieldName
    ] as FieldCurrencyDraftValue;
  }, [draftValues, fieldDefinition.metadata.fieldName]);

  const initialDraftValue = useMemo(() => {
    return {
      amount: ((fieldValue?.amountMicros ?? 0) / 1000000).toString(),
      currencyCode: fieldValue?.currencyCode ?? CurrencyCode.USD,
    };
  }, [fieldValue]);

  const theme = useTheme();

  const initialized = useFieldValueAsDraft(
    fieldDefinition.metadata.fieldName,
    initialDraftValue,
    updateDraftValue,
  );

  const defaultCurrencyCodeWithoutSQLQuotes = (
    defaultValue as FieldCurrencyValue
  ).currencyCode.replace(/'/g, '') as CurrencyCode;

  const defaultCurrencyCodeIsNotEmpty = isNonEmptyString(
    defaultCurrencyCodeWithoutSQLQuotes,
  );

  const draftCurrencyCode = draftValue?.currencyCode;

  const draftCurrencyCodeIsEmptyIsNotEmpty =
    isNonEmptyString(draftCurrencyCode);

  const currencyCode = draftCurrencyCodeIsEmptyIsNotEmpty
    ? draftCurrencyCode
    : defaultCurrencyCodeIsNotEmpty
      ? defaultCurrencyCodeWithoutSQLQuotes
      : CurrencyCode.USD;

  const fieldName = fieldDefinition?.metadata?.fieldName;

  const handleUpdateField = useCallback(
    (amountText: string, newCurrencyCode?: CurrencyCode) => {
      const currencyToUse = newCurrencyCode ?? currencyCode;
      const shouldUpdateAmount = amountText !== draftValue?.amount?.toString();
      const shouldUpdateCurrency =
        newCurrencyCode && newCurrencyCode !== currencyCode;

      if (!shouldUpdateAmount && !shouldUpdateCurrency) {
        return;
      }

      updateDraftValue(fieldName, {
        amount: amountText,
        currencyCode: currencyToUse,
      });

      const amount = parseFloat(amountText);
      const newCurrencyValue = {
        amountMicros: isNaN(amount)
          ? null
          : convertCurrencyAmountToCurrencyMicros(amount),
        currencyCode: currencyToUse,
      };

      if (!isFieldCurrencyValue(newCurrencyValue)) {
        return;
      }

      updateField({
        fieldName,
        value: newCurrencyValue,
      });
    },
    [
      currencyCode,
      draftValue?.amount,
      fieldName,
      updateDraftValue,
      updateField,
    ],
  );

  const handleEnter = (newValue: string) => {
    onEnter?.(() => {
      handleUpdateField(newValue);
    });
  };

  const handleEscape = (newValue: string) => {
    onEscape?.(() => {
      handleUpdateField(newValue);
    });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: string,
  ) => {
    onClickOutside?.(() => {
      handleUpdateField(newValue);
    }, event);
  };

  const handleTab = (newValue: string) => {
    onTab?.(() => {
      handleUpdateField(newValue);
    });
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.(() => {
      handleUpdateField(newValue);
    });
  };

  const handleChange = (newValue: string) => {
    handleUpdateField(newValue);
  };

  const handleSelect = (newValue: string) => {
    const currentAmount = draftValue?.amount || '';
    handleUpdateField(currentAmount, newValue as CurrencyCode);
  };

  const editDraftValue = getUpdatedFields()[
    fieldDefinition.metadata.fieldName
  ] as FieldCurrencyValue | undefined;

  const initializedOrDraftEqualsFieldValue =
    initialized ||
    ((fieldValue?.amountMicros ?? 0) / 1000000).toString() ===
      draftValue?.amount?.toString() ||
    editDraftValue?.amountMicros?.toString() ===
      fieldValue?.amountMicros?.toString();

  return initializedOrDraftEqualsFieldValue ? (
    <CurrencyInput
      value={
        editDraftValue?.amountMicros
          ? ((editDraftValue?.amountMicros ?? 0) / 1000000).toString()
          : (draftValue?.amount?.toString() ?? '')
      }
      currencyCode={currencyCode}
      placeholder="Currency"
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onChange={handleChange}
      onSelect={handleSelect}
      hotkeyScope={hotkeyScope}
      maxWidth={maxWidth}
      dropdownId={`${fieldName}-currency-input-dropdown-id`}
    />
  ) : (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={maxWidth ?? 200} height={SKELETON_LOADER_HEIGHT_SIZE} />
    </SkeletonTheme>
  );
};
