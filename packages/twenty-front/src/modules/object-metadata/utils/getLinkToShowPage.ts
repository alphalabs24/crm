import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsPath } from '@/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type LinkOptions = {
  hash?: string;
  searchParams?: Record<string, string>;
};

export const getLinkToShowPage = (
  objectNameSingular: string,
  record: Partial<ObjectRecord>,
  options?: LinkOptions,
) => {
  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember;

  if (objectNameSingular === CoreObjectNameSingular.NoteTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: CoreObjectNameSingular.Note,
      }) + record.note?.id
    );
  }

  if (objectNameSingular === CoreObjectNameSingular.TaskTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: CoreObjectNameSingular.Task,
      }) + record.task?.id
    );
  }

  if (objectNameSingular === CoreObjectNameSingular.Agency) {
    return getSettingsPath(
      SettingsPath.Platforms,
      {},
      {
        id: record?.id,
      },
    );
  }

  let linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  // Add search params if provided
  if (options?.searchParams && Object.keys(options.searchParams).length > 0) {
    const searchParamsString = new URLSearchParams(
      options.searchParams,
    ).toString();
    linkToShowPage += `?${searchParamsString}`;
  }
  // Add hash if provided
  if (options?.hash) {
    linkToShowPage += options.hash.startsWith('#')
      ? options.hash
      : `#${options.hash}`;
  }

  return linkToShowPage;
};
