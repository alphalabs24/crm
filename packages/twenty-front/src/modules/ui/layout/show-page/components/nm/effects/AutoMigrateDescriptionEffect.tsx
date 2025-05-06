import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useState } from 'react';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { v4 as uuidv4 } from 'uuid';

type AutoMigrateDescriptionEffectProps = {
  record?: ObjectRecord;
  objectNameSingular?: string;
  onMigrationComplete?: (success: boolean) => void;
};

// This effect is used to migrate the simple description field to the new descriptionV2 field (rich text)
export const AutoMigrateDescriptionEffect = ({
  record,
  objectNameSingular,
  onMigrationComplete,
}: AutoMigrateDescriptionEffectProps) => {
  const [migrationAttempted, setMigrationAttempted] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectNameSingular || '',
  });

  useEffect(() => {
    const migrateDescription = async () => {
      if (!record || migrationAttempted || migrating) {
        return;
      }

      setMigrating(true);

      // Check if there's a description to migrate and no descriptionV2 content yet
      if (
        record.description &&
        (!record.descriptionV2 ||
          !record.descriptionV2.blocknote ||
          record.descriptionV2.blocknote === '')
      ) {
        try {
          // Create the rich text structure
          const richTextDescription = convertToRichText(record.description);

          // Update the record with the new rich text description and clear old description
          await updateOneRecord({
            idToUpdate: record.id,
            updateOneRecordInput: {
              descriptionV2: richTextDescription,
              description: null, // Clear the old description to prevent re-running migration
            },
          });

          onMigrationComplete?.(true);
        } catch (error) {
          console.error('error', error);
          onMigrationComplete?.(false);
        }
      }
      setMigrating(false);
      setMigrationAttempted(true);
    };

    migrateDescription();
  }, [
    record,
    migrationAttempted,
    updateOneRecord,
    onMigrationComplete,
    migrating,
  ]);

  return null;
};

// Helper function to convert plain text to rich text format
const convertToRichText = (text: string) => {
  // Split the text by newlines to create separate paragraphs
  const paragraphs = text.split(/\r?\n/).filter((line) => line.trim() !== '');

  // If no paragraphs, return empty rich text structure
  if (paragraphs.length === 0) {
    return {
      blocknote: '',
      markdown: '',
    };
  }

  // Create blocknote structure with each paragraph as a separate block
  const blocks = paragraphs.map((paragraph) => ({
    id: uuidv4(),
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: paragraph,
        styles: {},
      },
    ],
    children: [],
  }));

  // Create the full rich text object without __typename
  const richTextObject = {
    blocknote: JSON.stringify(blocks),
    markdown: text, // Simple markdown conversion
  };

  return richTextObject;
};
