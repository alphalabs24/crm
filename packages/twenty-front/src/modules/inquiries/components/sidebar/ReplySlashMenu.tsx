import { SuggestionMenuProps } from '@blocknote/react';
import styled from '@emotion/styled';
import { IconComponent, MenuItemSuggestion } from 'twenty-ui';
import { useFloating, offset } from '@floating-ui/react';
import { createPortal } from 'react-dom';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';

export type SuggestionItem = {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  Icon?: IconComponent;
};

type ReplySlashMenuProps = SuggestionMenuProps<SuggestionItem>;

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

const StyledInnerContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  max-height: 200px;
  width: 100%;
`;

export const ReplySlashMenu = (props: ReplySlashMenuProps) => {
  const { refs, floatingStyles } = useFloating({
    // Position the menu above the cursor for the reply editor
    placement: 'top-start',
    // Add offset to avoid overlapping with text
    middleware: [offset(100)],
  });

  return (
    <StyledContainer ref={refs.setReference}>
      {createPortal(
        <OverlayContainer
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            // Ensure the menu has a higher z-index than other elements
            zIndex: 2001,
            // Limit menu height and add scrolling if needed
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <StyledInnerContainer>
            <DropdownMenu style={{ zIndex: 2001 }}>
              <DropdownMenuItemsContainer>
                {props.items.map((item, index) => (
                  <MenuItemSuggestion
                    key={item.title}
                    onClick={() => item.onItemClick()}
                    text={item.title}
                    LeftIcon={item.Icon}
                    selected={props.selectedIndex === index}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          </StyledInnerContainer>
        </OverlayContainer>,
        document.body,
      )}
    </StyledContainer>
  );
};
