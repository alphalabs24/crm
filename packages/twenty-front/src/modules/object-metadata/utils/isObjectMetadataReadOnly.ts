import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isWorkflowSubObjectMetadata } from '@/object-metadata/utils/isWorkflowSubObjectMetadata';

export const isObjectMetadataReadOnly = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'isRemote' | 'nameSingular'>,
) =>
  objectMetadataItem.isRemote ||
  isWorkflowSubObjectMetadata(objectMetadataItem.nameSingular) ||
  objectMetadataItem.nameSingular === CoreObjectNameSingular.Publication ||
  objectMetadataItem.nameSingular === CoreObjectNameSingular.Property;
