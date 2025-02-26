import { useRecoilCallback, useRecoilValue } from 'recoil';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';

export const usePublications = () => {
  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    mainContextStoreComponentInstanceId,
  );

  //TODO: The viewId is wrong here, we need to always have the publication viewId
  const recordTableId = `${CoreObjectNamePlural.Publication}-${contextStoreCurrentViewId}`;

  // Get all publication IDs
  const publicationIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  // Get all publications
  const getAllPublications = useRecoilCallback(({ snapshot }) => () => {
    return publicationIds
      .map((id) => snapshot.getLoadable(recordStoreFamilyState(id)).getValue())
      .filter(Boolean);
  });

  // Get a specific publication by ID
  const getPublication = useRecoilCallback(
    ({ snapshot }) =>
      (publicationId: string) => {
        return snapshot
          .getLoadable(recordStoreFamilyState(publicationId))
          .getValue();
      },
  );

  // Get a specific field from a publication
  const getPublicationField = useRecoilCallback(
    ({ snapshot }) =>
      <T>(publicationId: string, fieldName: string) => {
        return snapshot
          .getLoadable(
            recordStoreFamilySelector({ recordId: publicationId, fieldName }),
          )
          .getValue() as T;
      },
  );

  // Update a publication
  const updatePublication = useRecoilCallback(
    ({ set }) =>
      (publicationId: string, newData: any) => {
        set(recordStoreFamilyState(publicationId), (prevState) => ({
          ...prevState,
          ...newData,
        }));
      },
  );

  return {
    getAllPublications,
    publicationIds,
    getPublication,
    getPublicationField,
    updatePublication,
  };
};
