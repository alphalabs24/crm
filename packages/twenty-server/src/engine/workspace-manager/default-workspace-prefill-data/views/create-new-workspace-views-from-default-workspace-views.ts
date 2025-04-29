import { EntityManager } from 'typeorm';

import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import {
  ViewDefinition,
  ViewField,
  ViewFilter,
  ViewGroup,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
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

            const newViewField: ViewField = {
              id: dwvField.id,
              fieldMetadataId: newFieldMetadataId,
              position: dwvField.position,
              isVisible: dwvField.isVisible,
              size: dwvField.size,
              aggregateOperation: dwvField.aggregateOperation || undefined,
            };

            return newViewField;
          })
          .filter((viewField): viewField is ViewField => viewField !== null) ||
        [];

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

            const newViewFilter: ViewFilter = {
              id: filter.id,
              fieldMetadataId: newFieldMetadataId,
              displayValue: filter.displayValue,
              operand: filter.operand,
              value: filter.value,
            };

            return newViewFilter;
          })
          .filter(
            (viewFilter): viewFilter is ViewFilter => viewFilter !== null,
          ) || [];

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

            const newViewGroup: ViewGroup = {
              id: group.id,
              fieldMetadataId: newFieldMetadataId,
              isVisible: group.isVisible,
              fieldValue: group.fieldValue,
              position: group.position,
            };

            return newViewGroup;
          })
          .filter((viewGroup): viewGroup is ViewGroup => viewGroup !== null) ||
        [];

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

      const newViewDefinition: ViewDefinition = {
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

      return newViewDefinition;
    })
    .filter(
      (viewDefinition): viewDefinition is ViewDefinition =>
        viewDefinition !== null,
    );

  await createWorkspaceViews(entityManager, schemaName, newViewDefinitions);
}
