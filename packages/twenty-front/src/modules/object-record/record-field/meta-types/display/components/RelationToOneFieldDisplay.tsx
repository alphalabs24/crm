import { isPublication } from '@/object-metadata/utils/isPropertyOrPublication';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useRelationToOneFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationToOneFieldDisplay';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';

export const RelationToOneFieldDisplay = ({
  canClick = true,
}: {
  canClick?: boolean;
}) => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationToOneFieldDisplay();

  if (
    !fieldValue ||
    !fieldDefinition?.metadata.relationObjectMetadataNameSingular
  ) {
    return null;
  }

  const recordChipData = generateRecordChipData(fieldValue);

  return (
    <RecordChip
      key={recordChipData.recordId}
      objectNameSingular={recordChipData.objectNameSingular}
      record={fieldValue}
      disabled={!canClick}
      LeftCustomComponent={
        isPublication(recordChipData.objectNameSingular) &&
        fieldValue.platform ? (
          <PlatformBadge
            platformId={fieldValue.platform?.toUpperCase()}
            size="small"
          />
        ) : undefined
      }
    />
  );
};
