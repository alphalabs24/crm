import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

export const createWorkspaceViews = async (
  entityManager: EntityManager,
  schemaName: string,
  viewDefinitions: ViewDefinition[],
) => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: viewDefinition.id ?? v4(),
  }));

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'openRecordIn',
      'kanbanFieldMetadataId',
      'kanbanAggregateOperation',
      'kanbanAggregateOperationFieldMetadataId',
    ])
    .values(
      viewDefinitionsWithId.map(
        ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }) => ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }),
      ),
    )
    .returning('*')
    .execute();

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewField`, [
          'id',
          'fieldMetadataId',
          'position',
          'isVisible',
          'size',
          'viewId',
          'aggregateOperation',
        ])
        .values(
          viewDefinition.fields.map((field) => ({
            id: field.id ?? v4(),
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: viewDefinition.id,
            aggregateOperation: field.aggregateOperation,
          })),
        )
        .execute();
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewFilter`, [
          'id',
          'fieldMetadataId',
          'displayValue',
          'operand',
          'value',
          'viewId',
        ])
        .values(
          viewDefinition.filters.map((filter: any) => ({
            id: filter.id ?? v4(),
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewGroup`, [
          'id',
          'fieldMetadataId',
          'isVisible',
          'fieldValue',
          'position',
          'viewId',
        ])
        .values(
          viewDefinition.groups.map((group: any) => ({
            id: group.id ?? v4(),
            fieldMetadataId: group.fieldMetadataId,
            isVisible: group.isVisible,
            fieldValue: group.fieldValue,
            position: group.position,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }
  }

  return viewDefinitionsWithId;
};
