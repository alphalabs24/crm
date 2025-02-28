import { EntityManager } from 'typeorm';

export async function createNewWorkspaceFavoritesFromDefaultWorkspaceFavorites(
  entityManager: EntityManager,
  schemaName: string,
  defaultWorkspaceDataSourceSchemaName: string,
) {
  const dwFavoriteFolders = await entityManager
    .createQueryBuilder()
    .select(['id', 'name', 'position'])
    .from(`${defaultWorkspaceDataSourceSchemaName}.favoriteFolder`, 'ff')
    .where('ff."deletedAt" IS NULL')
    .execute();

  const dwFavorites = await entityManager.query(
    `
    SELECT
      f. "id",
      f. "position",
      f. "favoriteFolderId",
      f. "viewId"
    FROM
        "${defaultWorkspaceDataSourceSchemaName}"."favorite" f
        -- we join only the inserted views from the new workspace
        LEFT JOIN "${schemaName}"."view" v ON v. "id" = f. "viewId"
    WHERE
        f. "deletedAt" IS NULL
        -- we currently only copy views and favorite folders
        AND(f. "favoriteFolderId" IS NOT NULL
            OR(f. "viewId" IS NOT NULL
                -- here we make sure that the favorites connected to a non-inserted view are not copied
                AND v. "id" IS NOT NULL))
    `,
  );

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.favoriteFolder`, ['id', 'name', 'position'])
    .values(dwFavoriteFolders)
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.favorite`, [
      'id',
      'position',
      'favoriteFolderId',
      'viewId',
    ])
    .values(dwFavorites)
    .execute();
}
