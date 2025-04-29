import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { isPropertyOrPublication } from '@/object-metadata/utils/isPropertyOrPublication';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared';

export const useRecordTableRecordGqlFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { imageIdentifierFieldMetadataItem, labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  const identifierQueryFields: Record<string, boolean> = {};

  if (isDefined(labelIdentifierFieldMetadataItem)) {
    identifierQueryFields[labelIdentifierFieldMetadataItem.name] = true;
  }

  if (isDefined(imageIdentifierFieldMetadataItem)) {
    identifierQueryFields[imageIdentifierFieldMetadataItem.name] = true;
  }

  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  // Check if the object is a property or publication
  const isPropertyOrPub = isPropertyOrPublication(
    objectMetadataItem.nameSingular,
  );

  let fieldEntries: Record<string, boolean> = {};

  // For properties and publications, include all fields
  if (isPropertyOrPub) {
    fieldEntries = Object.fromEntries(
      objectMetadataItem.fields.map((field) => [field.name, true]),
    );
  } else {
    // For other objects, only include visible columns
    fieldEntries = Object.fromEntries(
      visibleTableColumns.map((column) => [column.metadata.fieldName, true]),
    );
  }

  const recordGqlFields: Record<string, any> = {
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    ...fieldEntries,
    ...identifierQueryFields,
    position: true,
    noteTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
    }),
    taskTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
    }),
  };

  return recordGqlFields;
};
