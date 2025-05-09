import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import {
  IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconHeadphones,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMoodSmile,
  IconPhoto,
  IconPilcrow,
  IconTable,
  IconVideo,
} from 'twenty-ui';

import { SuggestionItem } from '@/ui/input/editor/components/CustomSlashMenu';

import { BLOCK_SCHEMA } from '../constants/Schema';

const Icons: Record<string, IconComponent> = {
  'Heading 1': IconH1,
  'Heading 2': IconH2,
  'Heading 3': IconH3,
  'Numbered List': IconListNumbers,
  'Bullet List': IconList,
  'Check List': IconListCheck,
  Paragraph: IconPilcrow,
  Table: IconTable,
  Image: IconPhoto,
  Video: IconVideo,
  Audio: IconHeadphones,
  Emoji: IconMoodSmile,
};

const allowedKeys = [
  'heading',
  'heading_2',
  'heading_3',
  'numbered_list',
  'bullet_list',
  'check_list',
  'paragraph',
  'emoji',
];

export const getSimpleSlashMenu = (
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor,
) => {
  const items: SuggestionItem[] = [
    ...getDefaultReactSlashMenuItems(editor)
      .filter((a) => allowedKeys.includes(a.key))
      .map((x) => ({
        ...x,
        Icon: Icons[x.title],
      })),
  ];
  return items;
};
