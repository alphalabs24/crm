import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsPath } from '@/types/SettingsPath';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { MouseEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: AvatarChipVariant;
  LeftCustomComponent?: ReactElement;
  disabled?: boolean;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  className,
  variant,
  LeftCustomComponent,
  disabled,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const isAgency = objectNameSingular === CoreObjectNameSingular.Agency;

  const { openRecordInCommandMenu } = useCommandMenu();

  const navigate = useNavigate();
  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const handleClick = (e: MouseEvent<Element>) => {
    if (disabled) return;
    e.stopPropagation();
    if (isAgency) {
      navigate(getSettingsPath(SettingsPath.Platforms, {}, { id: record.id }));
      return;
    }
    if (recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
      openRecordInCommandMenu({
        recordId: record.id,
        objectNameSingular,
      });
    }
  };

  if (!record) return null;

  return (
    <AvatarChip
      // TODO Added undefined check as quick fix, this should be further investigated!
      // Notes seem to have a bug where record can be undefined
      placeholderColorSeed={record?.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      className={className}
      variant={variant}
      onClick={handleClick}
      to={
        recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? getLinkToShowPage(objectNameSingular, record)
          : undefined
      }
      LeftCustomComponent={LeftCustomComponent}
    />
  );
};
