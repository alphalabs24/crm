import styled from '@emotion/styled';

import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { Attachment } from '@/activities/files/types/Attachment';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordEditField } from '@/record-edit/components/RecordEditField';
import { useRecordEdit } from '@/record-edit/contexts/RecordEditContext';
import { EditSectionContentWidth } from '@/record-edit/types/EditSectionTypes';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ShowPageImageBanner } from '@/ui/layout/show-page/components/nm/ShowPageImageBanner';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { Button, LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

export const EDIT_CONTAINER_WIDTH = 1440;

const StyledEditContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const StyledTabListContainer = styled.div<{ shouldDisplay: boolean }>`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: ${({ shouldDisplay }) => (shouldDisplay ? 'flex' : 'none')};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;

  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.background.primary};
  z-index: 10;
`;

const StyledButtonContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const StyledScrollableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: ${EDIT_CONTAINER_WIDTH}px;
`;

const StyledContentOuterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};

  padding: ${({ theme }) => theme.spacing(4)};
  max-width: ${EDIT_CONTAINER_WIDTH}px;
`;

const StyledSection = styled.div<{
  width: EditSectionContentWidth;
  height: number;
}>`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  max-width: ${(p) =>
    p.width === 'full'
      ? `100%`
      : p.width === 'half'
        ? `calc(calc(100% - ${p.theme.spacing(4)})/2 - 2px)`
        : p.width === 'third'
          ? `calc(calc(100% - ${p.theme.spacing(8)})/3 - 2px)`
          : p.width === 'quarter'
            ? `calc(calc(100% - ${p.theme.spacing(12)})/4 - 2px)`
            : p.width === 'twoThirds'
              ? `calc(calc(calc(100% - ${p.theme.spacing(2)})/3) * 2 - 2px)`
              : `${p.width}px`};
  overflow: hidden;
  width: 100%;

  /* Large desktop viewport */
  @media only screen and (max-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: ${(p) =>
      p.width === 'full' || p.width === 'half'
        ? '100%'
        : `calc(calc(100% - ${p.theme.spacing(4)})/2 - 2px)`};
  }

  /* Mobile viewport */
  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 100%;
  }
`;

const StyledSectionTitle = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.secondary};
`;

const StyledSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledGroup = styled.div<{ isHorizontal?: boolean }>`
  display: flex;
  flex-direction: ${({ isHorizontal }) => (isHorizontal ? 'row' : 'column')};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const TAB_LIST_COMPONENT_ID = 'edit-record-right-tab-list';

type RecordEditContainerProps = {
  recordId: string;
  objectNameSingular: string;
  tabs: SingleTabProps[];
  isInRightDrawer?: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

export const RecordEditContainer = ({
  recordId,
  objectNameSingular,
  isInRightDrawer,
  tabs,
}: RecordEditContainerProps) => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const tabListComponentId = `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}-${recordId}`;

  const { activeTabId } = useTabList(tabListComponentId);

  const { record, loading: recordLoading } = useRecordShowPage(
    objectNameSingular,
    recordId,
  );

  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { getUpdatedFields, resetFields, isDirty, propertyImages } =
    useRecordEdit();

  const { deleteOneRecord: deleteOneAttachment } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
  });

  const availableFields = objectMetadataItem.fields.filter(
    (field) => !field.isSystem && isDefined(field.name),
  );

  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );

  const fieldsByName = availableFields.reduce<
    Record<string, (typeof availableFields)[0]>
  >((acc, field) => {
    if (isDefined(field?.name)) {
      acc[field?.name] = field;
    }
    return acc;
  }, {});

  // This saves the whole record with the updated fields from the form
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If no fields are dirty, don't save
      if (isDirty) {
        const updatedFields = getUpdatedFields();

        await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: updatedFields,
        });

        const toDelete = record?.attachments
          .filter(
            (attachment: Attachment) => attachment.type === 'PropertyImage',
          )
          .filter(
            (attachment: Attachment) =>
              !propertyImages.some((image) => image.id === attachment.id),
          );

        await Promise.all(
          propertyImages.map(async (image) => {
            if (image.isAttachment && isDefined(image.attachment)) {
              await updateOneAttachment({
                idToUpdate: image.attachment.id,
                updateOneRecordInput: {
                  orderIndex: image.orderIndex,
                  description: image.description,
                },
              });
            } else if (isDefined(image.file)) {
              await uploadAttachmentFile(
                image.file,
                {
                  id: recordId,
                  targetObjectNameSingular: objectNameSingular,
                },
                'PropertyImage',
                image.orderIndex,
                image.description,
              );
            }
          }),
        );

        await Promise.all(
          toDelete.map((attachment: Attachment) => {
            deleteOneAttachment(attachment.id);
          }),
        );
        resetFields();
      }

      const link = getLinkToShowPage(objectNameSingular, {
        id: recordId,
      });
      setTimeout(() => {
        navigate(link);
      }, 100);
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackBar(
          `Something went wrong while saving the record: ${error.message}`,
          {
            variant: SnackBarVariant.Error,
          },
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderActiveTabContent = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab?.content?.length) return null;

    return activeTab.content.map((section) => {
      const sectionFieldCount = section.groups.flatMap((group) =>
        group.fields
          .map((field) => ({
            field,
          }))
          .filter(({ field }) => isDefined(field)),
      ).length;

      const hasSectionFields = sectionFieldCount > 0;

      if (!hasSectionFields) {
        return null;
      }
      return (
        <StyledSection
          key={section.title}
          width={section.width ?? 385}
          height={500}
        >
          <StyledSectionTitle>{section.title}</StyledSectionTitle>
          <StyledSectionContent>
            {section.groups.map((group, groupIndex) => {
              const groupFields = group.fields
                .map((field) => ({
                  field: fieldsByName[field?.name],
                  type: field.type,
                  hideLabel: field.hideLabel,
                  maxWidth: field.fieldWidth,
                  conditionFieldNames: field.conditionFields,
                  conditionValues: field.conditionValues,
                }))
                .filter(({ field }) => isDefined(field));

              if (!groupFields.length) return null;

              return (
                <StyledGroup key={groupIndex} isHorizontal={group.isHorizontal}>
                  {groupFields.map(
                    ({
                      field,
                      type,
                      hideLabel,
                      maxWidth,
                      conditionFieldNames,
                      conditionValues,
                    }) => {
                      const conditionFields = conditionFieldNames?.map(
                        (conditionFieldName) =>
                          fieldsByName[conditionFieldName],
                      );

                      // Handles if field should show or not
                      const shouldRender =
                        conditionFields?.every((conditionField) => {
                          const conditionFieldValue = String(
                            getUpdatedFields()[conditionField?.name] ??
                              record?.[conditionField?.name] ??
                              '',
                          ).toLowerCase();

                          return conditionValues?.some(
                            (value) =>
                              String(value ?? '').toLowerCase() ===
                              conditionFieldValue,
                          );
                        }) ?? true;

                      return shouldRender ? (
                        <RecordEditField
                          key={field.id}
                          field={field}
                          type={type}
                          showLabel={!hideLabel}
                          maxWidth={maxWidth}
                          objectMetadataItem={objectMetadataItem}
                          record={record}
                          objectNameSingular={objectNameSingular}
                          loading={recordLoading || isNewViewableRecordLoading}
                        />
                      ) : null;
                    },
                  )}
                </StyledGroup>
              );
            })}
          </StyledSectionContent>
        </StyledSection>
      );
    });
  };

  return (
    <StyledEditContainer>
      {record && (
        <ShowPageImageBanner
          targetableObject={{
            id: record.id,
            targetObjectNameSingular: objectNameSingular,
          }}
        />
      )}

      <StyledTabListContainer shouldDisplay={true}>
        <TabList
          behaveAsLinks={!isInRightDrawer}
          loading={recordLoading || isNewViewableRecordLoading}
          tabListInstanceId={tabListComponentId}
          tabs={tabs}
          isInRightDrawer={isInRightDrawer}
        />
        <StyledButtonContainer>
          <Button
            title={t`Save`}
            variant="primary"
            accent="blue"
            size="small"
            onClick={handleSave}
            disabled={isSaving}
          />
        </StyledButtonContainer>
      </StyledTabListContainer>

      <StyledScrollableContainer>
        <StyledContentOuterContainer>
          {renderActiveTabContent()}
        </StyledContentOuterContainer>
      </StyledScrollableContainer>
    </StyledEditContainer>
  );
};
