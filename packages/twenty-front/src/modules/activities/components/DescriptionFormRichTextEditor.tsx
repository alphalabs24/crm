import { useCreateBlockNote } from '@blocknote/react';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { isDefined } from 'twenty-shared';

import { DescriptionBlockEditor } from '@/ui/input/editor/components/DescriptionBlockEditor';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DESCRIPTION_BLOCK_SCHEMA } from '../blocks/constants/DescriptionSchema';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';
import { FeatureFlagKey } from '~/generated/graphql';
import { useLingui } from '@lingui/react/macro';

type DescriptionFormRichTextEditorProps = {
  recordToSet?: ObjectRecord | null;
  recordId: string;
  onChange?: (
    input: { bodyV2: { blocknote: string; markdown: null } } | { body: string },
  ) => void;
  isReadOnly?: boolean;
};

export const DescriptionFormRichTextEditor = ({
  recordId,
  recordToSet,
  onChange,
  isReadOnly,
}: DescriptionFormRichTextEditorProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(recordId));
  const record = (recordToSet ?? activityInStore) as ObjectRecord | null;

  const isRichTextV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsRichTextV2Enabled,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    // Handle onChange
    const input = isRichTextV2Enabled
      ? {
          bodyV2: {
            blocknote,
            markdown: null,
          },
        }
      : { body: blocknote };

    onChange?.(input);
  }, 300);

  const handlePersistBody = useCallback(
    (activityBody: string) => {
      persistBodyDebounced(activityBody);
    },
    [persistBodyDebounced],
  );

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';
    handlePersistBody(newStringifiedBody);
  };

  // Process the initial content with proper paragraph-only structure
  const getInitialContent = () => {
    try {
      const blocknote = isRichTextV2Enabled
        ? record?.descriptionV2?.bodyV2?.blocknote
        : record?.descriptionV2?.body;

      if (
        isDefined(record) &&
        isNonEmptyString(blocknote) &&
        blocknote !== '{}'
      ) {
        const parsedBody = JSON.parse(blocknote);

        // If we have content, ensure it only contains paragraphs
        if (isArray(parsedBody)) {
          const paragraphsOnly = parsedBody.map((block: any) => {
            // If it's already a paragraph, keep it
            if (block.type === 'paragraph') {
              return block;
            }

            // Otherwise convert to paragraph, trying to preserve content
            return {
              id: block.id || v4(),
              type: 'paragraph',
              content: Array.isArray(block.content) ? block.content : [],
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
            };
          });

          if (paragraphsOnly.length > 0) {
            return paragraphsOnly;
          }
        }
      }

      // Default empty content - a single empty paragraph
      return [
        {
          id: v4(),
          type: 'paragraph',
          content: [],
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
        },
      ];
    } catch (error) {
      console.warn(
        `Failed to parse body for record ${recordId}, for rich text version ${isRichTextV2Enabled ? 'v2' : 'v1'}`,
      );

      // Return a default empty paragraph
      return [
        {
          id: v4(),
          type: 'paragraph',
          content: [],
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
        },
      ];
    }
  };

  // Create the editor with our simplified schema
  const editor = useCreateBlockNote({
    initialContent: getInitialContent(),
    domAttributes: { editor: { class: 'editor' } },
    schema: DESCRIPTION_BLOCK_SCHEMA,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      editor.domElement?.blur();
    },
    ActivityEditorHotkeyScope.ActivityBody,
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
      if (keyboardEvent.key === Key.Escape) {
        return;
      }

      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      keyboardEvent.stopImmediatePropagation();

      const blockIdentifier = editor.getTextCursorPosition().block;
      const currentBlockContent = blockIdentifier?.content;

      if (
        isDefined(currentBlockContent) &&
        isArray(currentBlockContent) &&
        currentBlockContent.length === 0
      ) {
        // Empty block case
        editor.updateBlock(blockIdentifier, {
          content: keyboardEvent.key,
        });
        return;
      }

      if (
        isDefined(currentBlockContent) &&
        isArray(currentBlockContent) &&
        isDefined(currentBlockContent[0]) &&
        currentBlockContent[0].type === 'text'
      ) {
        // Text block case
        editor.updateBlock(blockIdentifier, {
          content: currentBlockContent[0].text + keyboardEvent.key,
        });
        return;
      }

      const newBlockId = v4();
      const newBlock = {
        id: newBlockId,
        type: 'paragraph' as const,
        content: keyboardEvent.key,
      };
      editor.insertBlocks([newBlock], blockIdentifier, 'after');

      editor.setTextCursorPosition(newBlockId, 'end');
      editor.focus();
    },
    isCommandMenuV2Enabled
      ? AppHotkeyScope.CommandMenuOpen
      : RightDrawerHotkeyScope.RightDrawer,
    [],
    {
      preventDefault: false,
    },
  );

  const handleBlockEditorFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      ActivityEditorHotkeyScope.ActivityBody,
    );
  };

  const handlerBlockEditorBlur = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <DescriptionBlockEditor
      onFocus={handleBlockEditorFocus}
      onBlur={handlerBlockEditorBlur}
      onChange={handleEditorChange}
      editor={editor}
      readonly={isReadOnly}
    />
  );
};
