import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isObjectMetadataReadOnly } from '@/object-metadata/utils/isObjectMetadataReadOnly';
import { CreatePropertyModal } from '@/object-record/record-index/components/CreatePropertyModal';
import { RecordIndexPageKanbanAddButton } from '@/object-record/record-index/components/RecordIndexPageKanbanAddButton';
import { RecordIndexPageTableAddButton } from '@/object-record/record-index/components/RecordIndexPageTableAddButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const RecordIndexPageHeader = () => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const modalRef = useRef<ModalRefType>(null);

  const { objectNamePlural, objectNameSingular } =
    useRecordIndexContextOrThrow();

  const isProperty = objectNameSingular === CoreObjectNameSingular.Property;
  const isPublication =
    objectNameSingular === CoreObjectNameSingular.Publication;

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem?.icon);

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const numberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const isNotPublicationOrProperty = !isPublication && !isProperty;

  const isObjectMetadataItemReadOnly =
    isDefined(objectMetadataItem) &&
    isObjectMetadataReadOnly(objectMetadataItem);

  const shouldDisplayAddButton =
    ((numberOfSelectedRecords === 0 || !isCommandMenuV2Enabled) &&
      !isObjectMetadataItemReadOnly &&
      !isCommandMenuV2Enabled) ||
    !isNotPublicationOrProperty;

  const isTable = recordIndexViewType === ViewType.Table;

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      {shouldDisplayAddButton &&
        /**
         * TODO: Logic between Table and Kanban should be merged here when we move some states to record-index
         */
        (isPublication ? null : isProperty ? (
          <PageAddButton onClick={() => modalRef.current?.open()} />
        ) : isTable ? (
          <RecordIndexPageTableAddButton />
        ) : (
          <RecordIndexPageKanbanAddButton />
        ))}

      {isCommandMenuV2Enabled && (
        <>
          {isNotPublicationOrProperty && (
            <RecordIndexActionMenu indexId={recordIndexId} />
          )}
          <PageHeaderOpenCommandMenuButton />
        </>
      )}
      <CreatePropertyModal
        ref={modalRef}
        onClose={() => modalRef.current?.close()}
        objectNameSingular={objectNameSingular}
      />
    </PageHeader>
  );
};
