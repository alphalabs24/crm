import { EntityManager } from 'typeorm';

export async function createNewWorkspaceFeatureFlagsFromDefaultWorkspaceFeatureFlags({
  entityManager,
  newWorkspaceId,
  defaultWorkspaceId,
}: {
  entityManager: EntityManager;
  newWorkspaceId: string;
  defaultWorkspaceId: string;
}) {
  const dwFeatureFlags = await entityManager
    .createQueryBuilder()
    .select(['key', 'value'])
    .addSelect(`'${newWorkspaceId}'`, 'workspaceId')
    .from(`core.featureFlag`, 'ff')
    .where('ff."workspaceId" = :workspaceId', { defaultWorkspaceId })
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`core.featureFlag`, ['key', 'value', 'workspaceId'])
    .values(dwFeatureFlags)
    .execute();
}
