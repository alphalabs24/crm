import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useSearchParams } from 'react-router-dom';
import { IconChevronDown } from 'twenty-ui';

import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { FilterDropdownObjectTypeContext } from '@/object-record/object-filter-dropdown/contexts/FilterDropdownObjectTypeContext';
import { FilterDropdownScopeContext } from '@/object-record/object-filter-dropdown/contexts/FilterDropdownScopeContext';
import { FilterDropdownSearchInputContext } from '@/object-record/object-filter-dropdown/contexts/FilterDropdownSearchInputContext';
import { filterDropdownSearchInputScopedState } from '@/object-record/object-filter-dropdown/states/filterDropdownSearchInputScopedState';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import styled from '@emotion/styled';

const INQUIRIES_FILTER_DROPDOWN_ID = 'inquiries-filter-dropdown';

const StyledFilterButton = styled(StyledHeaderDropdownButton)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  background: none;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledFilterOption = styled.button<{ isSelected?: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

export const InquiriesFilterDropdown = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(
      filterDropdownSearchInputScopedState,
      INQUIRIES_FILTER_DROPDOWN_ID,
    );

  const handleFilterSelect = (type: 'property' | 'publication') => {
    setSearchParams((params) => {
      const newParams = new URLSearchParams(params);
      newParams.delete('propertyId');
      newParams.delete('publicationId');
      return newParams;
    });
  };

  return (
    <FilterDropdownScopeContext.Provider value={INQUIRIES_FILTER_DROPDOWN_ID}>
      <FilterDropdownObjectTypeContext.Provider value="inquiries">
        <FilterDropdownSearchInputContext.Provider
          value={{
            searchInput: filterDropdownSearchInput,
            setSearchInput: setFilterDropdownSearchInput,
          }}
        >
          <Dropdown
            dropdownId={INQUIRIES_FILTER_DROPDOWN_ID}
            dropdownOffset={{ x: 0, y: 8 }}
            dropdownHotkeyScope={{
              scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
            }}
            clickableComponent={
              <StyledFilterButton>
                {t`Filter by`}
                <IconChevronDown size={theme.icon.size.md} />
              </StyledFilterButton>
            }
            dropdownComponents={
              <>
                <ObjectFilterDropdownSearchInput />
                <DropdownMenuSeparator />
                <StyledFilterOption
                  onClick={() => handleFilterSelect('property')}
                  isSelected={!!searchParams.get('propertyId')}
                >
                  {t`Filter by Property`}
                </StyledFilterOption>
                <StyledFilterOption
                  onClick={() => handleFilterSelect('publication')}
                  isSelected={!!searchParams.get('publicationId')}
                >
                  {t`Filter by Publication`}
                </StyledFilterOption>
                <DropdownMenuSeparator />
                <ObjectFilterDropdownRecordSelect
                  viewComponentId={INQUIRIES_FILTER_DROPDOWN_ID}
                />
              </>
            }
          />
        </FilterDropdownSearchInputContext.Provider>
      </FilterDropdownObjectTypeContext.Provider>
    </FilterDropdownScopeContext.Provider>
  );
};
