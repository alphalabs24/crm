import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import {
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadata } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getJoinColumn } from 'src/engine/twenty-orm/utils/get-join-column.util';
import {
  NESTERMIND_STANDARD_OBJECT_IDS,
  STANDARD_OBJECT_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKSPACE_MEMBER } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const searchableFieldsMap: Record<string, FieldTypeAndNameMetadata[]> = {
  [STANDARD_OBJECT_IDS.person]: SEARCH_FIELDS_FOR_PERSON,
  [STANDARD_OBJECT_IDS.company]: SEARCH_FIELDS_FOR_COMPANY,
  [STANDARD_OBJECT_IDS.task]: SEARCH_FIELDS_FOR_TASKS,
  [STANDARD_OBJECT_IDS.note]: SEARCH_FIELDS_FOR_NOTES,
  [STANDARD_OBJECT_IDS.opportunity]: SEARCH_FIELDS_FOR_OPPORTUNITY,
  [STANDARD_OBJECT_IDS.workspaceMember]: SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,

  // nestermind entities
  [NESTERMIND_STANDARD_OBJECT_IDS.property]: [
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'address', type: FieldMetadataType.ADDRESS },
  ],
  [NESTERMIND_STANDARD_OBJECT_IDS.publication]: [
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'address', type: FieldMetadataType.ADDRESS },
  ],
  [NESTERMIND_STANDARD_OBJECT_IDS.agency]: [
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'address', type: FieldMetadataType.ADDRESS },
  ],
  [NESTERMIND_STANDARD_OBJECT_IDS.buyerLead]: [
    { name: 'name', type: FieldMetadataType.TEXT },
  ],
};

const getSearchableFields = (
  objectMetadata: ObjectMetadataEntity,
): FieldTypeAndNameMetadata[] => {
  const searchableFields = searchableFieldsMap[objectMetadata.standardId ?? ''];

  return (
    searchableFields ?? [
      {
        name: DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
        type: FieldMetadataType.TEXT,
      },
    ]
  );
};

@Injectable()
export class StandardFieldFactory {
  create(
    target:
      | typeof BaseWorkspaceEntity
      | FieldMetadataEntity<FieldMetadataType | 'default'>,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
    allTargets?:
      | (typeof BaseWorkspaceEntity)[]
      | FieldMetadataEntity<FieldMetadataType | 'default'>[],
  ): (PartialFieldMetadata | PartialComputedFieldMetadata)[];

  create(
    targets:
      | (typeof BaseWorkspaceEntity)[]
      | FieldMetadataEntity<FieldMetadataType | 'default'>[],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap, // Map of standardId to field metadata
    allTargets?:
      | (typeof BaseWorkspaceEntity)[]
      | FieldMetadataEntity<FieldMetadataType | 'default'>[],
  ): Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]>;

  create(
    targetOrTargets:
      | typeof BaseWorkspaceEntity
      | (typeof BaseWorkspaceEntity)[]
      | FieldMetadataEntity<FieldMetadataType | 'default'>
      | FieldMetadataEntity<FieldMetadataType | 'default'>[],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
    allTargets?:
      | (typeof BaseWorkspaceEntity)[]
      | FieldMetadataEntity<FieldMetadataType | 'default'>[],
  ):
    | (PartialFieldMetadata | PartialComputedFieldMetadata)[]
    | Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]> {
    if (Array.isArray(targetOrTargets)) {
      return (
        targetOrTargets
          // Put TS_VECTOR fields at the end, otherwise the migration will fail
          // because the columns are not created at that point in time
          .sort((a, b) => {
            if (
              isFieldMetadata<FieldMetadataType | 'default'>(a) &&
              isFieldMetadata<FieldMetadataType | 'default'>(b)
            ) {
              if (
                a.type === FieldMetadataType.TS_VECTOR &&
                b.type !== FieldMetadataType.TS_VECTOR
              ) {
                return 1;
              }
              if (
                a.type !== FieldMetadataType.TS_VECTOR &&
                b.type === FieldMetadataType.TS_VECTOR
              ) {
                return -1;
              }
            }

            return 0;
          })
          .reduce((acc, target) => {
            if (isFieldMetadata<FieldMetadataType | 'default'>(target)) {
              if (!target.object.standardId) {
                throw new Error('object.standardId not found');
              }

              const existingFieldMetadata = acc.get(target.object.standardId);

              acc.set(target.object.standardId, [
                ...(existingFieldMetadata ?? []),
                ...this.create(
                  target,
                  context,
                  workspaceFeatureFlagsMap,
                  targetOrTargets,
                ),
              ]);

              return acc;
            }

            const workspaceEntityMetadataArgs =
              metadataArgsStorage.filterEntities(target);

            if (!workspaceEntityMetadataArgs) {
              return acc;
            }

            if (
              isGatedAndNotEnabled(
                workspaceEntityMetadataArgs.gate,
                workspaceFeatureFlagsMap,
              )
            ) {
              return acc;
            }

            acc.set(
              workspaceEntityMetadataArgs.standardId,
              this.create(target, context, workspaceFeatureFlagsMap),
            );

            return acc;
          }, new Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]>())
      );
    }

    if (isFieldMetadata<FieldMetadataType | 'default'>(targetOrTargets)) {
      if (!targetOrTargets.standardId) {
        throw new Error('field standardId not found');
      }

      const {
        id: _1,
        createdAt: _2,
        updatedAt: _3,
        object: _4,
        objectMetadataId: _5,
        relationTargetFieldMetadataId: _6,
        relationTargetObjectMetadataId: _7,
        ...rest
      } = targetOrTargets;

      const newFieldMetadata: PartialFieldMetadata = {
        ...rest,
        workspaceId: context.workspaceId,
        standardId: targetOrTargets.standardId,
      };

      if (targetOrTargets.type !== FieldMetadataType.TS_VECTOR) {
        return [newFieldMetadata];
      } else {
        return [
          {
            ...newFieldMetadata,
            generatedType:
              (targetOrTargets as FieldMetadataInterface).generatedType ??
              'STORED',
            asExpression:
              (targetOrTargets as FieldMetadataInterface).asExpression ??
              getTsVectorColumnExpressionFromFields(
                getSearchableFields(targetOrTargets.object),
              ),
          },
        ];
      }
    }

    const workspaceEntityMetadataArgs =
      metadataArgsStorage.filterEntities(targetOrTargets);
    const metadataCollections = this.collectMetadata(targetOrTargets);

    return [
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.fields,
        context,
        workspaceFeatureFlagsMap,
        this.createFieldMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.relations,
        context,
        workspaceFeatureFlagsMap,
        this.createFieldRelationMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.dynamicRelations,
        context,
        workspaceFeatureFlagsMap,
        this.createComputedFieldRelationMetadata,
      ),
    ];
  }

  private collectMetadata(target: typeof BaseWorkspaceEntity) {
    return {
      fields: metadataArgsStorage.filterFields(target),
      relations: metadataArgsStorage.filterRelations(target),
      dynamicRelations: metadataArgsStorage.filterDynamicRelations(target),
    };
  }

  private processMetadata<
    T,
    U extends PartialFieldMetadata | PartialComputedFieldMetadata,
  >(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    metadataArgs: T[],
    context: WorkspaceSyncContext,
    featureFlagsMap: FeatureFlagMap,
    createMetadata: (
      workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
      args: T,
      context: WorkspaceSyncContext,
      featureFlagsMap: FeatureFlagMap,
    ) => U[],
  ): U[] {
    return metadataArgs
      .flatMap((args) =>
        createMetadata(
          workspaceEntityMetadataArgs,
          args,
          context,
          featureFlagsMap,
        ),
      )
      .filter(Boolean) as U[];
  }

  /**
   * Create field metadata
   */
  private createFieldMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceFieldMetadataArgs: WorkspaceFieldMetadataArgs,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialFieldMetadata[] {
    if (
      isGatedAndNotEnabled(
        workspaceFieldMetadataArgs.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return [];
    }

    return [
      {
        type: workspaceFieldMetadataArgs.type,
        standardId: workspaceFieldMetadataArgs.standardId,
        name: workspaceFieldMetadataArgs.name,
        icon: workspaceFieldMetadataArgs.icon,
        label: workspaceFieldMetadataArgs.label,
        description: workspaceFieldMetadataArgs.description,
        defaultValue: workspaceFieldMetadataArgs.defaultValue,
        options: workspaceFieldMetadataArgs.options,
        settings: workspaceFieldMetadataArgs.settings,
        workspaceId: context.workspaceId,
        isNullable: workspaceFieldMetadataArgs.isNullable,
        isUnique: workspaceFieldMetadataArgs.isUnique,
        isCustom: workspaceFieldMetadataArgs.isDeprecated ? true : false,
        isSystem: workspaceFieldMetadataArgs.isSystem ?? false,
        isActive: workspaceFieldMetadataArgs.isActive ?? true,
        asExpression: workspaceFieldMetadataArgs.asExpression,
        generatedType: workspaceFieldMetadataArgs.generatedType,
      },
    ];
  }

  /**
   * Create relation field metadata
   */
  private createFieldRelationMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceRelationMetadataArgs: WorkspaceRelationMetadataArgs,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialFieldMetadata[] {
    const fieldMetadataCollection: PartialFieldMetadata[] = [];
    const foreignKeyStandardId = createDeterministicUuid(
      workspaceRelationMetadataArgs.standardId,
    );
    const joinColumnMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(
        workspaceRelationMetadataArgs.target,
      );
    const joinColumn = getJoinColumn(
      joinColumnMetadataArgsCollection,
      workspaceRelationMetadataArgs,
    );

    if (
      isGatedAndNotEnabled(
        workspaceRelationMetadataArgs.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return [];
    }

    if (joinColumn) {
      fieldMetadataCollection.push({
        type: FieldMetadataType.UUID,
        standardId: foreignKeyStandardId,
        name: joinColumn,
        label: `${workspaceRelationMetadataArgs.label} id (foreign key)`,
        description: `${workspaceRelationMetadataArgs.description} id foreign key`,
        icon: workspaceRelationMetadataArgs.icon,
        defaultValue: null,
        options: undefined,
        settings: undefined,
        workspaceId: context.workspaceId,
        isCustom: false,
        isSystem: true,
        isNullable: workspaceRelationMetadataArgs.isNullable,
        isUnique:
          workspaceRelationMetadataArgs.type ===
          RelationMetadataType.ONE_TO_ONE,
        isActive: workspaceRelationMetadataArgs.isActive ?? true,
      });
    }

    fieldMetadataCollection.push({
      type: FieldMetadataType.RELATION,
      standardId: workspaceRelationMetadataArgs.standardId,
      name: workspaceRelationMetadataArgs.name,
      label: workspaceRelationMetadataArgs.label,
      description: workspaceRelationMetadataArgs.description,
      icon: workspaceRelationMetadataArgs.icon,
      defaultValue: null,
      workspaceId: context.workspaceId,
      isCustom: false,
      isSystem:
        workspaceEntityMetadataArgs?.isSystem ||
        workspaceRelationMetadataArgs.isSystem,
      isNullable: true,
      isUnique:
        workspaceRelationMetadataArgs.type === RelationMetadataType.ONE_TO_ONE,
      isActive: workspaceRelationMetadataArgs.isActive ?? true,
    });

    return fieldMetadataCollection;
  }

  /**
   * Create computed field relation metadata
   */
  private createComputedFieldRelationMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceDynamicRelationMetadataArgs:
      | WorkspaceDynamicRelationMetadataArgs
      | undefined,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialComputedFieldMetadata[] {
    if (
      !workspaceDynamicRelationMetadataArgs ||
      isGatedAndNotEnabled(
        workspaceDynamicRelationMetadataArgs.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return [];
    }

    return [
      // Foreign key will be computed in compute-standard-object.util.ts, because we need to know the custom object
      {
        type: FieldMetadataType.RELATION,
        argsFactory: workspaceDynamicRelationMetadataArgs.argsFactory,
        workspaceId: context.workspaceId,
        isCustom: false,
        isSystem:
          workspaceEntityMetadataArgs?.isSystem ||
          workspaceDynamicRelationMetadataArgs.isSystem,
        isNullable: workspaceDynamicRelationMetadataArgs.isNullable,
      },
    ];
  }
}
