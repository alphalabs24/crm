import { Injectable } from '@nestjs/common';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { PartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isObjectMetadata } from 'src/engine/metadata-modules/object-metadata/utils/is-object-metadata';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardObjectFactory {
  create(
    standardObjectMetadataDefinitions:
      | (typeof BaseWorkspaceEntity)[]
      | ObjectMetadataEntity[],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Omit<PartialWorkspaceEntity, 'fields' | 'indexMetadatas'>[] {
    return standardObjectMetadataDefinitions
      .map((metadata) =>
        this.createObjectMetadata(metadata, context, workspaceFeatureFlagsMap),
      )
      .filter((metadata): metadata is PartialWorkspaceEntity => !!metadata);
  }

  private createObjectMetadata(
    target: typeof BaseWorkspaceEntity | ObjectMetadataEntity,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Omit<PartialWorkspaceEntity, 'fields' | 'indexMetadatas'> | undefined {
    if (isObjectMetadata(target)) {
      if (!target.standardId) {
        throw new Error('object standardId not found');
      }

      const labelIdentifierStandardId = target.fields.find(
        (field) => field.id === target.labelIdentifierFieldMetadataId,
      )?.standardId;

      const imageIdentifierStandardId = target.fields.find(
        (field) => field.id === target.imageIdentifierFieldMetadataId,
      )?.standardId;

      const {
        id: _1,
        createdAt: _2,
        updatedAt: _3,
        fields: _4,
        ...rest
      } = target;

      return {
        ...rest,
        workspaceId: context.workspaceId,
        dataSourceId: context.dataSourceId,
        standardId: target.standardId,
        labelIdentifierStandardId,
        imageIdentifierStandardId,
      };
    }

    const workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined =
      metadataArgsStorage.filterEntities(target);

    if (!workspaceEntityMetadataArgs) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    if (
      isGatedAndNotEnabled(
        workspaceEntityMetadataArgs.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return undefined;
    }

    return {
      ...workspaceEntityMetadataArgs,
      // TODO: Remove targetTableName when we remove the old metadata
      targetTableName: 'DEPRECATED',
      workspaceId: context.workspaceId,
      dataSourceId: context.dataSourceId,
      isCustom: false,
      isRemote: false,
      isSystem: workspaceEntityMetadataArgs.isSystem ?? false,
    };
  }
}
