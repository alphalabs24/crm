import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import { IconComponent, IconList } from 'twenty-ui';

import { DESCRIPTION_BLOCK_SCHEMA } from '../constants/DescriptionSchema';

const Icons: Record<string, IconComponent> = {
  'Bullet List': IconList,
};

export const getDescriptionSlashMenu = (
  editor: typeof DESCRIPTION_BLOCK_SCHEMA.BlockNoteEditor,
) => {
  // Try to get default bullet list items
  const defaultItems = getDefaultReactSlashMenuItems(editor);

  // Either find the bullet list from default items or create our own
  const bulletListItem = defaultItems.find(
    (item) => item.title === 'Bullet List',
  ) || {
    title: 'Bullet List',
    aliases: ['bullet', 'list', 'unordered list'],
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: 'bulletListItem' }], currentBlock, 'after');
    },
  };

  // Return as array with icon
  return [
    {
      ...bulletListItem,
      Icon: Icons['Bullet List'],
    },
  ];
};
