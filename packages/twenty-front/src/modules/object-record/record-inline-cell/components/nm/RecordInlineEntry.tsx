import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RecordInlineEntryContainer } from '@/object-record/record-inline-cell/components/nm/RecordInlineEntryContainer';
import {
  RecordInlineCellContext,
  RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui';

type RecordInlineEntryProps = {
  loading?: boolean;
  isRequired?: boolean;
};

export const RecordInlineEntry = ({
  loading,
  isRequired,
}: RecordInlineEntryProps) => {
  const { fieldDefinition, isCentered, isDisplayModeFixHeight } =
    useContext(FieldContext);
  const buttonIcon = useGetButtonIcon();

  const { getIcon } = useIcons();

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: true,
    buttonIcon: buttonIcon,
    customEditHotkeyScope: isFieldRelation(fieldDefinition)
      ? { scope: RelationPickerHotkeyScope.RelationPicker }
      : undefined,
    IconLabel: fieldDefinition.iconName
      ? getIcon(fieldDefinition.iconName)
      : undefined,
    label: fieldDefinition.label,
    labelWidth: fieldDefinition.labelWidth,
    showLabel: fieldDefinition.showLabel,
    isCentered,
    displayModeContent: <FieldDisplay wrap={true} />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: false,
    loading: loading,
  };

  return (
    <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
      <RecordInlineEntryContainer isRequired={isRequired} />
    </RecordInlineCellContext.Provider>
  );
};
