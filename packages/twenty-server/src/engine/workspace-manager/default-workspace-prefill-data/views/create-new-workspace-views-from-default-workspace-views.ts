import { EntityManager } from 'typeorm';

import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

export async function createNewWorkspaceViewsFromDefaultWorkspaceViews(
  defaultWorkspaceViews: ViewWorkspaceEntity[],
  mapDwIdToNewId: (oldFieldId: string) => string | null,
  entityManager: EntityManager,
  schemaName: string,
) {
  const newViewDefinitions: ViewDefinition[] = defaultWorkspaceViews
    .map((defaultWorkspaceView) => {
      const newObjectId = mapDwIdToNewId(defaultWorkspaceView.objectMetadataId);

      if (!newObjectId) {
        return null;
      }

      const newViewFields =
        defaultWorkspaceView.viewFields
          ?.map((dwvField) => {
            const newFieldId = mapDwIdToNewId(dwvField.fieldMetadataId);

            if (!newFieldId) {
              return null;
            }

            return {
              fieldMetadataId: newFieldId,
              position: dwvField.position,
              isVisible: dwvField.isVisible,
              size: dwvField.size,
              aggregateOperation: dwvField.aggregateOperation || undefined,
            };
          })
          .filter((viewField) => viewField !== null) || [];

      const newViewFilters =
        defaultWorkspaceView.viewFilters
          ?.map((filter) => {
            const newFieldId = mapDwIdToNewId(filter.fieldMetadataId);

            if (!newFieldId) {
              return null;
            }

            return {
              fieldMetadataId: newFieldId,
              displayValue: filter.displayValue,
              operand: filter.operand,
              value: filter.value,
            };
          })
          .filter((viewFilter) => viewFilter !== null) || [];

      const newViewGroups =
        defaultWorkspaceView.viewGroups
          ?.map((group) => {
            const newFieldId = mapDwIdToNewId(group.fieldMetadataId);

            if (!newFieldId) {
              return null;
            }

            return {
              fieldMetadataId: newFieldId,
              isVisible: group.isVisible,
              fieldValue: group.fieldValue,
              position: group.position,
            };
          })
          .filter((viewGroup) => viewGroup !== null) || [];

      const newKanbanFieldMetadataId =
        defaultWorkspaceView.kanbanFieldMetadataId
          ? (mapDwIdToNewId(defaultWorkspaceView.kanbanFieldMetadataId) ??
            undefined)
          : undefined;

      const newKanbanAggregateOperationFieldMetadataId =
        defaultWorkspaceView.kanbanAggregateOperationFieldMetadataId
          ? (mapDwIdToNewId(
              defaultWorkspaceView.kanbanAggregateOperationFieldMetadataId,
            ) ?? undefined)
          : undefined;

      return {
        id: defaultWorkspaceView.id,
        name: defaultWorkspaceView.name,
        objectMetadataId: newObjectId,
        type: defaultWorkspaceView.type,
        key: defaultWorkspaceView.key,
        position: defaultWorkspaceView.position,
        icon: defaultWorkspaceView.icon,
        openRecordIn: defaultWorkspaceView.openRecordIn,
        kanbanFieldMetadataId: newKanbanFieldMetadataId,
        kanbanAggregateOperation:
          defaultWorkspaceView.kanbanAggregateOperation || undefined,
        kanbanAggregateOperationFieldMetadataId:
          newKanbanAggregateOperationFieldMetadataId,
        fields: newViewFields,
        filters: newViewFilters,
        groups: newViewGroups,
      };
    })
    .filter((viewDefinition) => viewDefinition !== null);

  await createWorkspaceViews(entityManager, schemaName, newViewDefinitions);
}
