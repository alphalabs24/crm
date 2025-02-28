import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { createNewWorkspaceFavoritesFromDefaultWorkspaceFavorites } from 'src/engine/workspace-manager/default-workspace-prefill-data/favorites/create-new-workspace-favorites-from-default-workspace-favorites';
import { createNewWorkspaceViewsFromDefaultWorkspaceViews } from 'src/engine/workspace-manager/default-workspace-prefill-data/views/create-new-workspace-views-from-default-workspace-views';
import { getStandardObjectWorkspaceViews } from 'src/engine/workspace-manager/default-workspace-prefill-data/views/get-workspace-views';

export const defaultWorkspacePrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
  defaultWorkspaceDataSource: DataSource,
  defaultWorkspaceDataSourceSchemaName: string,
  defaultWorkspaceObjectMetadata: ObjectMetadataEntity[],
) => {
  // Create reverse lookup maps (dwMetadataId -> standardId)
  const dwMetadataIdToStandardIdMap = createMetadataIdToStandardIdMap(
    defaultWorkspaceObjectMetadata,
  );
  // Map from standardId -> newMetadataId
  const standardIdToNewMetadataIdMap =
    createStandardIdToMetadataIdMap(objectMetadata);

  function mapDwIdToNewId(oldFieldId: string): string | null {
    // First get standardId from old field ID
    const fieldStandardId = dwMetadataIdToStandardIdMap[oldFieldId];

    if (!fieldStandardId) {
      return null;
    }

    // Then get new field ID from standardId
    return standardIdToNewMetadataIdMap[fieldStandardId] ?? null;
  }

  const defaultWorkspaceViews = await getStandardObjectWorkspaceViews(
    defaultWorkspaceDataSource,
    defaultWorkspaceDataSourceSchemaName,
  );

  await workspaceDataSource.transaction(
    async (entityManager: EntityManager) => {
      await createNewWorkspaceViewsFromDefaultWorkspaceViews(
        defaultWorkspaceViews,
        mapDwIdToNewId,
        entityManager,
        schemaName,
      );

      await createNewWorkspaceFavoritesFromDefaultWorkspaceFavorites(
        entityManager,
        schemaName,
        defaultWorkspaceDataSourceSchemaName,
      );
    },
  );
};

function createMetadataIdToStandardIdMap(
  objectMetadata: ObjectMetadataEntity[],
) {
  return objectMetadata.reduce((acc, object) => {
    if (!object.standardId) {
      throw new Error(
        `Standard Id is not set for object: ${object.nameSingular}`,
      );
    }

    acc[object.id] = object.standardId;

    object.fields.forEach((field) => {
      if (!field.standardId) {
        throw new Error(`Standard Id is not set for field: ${field.name}`);
      }

      acc[field.id] = field.standardId;
    });

    return acc;
  }, {});
}

function createStandardIdToMetadataIdMap(
  objectMetadata: ObjectMetadataEntity[],
) {
  return objectMetadata.reduce((acc, object) => {
    if (!object.standardId) {
      throw new Error(
        `Standard Id is not set for object: ${object.nameSingular}`,
      );
    }

    acc[object.standardId] = object.id;

    object.fields.forEach((field) => {
      if (!field.standardId) {
        throw new Error(`Standard Id is not set for field: ${field.name}`);
      }

      acc[field.standardId] = field.id;
    });

    return acc;
  }, {});
}
