import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from '@blocknote/core';

export const DESCRIPTION_BLOCK_SCHEMA = BlockNoteSchema.create({
  // Include paragraph and bullet list blocks
  blockSpecs: {
    // Take only the paragraph and bullet list implementation from the defaults
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
  },
  // Only include bold styling option
  styleSpecs: {
    // Take only the bold implementation from the defaults
    bold: defaultStyleSpecs.bold,
  },
  // Include text and link for basic functionality
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
  },
});
