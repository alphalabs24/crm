import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { RecordFormEntry } from '@/object-record/record-field/components/nm/RecordFormEntry';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFormCell } from '@/object-record/record-inline-cell/components/nm/RecordFormCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { SectionFieldType } from '@/record-edit/types/EditSectionTypes';
import styled from '@emotion/styled';
import { isNull } from '@sniptt/guards';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared';
import { AppTooltip, IconInfoCircle, TooltipDelay } from 'twenty-ui';
import { EmailTemplateContextProvider } from '../contexts/EmailTemplateContext';
import { PropertyDocumentFormInput } from './custom/PropertyDocumentFormInput';
import { PropertyEmailsFormInput } from './custom/PropertyEmailsFormInput';
import { PropertyImageFormInput } from './custom/PropertyImageFormInput';

const StyledFieldContainer = styled.div<{ isHorizontal?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: ${({ isHorizontal }) => (isHorizontal ? 1 : 'unset')};
  min-width: ${({ isHorizontal }) => (isHorizontal ? '160px' : 'unset')};
`;

const StyledFieldName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledInfoIcon = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: help;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledVerticalAligner = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`;

type RecordEditFieldProps = {
  field: FieldMetadataItem;
  type: SectionFieldType;
  showLabel?: boolean;
  objectMetadataItem: ObjectMetadataItem;
  record?: ObjectRecord;
  objectNameSingular: string;
  loading?: boolean;
  maxWidth?: number;
  isRequired?: boolean;
  showDescription?: boolean;
};

export const RecordEditField = ({
  field,
  maxWidth = 200,
  type,
  showLabel = true,
  objectMetadataItem,
  record,
  objectNameSingular,
  loading,
  isRequired,
  showDescription = true,
}: RecordEditFieldProps) => {
  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId: record?.id ?? '',
    recordFromStore: record ?? null,
  });

  const { getUpdatedFields } = useRecordEdit();

  const fieldMetadataItem = useMemo(() => {
    return objectMetadataItem.fields.find((f) => f.name === field.name);
  }, [objectMetadataItem, field.name]);

  const updatedFields = getUpdatedFields()[field.name];

  // Custom components for fields
  const CustomComponent = useMemo(() => {
    switch (field.name) {
      case 'pictures':
        return PropertyImageFormInput;
      case 'documents':
        return PropertyDocumentFormInput;
      case 'emailTemplate':
        return PropertyEmailsFormInput;
      default:
        return null;
    }
  }, [field.name]);

  const isEmpty =
    (Array.isArray(updatedFields) && updatedFields.length === 0) ||
    updatedFields === '';

  // Manually override the isFieldEmpty value to false if the field is not empty
  const overrideIsFieldEmpty =
    updatedFields && !isEmpty
      ? false
      : isNull(updatedFields)
        ? true
        : undefined;

  if (!isDefined(objectMetadataItem) || !isDefined(record)) {
    return null;
  }

  return (
    <StyledFieldContainer>
      {showLabel && type !== 'custom' && (
        <StyledFieldName>
          <span>
            {field.label} {isRequired ? '*' : ''}
          </span>
          {showDescription && fieldMetadataItem?.description && (
            <>
              <StyledInfoIcon id={`field-${field.id}-info`}>
                <IconInfoCircle size={13} />
              </StyledInfoIcon>
              <AppTooltip
                anchorSelect={`#field-${field.id}-info`}
                content={fieldMetadataItem.description}
                place="bottom"
                noArrow
                delay={TooltipDelay.noDelay}
                clickable
              />
            </>
          )}
        </StyledFieldName>
      )}

      <FieldContext.Provider
        key={record.id + field.id + 'edit'}
        value={{
          recordId: record.id,
          maxWidth: maxWidth,
          recoilScopeId: record.id + field.id,
          isLabelIdentifier: false,
          overridenIsFieldEmpty: overrideIsFieldEmpty,
          fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
            field: field,
            position: 0,
            objectMetadataItem,
            showLabel: false,
          }),
          formType: type,
          useUpdateRecord: useUpdateOneObjectRecordMutation,
          hotkeyScope: InlineCellHotkeyScope.InlineCell,
        }}
      >
        {type === 'custom' && CustomComponent ? (
          <EmailTemplateContextProvider
            value={{
              emailTemplateId: record.emailTemplateId,
              emailTemplate: record.emailTemplate,
              propertyId:
                objectNameSingular === CoreObjectNameSingular.Property
                  ? record.id
                  : undefined,
              publicationId:
                objectNameSingular === CoreObjectNameSingular.Publication
                  ? record.id
                  : undefined,
            }}
          >
            <CustomComponent loading={loading} />
          </EmailTemplateContextProvider>
        ) : type === 'field' ? (
          <StyledVerticalAligner>
            <RecordFormCell loading={loading} />
          </StyledVerticalAligner>
        ) : (
          <RecordFormEntry loading={loading} />
        )}
      </FieldContext.Provider>
    </StyledFieldContainer>
  );
};
