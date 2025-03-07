import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isPublication } from '@/object-metadata/utils/isPropertyOrPublication';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';
import { ChipSize, IconHomeShare } from 'twenty-ui';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    isLabelIdentifier,
    labelIdentifierLink,
  } = useChipFieldDisplay();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const { openRecordInCommandMenu } = useCommandMenu();

  if (!recordValue) {
    return null;
  }

  return isLabelIdentifier ? (
    <RecordIdentifierChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={
        recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? labelIdentifierLink
          : undefined
      }
      onClick={
        recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
          ? () => {
              openRecordInCommandMenu({
                recordId: recordValue.id,
                objectNameSingular,
              });
            }
          : undefined
      }
      LeftCustomComponent={
        isPublication(objectNameSingular) ? (
          <PlatformBadge
            platformId={recordValue.platform?.toUpperCase()}
            variant="small"
          />
        ) : undefined
      }
    />
  ) : (
    <RecordChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      LeftCustomComponent={
        <PlatformBadge
          platformId={recordValue.platform?.toUpperCase()}
          variant="small"
        />
      }
    />
  );
};
