import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import {
  IconChevronDown,
  IconDotsVertical,
} from '@ui/display/icon/components/TablerIcons';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Button } from '@ui/input/button/components/Button';
import { IconButton } from '@ui/input/button/components/IconButton';
import { useState } from 'react';
import { MenuItem } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledPrimaryActionButton = styled(Button)<{
  hasSecondaryAction: boolean;
}>`
  border-bottom-right-radius: ${({ hasSecondaryAction, theme }) =>
    hasSecondaryAction ? '0px' : theme.border.radius.sm};
  border-top-right-radius: ${({ hasSecondaryAction, theme }) =>
    hasSecondaryAction ? '0px' : theme.border.radius.sm};
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
  const { t } = useLingui();
  // If there's no primary action but we have secondary actions,
  // display a single dropdown button
  if (!primaryAction && actions.length > 0) {
    return (
      <Dropdown
        dropdownId={dropdownId}
        dropdownMenuWidth={260}
        clickableComponent={
          <Button
            title={t`More`}
            Icon={IconDotsVertical}
            onClick={() => setShowingOptions(!showingOptions)}
            size="small"
          />
        }
        dropdownComponents={actions.map((action) => (
          <DropdownMenuItemsContainer key={action.title}>
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
    );
  }

  // If no primary action and no secondary actions, don't show anything
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
        hasSecondaryAction={actions.length > 0}
      />
      {actions.length > 0 && (
        <Dropdown
          dropdownId={dropdownId}
          dropdownMenuWidth={260}
          clickableComponent={
            <StyledIconButton
              Icon={IconChevronDown}
              onClick={() => setShowingOptions(!showingOptions)}
              size="small"
              variant="primary"
              accent="blue"
            />
          }
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
      )}
    </StyledContainer>
  );
};
