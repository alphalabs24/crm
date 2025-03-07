import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export const isRelationMetadata = (
  value: unknown,
): value is RelationMetadataEntity => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RelationMetadataEntity>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.fromObjectMetadataId === 'string' &&
    typeof candidate.toObjectMetadataId === 'string' &&
    typeof candidate.fromFieldMetadataId === 'string' &&
    typeof candidate.toFieldMetadataId === 'string' &&
    typeof candidate.workspaceId === 'string' &&
    typeof candidate.relationType === 'string' &&
    Object.values(RelationMetadataType).includes(candidate.relationType) &&
    typeof candidate.onDeleteAction === 'string' &&
    Object.values(RelationOnDeleteAction).includes(candidate.onDeleteAction) &&
    candidate.createdAt instanceof Date &&
    candidate.updatedAt instanceof Date
  );
};
