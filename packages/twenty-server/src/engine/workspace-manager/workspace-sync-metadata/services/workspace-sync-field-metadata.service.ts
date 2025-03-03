import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';
import { EntityManager, Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import {
  ComparatorAction,
  FieldComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { WorkspaceFieldComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator';
import { StandardFieldFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { computeStandardFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/compute-standard-fields.util';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncFieldMetadataService {
  private readonly logger = new Logger(WorkspaceSyncFieldMetadataService.name);

  constructor(
    private readonly standardFieldFactory: StandardFieldFactory,
    private readonly workspaceFieldComparator: WorkspaceFieldComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          // We're only interested in standard fields
        },
        relations: ['dataSource', 'fields'],
      });
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      );

    await this.synchronizeStandardObjectFields(
      context,
      originalObjectMetadataCollection,
      customObjectMetadataCollection,
      storage,
      workspaceFeatureFlagsMap,
      fieldMetadataRepository,
    );

    await this.synchronizeCustomObjectFields(
      context,
      customObjectMetadataCollection,
      storage,
      workspaceFeatureFlagsMap,
    );

    this.logger.log('Updating workspace metadata');

    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const deleteFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        storage.fieldMetadataDeleteCollection,
        WorkspaceMigrationBuilderAction.DELETE,
      );

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.updatedFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    const createFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.createdFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    this.logger.log('Saving migrations');

    return [
      ...deleteFieldWorkspaceMigrations,
      ...updateFieldWorkspaceMigrations,
      ...createFieldWorkspaceMigrations,
    ];
  }

  /**
   * This can be optimized to avoid import of standardObjectFactory here.
   * We should refactor the logic of the factory, so this one only create the objects and not the fields.
   * Then standardFieldFactory should be used to create the fields of standard objects.
   */
  private async synchronizeStandardObjectFields(
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    customObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
    fieldMetadataRepository: Repository<
      FieldMetadataEntity<FieldMetadataType | 'default'>
    >,
  ): Promise<void> {
    const defaultMetadataWorkspaceId = context.defaultMetadataWorkspaceId;
    // Create standard field metadata map
    const standardObjectStandardFieldMetadataMap =
      this.standardFieldFactory.create(
        defaultMetadataWorkspaceId
          ? await fieldMetadataRepository
              .createQueryBuilder('field')
              .leftJoinAndSelect('field.object', 'object')
              .leftJoin(
                'field.relationTargetFieldMetadata',
                'relationTargetFieldMetadata',
              )
              .leftJoin(
                'relationTargetFieldMetadata.relationTargetObjectMetadata',
                'rtfmObject',
              )
              .leftJoin(
                'field.relationTargetObjectMetadata',
                'relationTargetObjectMetadata',
              )
              .leftJoin('field.fromRelationMetadata', 'fromRelationMetadata')
              .leftJoin(
                'fromRelationMetadata.fromObjectMetadata',
                'frmFromObject',
              )
              .leftJoin('fromRelationMetadata.toObjectMetadata', 'frmToObject')
              .leftJoin(
                'fromRelationMetadata.fromFieldMetadata',
                'frmFromField',
              )
              .leftJoin('fromRelationMetadata.toFieldMetadata', 'frmToField')
              .leftJoin('field.toRelationMetadata', 'toRelationMetadata')
              .leftJoin(
                'toRelationMetadata.fromObjectMetadata',
                'trmFromObject',
              )
              .leftJoin('toRelationMetadata.toObjectMetadata', 'trmToObject')
              .leftJoin('toRelationMetadata.fromFieldMetadata', 'trmFromField')
              .leftJoin('toRelationMetadata.toFieldMetadata', 'trmToField')
              .leftJoin('field.indexFieldMetadatas', 'indexFieldMetadatas')
              .leftJoin('indexFieldMetadatas.indexMetadata', 'indexMetadata')
              .where(
                `field.workspaceId = :workspaceId 
                  AND field.isCustom = :isCustom 
                  AND field.isActive = :isActive
                  AND field.standardId IS NOT NULL`,
                {
                  workspaceId: defaultMetadataWorkspaceId,
                  isCustom: false,
                  isActive: true,
                },
              )
              .andWhere(
                `object.isCustom = :objectIsCustom 
                  AND object.isActive = :objectIsActive
                  AND object.standardId IS NOT NULL`,
                {
                  objectIsCustom: false,
                  objectIsActive: true,
                },
              )
              .andWhere(
                `(relationTargetFieldMetadata.id IS NULL 
                  OR (relationTargetFieldMetadata.isCustom = :rtfmIsCustom 
                      AND relationTargetFieldMetadata.standardId IS NOT NULL))`,
                { rtfmIsCustom: false },
              )
              .andWhere(
                `(rtfmObject.id IS NULL 
                  OR (rtfmObject.isCustom = :rtfmObjectIsCustom 
                      AND rtfmObject.standardId IS NOT NULL))`,
                {
                  rtfmObjectIsCustom: false,
                },
              )
              .andWhere(
                `(relationTargetObjectMetadata.id IS NULL 
                  OR (relationTargetObjectMetadata.isCustom = :rtoIsCustom 
                      AND relationTargetObjectMetadata.standardId IS NOT NULL))`,
                { rtoIsCustom: false },
              )
              .andWhere(
                `(fromRelationMetadata.id IS NULL 
                  OR (
                    (frmFromObject.id IS NULL 
                      OR (frmFromObject.isCustom = :frmFromObjIsCustom 
                          AND frmFromObject.standardId IS NOT NULL)) 
                    AND (frmToObject.id IS NULL 
                      OR (frmToObject.isCustom = :frmToObjIsCustom 
                          AND frmToObject.standardId IS NOT NULL)) 
                    AND (frmFromField.id IS NULL 
                      OR (frmFromField.isCustom = :frmFromFieldIsCustom 
                          AND frmFromField.standardId IS NOT NULL)) 
                    AND (frmToField.id IS NULL 
                      OR (frmToField.isCustom = :frmToFieldIsCustom 
                          AND frmToField.standardId IS NOT NULL))
                  ))`,
                {
                  frmFromObjIsCustom: false,
                  frmToObjIsCustom: false,
                  frmFromFieldIsCustom: false,
                  frmToFieldIsCustom: false,
                },
              )
              .andWhere(
                `(toRelationMetadata.id IS NULL 
                  OR (
                    (trmFromObject.id IS NULL 
                      OR (trmFromObject.isCustom = :trmFromObjIsCustom 
                          AND trmFromObject.standardId IS NOT NULL)) 
                    AND (trmToObject.id IS NULL 
                      OR (trmToObject.isCustom = :trmToObjIsCustom 
                          AND trmToObject.standardId IS NOT NULL)) 
                    AND (trmFromField.id IS NULL 
                      OR (trmFromField.isCustom = :trmFromFieldIsCustom 
                          AND trmFromField.standardId IS NOT NULL)) 
                    AND (trmToField.id IS NULL 
                      OR (trmToField.isCustom = :trmToFieldIsCustom 
                          AND trmToField.standardId IS NOT NULL))
                  ))`,
                {
                  trmFromObjIsCustom: false,
                  trmToObjIsCustom: false,
                  trmFromFieldIsCustom: false,
                  trmToFieldIsCustom: false,
                },
              )
              .andWhere(
                `(indexFieldMetadatas.id IS NULL 
                  OR (indexMetadata.id IS NULL 
                      OR indexMetadata.isCustom = :indexMetaIsCustom))`,
                { indexMetaIsCustom: false },
              )
              .getMany()
          : standardObjectMetadataDefinitions,
        context,
        workspaceFeatureFlagsMap,
      );

    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const [
      standardObjectId,
      standardFieldMetadataCollection,
    ] of standardObjectStandardFieldMetadataMap) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectId];

      const computedStandardFieldMetadataCollection = computeStandardFields(
        standardFieldMetadataCollection,
        originalObjectMetadata,
        // We need to provide this for generated relations with custom objects
        customObjectMetadataCollection,
      );

      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        originalObjectMetadata.id,
        originalObjectMetadata.fields,
        computedStandardFieldMetadataCollection,
      );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private async synchronizeCustomObjectFields(
    context: WorkspaceSyncContext,
    customObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<void> {
    // Create standard field metadata collection
    const customObjectStandardFieldMetadataCollection =
      this.standardFieldFactory.create(
        CustomWorkspaceEntity,
        context,
        workspaceFeatureFlagsMap,
      );

    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      // Also, maybe it's better to refactor a bit and move generation part into a separate module ?
      const standardFieldMetadataCollection = computeStandardFields(
        customObjectStandardFieldMetadataCollection,
        customObjectMetadata,
      );

      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        customObjectMetadata.id,
        customObjectMetadata.fields,
        standardFieldMetadataCollection,
      );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private storeComparatorResults(
    fieldComparatorResults: FieldComparatorResult[],
    storage: WorkspaceSyncStorage,
  ): void {
    for (const fieldComparatorResult of fieldComparatorResults) {
      switch (fieldComparatorResult.action) {
        case ComparatorAction.CREATE: {
          storage.addCreateFieldMetadata(fieldComparatorResult.object);
          break;
        }
        case ComparatorAction.UPDATE: {
          storage.addUpdateFieldMetadata(fieldComparatorResult.object);
          break;
        }
        case ComparatorAction.DELETE: {
          storage.addDeleteFieldMetadata(fieldComparatorResult.object);
          break;
        }
      }
    }
  }
}
