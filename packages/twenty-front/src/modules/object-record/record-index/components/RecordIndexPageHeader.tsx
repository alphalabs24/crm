import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isObjectMetadataReadOnly } from '@/object-metadata/utils/isObjectMetadataReadOnly';
import { CreatePropertyModal } from '@/object-record/record-index/components/CreatePropertyModal';
import { ObjectRecordTutorialButton } from '@/object-record/record-index/components/ObjectRecordTutorialButton';
import { RecordIndexPageKanbanAddButton } from '@/object-record/record-index/components/RecordIndexPageKanbanAddButton';
import { RecordIndexPageTableAddButton } from '@/object-record/record-index/components/RecordIndexPageTableAddButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const RecordIndexPageHeader = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasHandledCreateParam, setHasHandledCreateParam] = useState(false);
  const modalRef = useRef<ModalRefType>(null);

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const { objectNamePlural, objectNameSingular } =
    useRecordIndexContextOrThrow();

  const isProperty = objectNameSingular === CoreObjectNameSingular.Property;
  const isPublication =
    objectNameSingular === CoreObjectNameSingular.Publication;

  const { leaveTableFocus, resetTableRowSelection } = useRecordTable({
    recordTableId,
  });
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    if (shouldCreate && !hasHandledCreateParam && isProperty) {
      leaveTableFocus();
      resetTableRowSelection();
      setHotkeyScope(ModalHotkeyScope.CreateProperty);
      modalRef.current?.open();
      setHasHandledCreateParam(true);
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [
    searchParams,
    hasHandledCreateParam,
    isProperty,
    leaveTableFocus,
    resetTableRowSelection,
    setHotkeyScope,
    setSearchParams,
  ]);

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
    <PageHeader
      title={pageHeaderTitle}
      Icon={Icon}
      tutorialButton={
        <ObjectRecordTutorialButton
          objectNameSingular={objectNameSingular as CoreObjectNameSingular}
        />
      }
    >
      {shouldDisplayAddButton &&
        (isPublication ? null : isProperty ? (
          <PageAddButton
            onClick={() => {
              leaveTableFocus();
              resetTableRowSelection();
              setHotkeyScope(ModalHotkeyScope.CreateProperty);
              modalRef.current?.open();
            }}
          />
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
      {isProperty && (
        <CreatePropertyModal
          ref={modalRef}
          onClose={() => {
            modalRef.current?.close();
            setHasHandledCreateParam(false);
          }}
          objectNameSingular={objectNameSingular}
        />
      )}
    </PageHeader>
  );
};
