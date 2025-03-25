import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { createNewWorkspaceFavoritesFromDefaultWorkspaceFavorites } from 'src/engine/workspace-manager/default-workspace-prefill-data/favorites/create-new-workspace-favorites-from-default-workspace-favorites';
import { createNewWorkspaceFeatureFlagsFromDefaultWorkspaceFeatureFlags } from 'src/engine/workspace-manager/default-workspace-prefill-data/feature-flags/create-new-workspace-feature-flags-from-default-workspace-feature-flags';
import { createNewWorkspaceViewsFromDefaultWorkspaceViews } from 'src/engine/workspace-manager/default-workspace-prefill-data/views/create-new-workspace-views-from-default-workspace-views';
import { getStandardObjectWorkspaceViews } from 'src/engine/workspace-manager/default-workspace-prefill-data/views/get-workspace-views';
import { createNewWorkspaceWebhooksFromDefaultWorkspaceWebhooks } from 'src/engine/workspace-manager/default-workspace-prefill-data/webhooks/create-new-workspace-webhooks-from-default-workspace-webhooks';

export const fillWorkspaceWithDefaultWorkspaceData = async ({
  workspaceId,
  workspaceDataSource,
  schemaName,
  objectMetadata,
  defaultWorkspaceId,
  defaultWorkspaceDataSource,
  defaultWorkspaceDataSourceSchemaName,
  defaultWorkspaceObjectMetadata,
}: {
  workspaceId: string;
  workspaceDataSource: DataSource;
  schemaName: string;
  objectMetadata: ObjectMetadataEntity[];
  defaultWorkspaceId: string;
  defaultWorkspaceDataSource: DataSource;
  defaultWorkspaceDataSourceSchemaName: string;
  defaultWorkspaceObjectMetadata: ObjectMetadataEntity[];
}) => {
  // Create reverse lookup maps (dwMetadataId -> standardId)
  const dwMetadataIdToStandardIdMap = createMetadataIdToStandardIdMap(
    defaultWorkspaceObjectMetadata,
  );
  // Map from standardId -> newMetadataId
  const standardIdToNewMetadataIdMap =
    createStandardIdToMetadataIdMap(objectMetadata);

  function mapDefaultWorkspaceMetadataIdToNewMetadataId(
    oldFieldId: string,
  ): string | null {
    // First get standardId from old field ID
    const standardId = dwMetadataIdToStandardIdMap[oldFieldId];

    if (!standardId) {
      return null;
    }

    const newFieldId = standardIdToNewMetadataIdMap[standardId];

    if (!newFieldId) {
      return null;
    }

    return newFieldId;
  }

  const defaultWorkspaceViews = await getStandardObjectWorkspaceViews(
    defaultWorkspaceDataSource,
    defaultWorkspaceDataSourceSchemaName,
  );

  await workspaceDataSource.transaction(
    async (entityManager: EntityManager) => {
      await createNewWorkspaceViewsFromDefaultWorkspaceViews(
        defaultWorkspaceViews,
        mapDefaultWorkspaceMetadataIdToNewMetadataId,
        entityManager,
        schemaName,
      );

      await createNewWorkspaceFavoritesFromDefaultWorkspaceFavorites(
        entityManager,
        schemaName,
        defaultWorkspaceDataSourceSchemaName,
      );

      await createNewWorkspaceWebhooksFromDefaultWorkspaceWebhooks(
        entityManager,
        schemaName,
        defaultWorkspaceDataSourceSchemaName,
      );

      await createNewWorkspaceFeatureFlagsFromDefaultWorkspaceFeatureFlags({
        entityManager,
        newWorkspaceId: workspaceId,
        defaultWorkspaceId,
      });
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
