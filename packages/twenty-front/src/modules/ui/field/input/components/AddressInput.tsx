import styled from '@emotion/styled';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { useDebounce } from 'use-debounce';

import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { MOBILE_VIEWPORT } from 'twenty-ui';
import { getEnv } from '~/utils/get-env';

const StyledAddressContainer = styled.div<{
  noPadding?: boolean;
  fullWidth?: boolean;
}>`
  padding: ${(p) => (p.noPadding ? 0 : `4px 8px`)};
  position: relative;
  width: ${(p) => (p.fullWidth ? '100%' : '344px')};
  > div {
    margin-bottom: 6px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: auto;
    min-width: 100px;
    max-width: 200px;
    overflow: hidden;
    > div {
      margin-bottom: 8px;
    }
  }
`;

const StyledHalfRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    > div {
      margin-bottom: 7px;
    }
  }
`;

const StyledSuggestionsContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  left: ${({ theme }) => theme.spacing(2)};
  margin-top: -${({ theme }) => theme.spacing(1)};
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

const StyledSuggestion = styled.div<{ isHighlighted: boolean }>`
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(2)};
  transition: all 0.1s ease-in-out;
  color: ${({ theme }) => theme.font.color.primary};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    `
    background: ${theme.background.tertiary};
    color: ${theme.font.color.primary};
  `}
`;

// Add country mapping
const COUNTRY_MAPPING: Record<string, string> = {
  CH: 'Switzerland',
  DE: 'Germany',
  IT: 'Italy',
  FR: 'France',
};

export type AddressInputProps = {
  value: FieldAddressValue;
  onTab: (newAddress: FieldAddressDraftValue) => void;
  onShiftTab: (newAddress: FieldAddressDraftValue) => void;
  onEnter: (newAddress: FieldAddressDraftValue) => void;
  onEscape: (newAddress: FieldAddressDraftValue) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => void;
  hotkeyScope: string;
  clearable?: boolean;
  onChange?: (updatedValue: FieldAddressDraftValue) => void;
  autofocus?: boolean;
  listenToOutsideClick?: boolean;
  fullWidth?: boolean;
  noPadding?: boolean;
};

const apiKey = getEnv('REACT_APP_MAPBOX_ACCESS_TOKEN');

export const AddressInput = ({
  value,
  autofocus = true,
  hotkeyScope,
  onTab,
  onShiftTab,
  listenToOutsideClick = true,
  onEnter,
  onEscape,
  onClickOutside,
  onChange,
  fullWidth,
  noPadding,
}: AddressInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const addressStreet1InputRef = useRef<HTMLInputElement>(null);
  const addressStreet2InputRef = useRef<HTMLInputElement>(null);
  const addressCityInputRef = useRef<HTMLInputElement>(null);
  const addressStateInputRef = useRef<HTMLInputElement>(null);
  const addressPostCodeInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm] = useDebounce(internalValue.addressStreet1, 300);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRefs: {
    [key in keyof FieldAddressDraftValue]?: RefObject<HTMLInputElement>;
  } = {
    addressStreet1: addressStreet1InputRef,
    addressStreet2: addressStreet2InputRef,
    addressCity: addressCityInputRef,
    addressState: addressStateInputRef,
    addressPostcode: addressPostCodeInputRef,
  };

  const [focusPosition, setFocusPosition] =
    useState<keyof FieldAddressDraftValue>('addressStreet1');

  const { closeDropdown: closeCountryDropdown } = useDropdown(
    SELECT_COUNTRY_DROPDOWN_ID,
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  const getChangeHandler =
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      const updatedAddress = { ...value, [field]: updatedAddressPart };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    };

  const getFocusHandler = (fieldName: keyof FieldAddressDraftValue) => () => {
    setFocusPosition(fieldName);

    inputRefs[fieldName]?.current?.focus();
  };

  useScopedHotkeys(
    'tab',
    () => {
      const currentFocusPosition = Object.keys(inputRefs).findIndex(
        (key) => key === focusPosition,
      );
      const maxFocusPosition = Object.keys(inputRefs).length - 1;

      const nextFocusPosition = currentFocusPosition + 1;

      const isFocusPositionAfterLast = nextFocusPosition > maxFocusPosition;

      if (isFocusPositionAfterLast) {
        onTab?.(internalValue);
      } else {
        const nextFocusFieldName = Object.keys(inputRefs)[
          nextFocusPosition
        ] as keyof FieldAddressDraftValue;

        setFocusPosition(nextFocusFieldName);
        inputRefs[nextFocusFieldName]?.current?.focus();
      }
    },
    hotkeyScope,
    [onTab, internalValue, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      const currentFocusPosition = Object.keys(inputRefs).findIndex(
        (key) => key === focusPosition,
      );

      const nextFocusPosition = currentFocusPosition - 1;

      const isFocusPositionBeforeFirst = nextFocusPosition < 0;

      if (isFocusPositionBeforeFirst) {
        onShiftTab?.(internalValue);
      } else {
        const nextFocusFieldName = Object.keys(inputRefs)[
          nextFocusPosition
        ] as keyof FieldAddressDraftValue;

        setFocusPosition(nextFocusFieldName);
        inputRefs[nextFocusFieldName]?.current?.focus();
      }
    },
    hotkeyScope,
    [onTab, internalValue, focusPosition],
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEnter(internalValue);
    },
    hotkeyScope,
    [onEnter, internalValue],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onEscape(internalValue);
    },
    hotkeyScope,
    [onEscape, internalValue],
  );

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      if (activeDropdownFocusId === SELECT_COUNTRY_DROPDOWN_ID) {
        return;
      }

      if (listenToOutsideClick) {
        event.stopImmediatePropagation();
      }

      closeCountryDropdown();
      onClickOutside?.(event, internalValue);
    },
    enabled: isDefined(onClickOutside),
    listenerId: 'address-input',
  });

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);

    // Find country and get country code
    const country = suggestion.context?.find((ctx: any) =>
      ctx.id.startsWith('country.'),
    );
    const countryCode = country?.short_code?.toUpperCase();

    // Get full address components
    const fullAddress = suggestion.place_name?.split(',')[0] || ''; // This gets the full street address with number
    const contextItems = suggestion.context || [];

    // Find address components
    const street = contextItems.find((ctx: any) => ctx.id.includes('address'));
    const city = contextItems.find((ctx: any) => ctx.id.includes('place'));
    const state = contextItems.find((ctx: any) => ctx.id.includes('region'));
    const postcode = contextItems.find((ctx: any) =>
      ctx.id.includes('postcode'),
    );

    // Only set address2 if there's additional address info
    const hasSecondaryAddress = street?.text && street.text !== fullAddress;

    const newValue = {
      ...internalValue,
      addressStreet1: fullAddress,
      addressStreet2: hasSecondaryAddress ? street?.text || '' : '',
      addressCity: city?.text || '',
      addressState: state?.text || '',
      addressPostcode: postcode?.text || '',
      addressCountry: COUNTRY_MAPPING[countryCode] || '',
      addressLat: suggestion.geometry.coordinates[1],
      addressLng: suggestion.geometry.coordinates[0],
    };

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || !apiKey) return;

      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchTerm,
      )}.json?access_token=${apiKey}&types=address&country=ch,de,fr,it&proximity=8.5417,47.3769&limit=5`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  const handleStreet1Focus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    }
    getFocusHandler('addressStreet1')();
  };

  const handleStreet1Blur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleStreet1Change = (value: string) => {
    getChangeHandler('addressStreet1')(value);
    if (value) {
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Add keyboard handling
  useScopedHotkeys(
    'down',
    () => {
      if (showSuggestions && suggestions.length > 0) {
        setHighlightedIndex((current) =>
          current < suggestions.length - 1 ? current + 1 : current,
        );
      }
    },
    hotkeyScope,
    [showSuggestions, suggestions.length],
  );

  useScopedHotkeys(
    'up',
    () => {
      if (showSuggestions && suggestions.length > 0) {
        setHighlightedIndex((current) => (current > 0 ? current - 1 : 0));
      }
    },
    hotkeyScope,
    [showSuggestions, suggestions.length],
  );

  return (
    <StyledAddressContainer
      ref={wrapperRef}
      noPadding={noPadding}
      fullWidth={fullWidth}
    >
      <TextInputV2
        autoFocus={autofocus}
        value={internalValue.addressStreet1 ?? ''}
        ref={inputRefs['addressStreet1']}
        label="ADDRESS 1"
        fullWidth
        onChange={handleStreet1Change}
        onFocus={handleStreet1Focus}
        onBlur={handleStreet1Blur}
      />
      {showSuggestions && suggestions.length > 0 && (
        <StyledSuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <StyledSuggestion
              key={suggestion.id}
              isHighlighted={index === highlightedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion.place_name}
            </StyledSuggestion>
          ))}
        </StyledSuggestionsContainer>
      )}
      <TextInputV2
        value={internalValue.addressStreet2 ?? ''}
        ref={inputRefs['addressStreet2']}
        label="ADDRESS 2"
        fullWidth
        onChange={getChangeHandler('addressStreet2')}
        onFocus={getFocusHandler('addressStreet2')}
      />
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressCity ?? ''}
          ref={inputRefs['addressCity']}
          label="CITY"
          fullWidth
          onChange={getChangeHandler('addressCity')}
          onFocus={getFocusHandler('addressCity')}
        />
        <TextInputV2
          value={internalValue.addressState ?? ''}
          ref={inputRefs['addressState']}
          label="STATE"
          fullWidth
          onChange={getChangeHandler('addressState')}
          onFocus={getFocusHandler('addressState')}
        />
      </StyledHalfRowContainer>
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressPostcode ?? ''}
          ref={inputRefs['addressPostcode']}
          label="POST CODE"
          fullWidth
          onChange={getChangeHandler('addressPostcode')}
          onFocus={getFocusHandler('addressPostcode')}
        />
        <CountrySelect
          label="COUNTRY"
          onChange={getChangeHandler('addressCountry')}
          selectedCountryName={internalValue.addressCountry ?? ''}
        />
      </StyledHalfRowContainer>
    </StyledAddressContainer>
  );
};
