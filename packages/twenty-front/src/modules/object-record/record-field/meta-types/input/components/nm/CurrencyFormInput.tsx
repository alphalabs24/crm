import { isNonEmptyString } from '@sniptt/guards';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

import { useCurrencyField } from '../../../hooks/useCurrencyField';

import { useFieldValueAsDraft } from '@/object-record/record-field/meta-types/input/hooks/useFieldValueAsDraft';
import { isFieldCurrencyValue } from '@/object-record/record-field/types/guards/isFieldCurrencyValue';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { useTheme } from '@emotion/react';
import { useCallback, useMemo, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
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

  const { updateField, getUpdatedFields } = useRecordEdit();

  const [draftValue, setDraftValue] = useState<
    | {
        amount: string;
        currencyCode: CurrencyCode;
      }
    | undefined
  >();

  const initialDraftValue = useMemo(() => {
    return {
      amount: ((fieldValue?.amountMicros ?? 0) / 1000000).toString(),
      currencyCode: fieldValue?.currencyCode ?? CurrencyCode.USD,
    };
  }, [fieldValue]);

  const theme = useTheme();

  const initialized = useFieldValueAsDraft(initialDraftValue, setDraftValue);

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
    (amountText: string) => {
      if (amountText === draftValue?.amount?.toString()) {
        return;
      }
      setDraftValue({
        amount: amountText,
        currencyCode,
      });
      const amount = parseFloat(amountText);

      const newCurrencyValue = {
        amountMicros: isNaN(amount)
          ? null
          : convertCurrencyAmountToCurrencyMicros(amount),
        currencyCode,
      };

      if (!isFieldCurrencyValue(newCurrencyValue)) {
        return;
      }
      updateField({
        fieldName,
        value: newCurrencyValue,
      });
    },
    [currencyCode, draftValue?.amount, fieldName, setDraftValue, updateField],
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
    setDraftValue({
      amount: isUndefinedOrNull(draftValue?.amount) ? '' : draftValue?.amount,
      currencyCode: newValue as CurrencyCode,
    });
    handleUpdateField(newValue);
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
