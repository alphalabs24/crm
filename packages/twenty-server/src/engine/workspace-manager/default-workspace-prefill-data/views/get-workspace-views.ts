import { DataSource } from 'typeorm';

import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

export async function getWorkspaceViews(
  defaultWorkspaceDataSource: DataSource,
  defaultWorkspaceDataSourceSchemaName: string,
) {
  const views: ViewWorkspaceEntity[] = await defaultWorkspaceDataSource.query(
    `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."view" WHERE "deletedAt" IS NULL`,
  );

  const viewIds = views.map((view) => `'${view.id}'`).join(',');

  // Only fetch related data if we have views
  let viewFields: ViewFieldWorkspaceEntity[] = [];
  let viewFilters: ViewFilterWorkspaceEntity[] = [];
  let viewFilterGroups: ViewFilterGroupWorkspaceEntity[] = [];
  let viewGroups: ViewGroupWorkspaceEntity[] = [];
  let viewSorts: ViewSortWorkspaceEntity[] = [];

  if (viewIds.length > 0) {
    // Fetch all related data with separate queries
    viewFields = await defaultWorkspaceDataSource.query(
      `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."viewField" WHERE "viewId" IN (${viewIds}) AND "deletedAt" IS NULL`,
    );

    viewFilters = await defaultWorkspaceDataSource.query(
      `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."viewFilter" WHERE "viewId" IN (${viewIds}) AND "deletedAt" IS NULL`,
    );

    viewFilterGroups = await defaultWorkspaceDataSource.query(
      `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."viewFilterGroup" WHERE "viewId" IN (${viewIds}) AND "deletedAt" IS NULL`,
    );

    viewGroups = await defaultWorkspaceDataSource.query(
      `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."viewGroup" WHERE "viewId" IN (${viewIds}) AND "deletedAt" IS NULL`,
    );

    viewSorts = await defaultWorkspaceDataSource.query(
      `SELECT * FROM "${defaultWorkspaceDataSourceSchemaName}"."viewSort" WHERE "viewId" IN (${viewIds}) AND "deletedAt" IS NULL`,
    );
  }

  // Organize the data by viewId for easier processing
  const viewsById: Record<string, ViewWorkspaceEntity> = views.reduce(
    (acc, view) => {
      acc[view.id] = {
        ...view,
        viewFields: [],
        viewFilters: [],
        viewFilterGroups: [],
        viewGroups: [],
        viewSorts: [],
      };

      return acc;
    },
    {},
  );

  // Attach related data to their parent views
  viewFields.forEach((field) => {
    if (field.viewId && viewsById[field.viewId]) {
      viewsById[field.viewId].viewFields.push(field);
    }
  });

  viewFilters.forEach((filter) => {
    if (filter.viewId && viewsById[filter.viewId]) {
      viewsById[filter.viewId].viewFilters.push(filter);
    }
  });

  viewFilterGroups.forEach((group) => {
    if (group.viewId && viewsById[group.viewId]) {
      viewsById[group.viewId].viewFilterGroups.push(group);
    }
  });

  viewGroups.forEach((group) => {
    if (group.viewId && viewsById[group.viewId]) {
      viewsById[group.viewId].viewGroups.push(group);
    }
  });

  viewSorts.forEach((sort) => {
    if (sort.viewId && viewsById[sort.viewId]) {
      viewsById[sort.viewId].viewSorts.push(sort);
    }
  });

  const defaultWorkspaceViews = Object.values(viewsById);

  return defaultWorkspaceViews;
}
