import { EntityManager } from 'typeorm';

export async function createNewWorkspaceWebhooksFromDefaultWorkspaceWebhooks(
  entityManager: EntityManager,
  schemaName: string,
  defaultWorkspaceDataSourceSchemaName: string,
) {
  const dwWebhooks = await entityManager
    .createQueryBuilder()
    .select(['id', '"targetUrl"', 'secret', 'operations', 'description'])
    .from(`${defaultWorkspaceDataSourceSchemaName}.webhook`, 'w')
    .where('w."deletedAt" IS NULL')
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.webhook`, [
      'id',
      'targetUrl',
      'secret',
      'operations',
      'description',
    ])
    .values(dwWebhooks)
    .execute();
}
