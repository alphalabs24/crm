import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import {
  IconChevronDown,
  IconTrash,
} from '@ui/display/icon/components/TablerIcons';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Button } from '@ui/input/button/components/Button';
import { IconButton } from '@ui/input/button/components/IconButton';
import { useState } from 'react';
import { MenuItem } from 'twenty-ui';
import styled from '@emotion/styled';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledPrimaryActionButton = styled(Button)`
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
`;

const StyledIconButton = styled(IconButton)`
  border-bottom-left-radius: 0px;
  border-top-left-radius: 0px;
`;

type ActionDropdownActionType = {
  title: string;
  Icon?: IconComponent;
  onClick: () => void;
  distructive?: boolean;
  disabled?: boolean;
};

type ActionDropdownProps = {
  actions: ActionDropdownActionType[];
  primaryAction: ActionDropdownActionType | null;
  dropdownId: string;
};

export const ActionDropdown = ({
  actions,
  primaryAction,
  dropdownId,
}: ActionDropdownProps) => {
  const [showingOptions, setShowingOptions] = useState(false);
  const { closeDropdown } = useDropdown(dropdownId);

  if (!primaryAction) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledPrimaryActionButton
        title={primaryAction.title}
        Icon={primaryAction.Icon}
        accent={primaryAction.distructive ? 'danger' : 'blue'}
        onClick={primaryAction.onClick}
        size="small"
      />
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <StyledIconButton
            Icon={IconChevronDown}
            onClick={() => setShowingOptions(!showingOptions)}
            size="small"
            variant="primary"
            accent="blue"
          />
        }
        dropdownMenuWidth={160}
        dropdownComponents={actions.map((action) => (
          <DropdownMenuItemsContainer>
            <MenuItem
              text={action.title}
              LeftIcon={action.Icon}
              onClick={() => {
                action.onClick();
                closeDropdown();
              }}
              disabled={action.disabled}
              accent={action.distructive ? 'danger' : 'default'}
            />
          </DropdownMenuItemsContainer>
        ))}
        dropdownHotkeyScope={{ scope: dropdownId }}
      />
    </StyledContainer>
  );
};
