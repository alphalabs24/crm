import { EntityManager } from 'typeorm';

import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

export async function createNewWorkspaceViewsFromDefaultWorkspaceViews(
  defaultWorkspaceViews: ViewWorkspaceEntity[],
  mapDefaultWorkspaceMetadataIdToNewMetadataId: (
    oldFieldId: string,
  ) => string | null,
  entityManager: EntityManager,
  schemaName: string,
) {
  const newViewDefinitions: ViewDefinition[] = defaultWorkspaceViews
    .map((defaultWorkspaceView) => {
      const newObjectMetadataId = mapDefaultWorkspaceMetadataIdToNewMetadataId(
        defaultWorkspaceView.objectMetadataId,
      );

      if (!newObjectMetadataId) {
        return null;
      }

      const newViewFields =
        defaultWorkspaceView.viewFields
          ?.map((dwvField) => {
            const newFieldMetadataId =
              mapDefaultWorkspaceMetadataIdToNewMetadataId(
                dwvField.fieldMetadataId,
              );

            if (!newFieldMetadataId) {
              return null;
            }

            return {
              id: dwvField.id,
              fieldMetadataId: newFieldMetadataId,
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
            const newFieldMetadataId =
              mapDefaultWorkspaceMetadataIdToNewMetadataId(
                filter.fieldMetadataId,
              );

            if (!newFieldMetadataId) {
              return null;
            }

            return {
              id: filter.id,
              fieldMetadataId: newFieldMetadataId,
              displayValue: filter.displayValue,
              operand: filter.operand,
              value: filter.value,
            };
          })
          .filter((viewFilter) => viewFilter !== null) || [];

      const newViewGroups =
        defaultWorkspaceView.viewGroups
          ?.map((group) => {
            const newFieldMetadataId =
              mapDefaultWorkspaceMetadataIdToNewMetadataId(
                group.fieldMetadataId,
              );

            if (!newFieldMetadataId) {
              return null;
            }

            return {
              id: group.id,
              fieldMetadataId: newFieldMetadataId,
              isVisible: group.isVisible,
              fieldValue: group.fieldValue,
              position: group.position,
            };
          })
          .filter((viewGroup) => viewGroup !== null) || [];

      const newKanbanFieldMetadataId =
        defaultWorkspaceView.kanbanFieldMetadataId
          ? (mapDefaultWorkspaceMetadataIdToNewMetadataId(
              defaultWorkspaceView.kanbanFieldMetadataId,
            ) ?? undefined)
          : undefined;

      const newKanbanAggregateOperationFieldMetadataId =
        defaultWorkspaceView.kanbanAggregateOperationFieldMetadataId
          ? (mapDefaultWorkspaceMetadataIdToNewMetadataId(
              defaultWorkspaceView.kanbanAggregateOperationFieldMetadataId,
            ) ?? undefined)
          : undefined;

      return {
        id: defaultWorkspaceView.id,
        name: defaultWorkspaceView.name,
        objectMetadataId: newObjectMetadataId,
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
