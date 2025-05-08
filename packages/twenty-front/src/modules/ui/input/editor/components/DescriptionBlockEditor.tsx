import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
} from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ClipboardEvent } from 'react';

import { DESCRIPTION_BLOCK_SCHEMA } from '@/activities/blocks/constants/DescriptionSchema';
import { CustomSideMenu } from '@/ui/input/editor/components/CustomSideMenu';
import {
  CustomSlashMenu,
  SuggestionItem,
} from '@/ui/input/editor/components/CustomSlashMenu';
import { getDescriptionSlashMenu } from '@/activities/blocks/utils/getDescriptionSlashMenu';

// Use specific schema type
type DescriptionBlockEditorType =
  typeof DESCRIPTION_BLOCK_SCHEMA.BlockNoteEditor;

interface DescriptionBlockEditorProps {
  editor: DescriptionBlockEditorType;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  onChange?: () => void;
  readonly?: boolean;
}

const StyledEditor = styled.div`
  width: 100%;
  position: relative;

  & .editor {
    background: ${({ theme }) => theme.background.primary};
    font-size: 13px;
    color: ${({ theme }) => theme.font.color.primary};
    max-height: 250px;
    min-height: 100px;
    overflow-y: auto;
  }
  & .editor [class^='_inlineContent']:before {
    color: ${({ theme }) => theme.font.color.tertiary};
    font-style: normal !important;
  }
  & .editor .bn-inline-content:has(> .ProseMirror-trailingBreak):before {
    font-style: normal;
  }
  & .mantine-ActionIcon-icon {
    height: 20px;
    width: 20px;
    background: transparent;
  }
  & .bn-editor {
    padding-inline: 16px;
  }
  & .bn-container .bn-drag-handle {
    width: 20px;
    height: 20px;
  }
  & .bn-block-content[data-content-type='checkListItem'] > div > div {
    display: flex;
    align-items: center;
  }
  & .bn-drag-handle-menu {
    background: ${({ theme }) => theme.background.transparent.secondary};
    backdrop-filter: ${({ theme }) => theme.blur.medium};
    box-shadow:
      0px 2px 4px rgba(0, 0, 0, 0.04),
      2px 4px 16px rgba(0, 0, 0, 0.12);
    min-width: 160px;
    min-height: 96px;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    left: 26px;
  }

  & .bn-container .bn-suggestion-menu-item:hover {
    background-color: blue;
  }

  & .bn-suggestion-menu {
    padding: 4px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    background: ${({ theme }) => theme.background.transparent.secondary};
    backdrop-filter: ${({ theme }) => theme.blur.medium};
  }

  & .mantine-Menu-item {
    background-color: transparent;
    min-width: 152px;
    min-height: 32px;

    font-style: normal;
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    color: ${({ theme }) => theme.font.color.secondary};
  }
  & .mantine-ActionIcon-root:hover {
    box-shadow:
      0px 0px 4px rgba(0, 0, 0, 0.08),
      0px 2px 4px rgba(0, 0, 0, 0.04);
    background: ${({ theme }) => theme.background.transparent.primary};
    backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.border.color.light};
  }
  & .bn-side-menu .mantine-UnstyledButton-root:not(.mantine-Menu-item) svg {
    height: 16px;
    width: 16px;
  }

  & .bn-mantine .bn-side-menu > [draggable='true'] {
    margin-bottom: 5px;
  }
  & .bn-color-picker-dropdown {
    margin-left: 8px;
  }

  & .bn-inline-content code {
    font-family: monospace;
    color: ${({ theme }) => theme.font.color.danger};
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.font.color.extraLight};
    font-size: 0.9rem;
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const DescriptionBlockEditor = ({
  editor,
  onFocus,
  onBlur,
  onChange,
  onPaste,
  readonly,
}: DescriptionBlockEditorProps) => {
  const theme = useTheme();
  const blockNoteTheme = theme.name === 'light' ? 'light' : 'dark';

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const handleChange = () => {
    onChange?.();
  };

  const handlePaste = (event: ClipboardEvent) => {
    onPaste?.(event);
  };

  return (
    <StyledEditor>
      <BlockNoteView
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onChange={handleChange}
        editor={editor}
        theme={blockNoteTheme}
        slashMenu={false}
        sideMenu={false}
        editable={!readonly}
        formattingToolbar={false}
        linkToolbar={false}
      >
        {/* Including only line break option in slash menu */}
        <SuggestionMenuController
          triggerCharacter={'/'}
          getItems={async (query) =>
            filterSuggestionItems<SuggestionItem>(
              getDescriptionSlashMenu(editor as any),
              query,
            )
          }
          suggestionMenuComponent={CustomSlashMenu}
        />
        <FormattingToolbarController
          formattingToolbar={() => {
            return (
              <FormattingToolbar>
                <BlockTypeSelect key={'blockTypeSelect'} />

                <BasicTextStyleButton
                  basicTextStyle={'bold'}
                  key={'boldStyleButton'}
                />
              </FormattingToolbar>
            );
          }}
        />
      </BlockNoteView>
    </StyledEditor>
  );
};
