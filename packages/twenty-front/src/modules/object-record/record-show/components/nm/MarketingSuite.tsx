import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { PropertyAttachmentType } from '@/activities/files/types/Attachment';
import { usePropertyPdfGenerator } from '@/ui/layout/property-pdf/hooks/usePropertyPdfGenerator';
import { PropertyPdfType } from '@/ui/layout/property-pdf/types/types';
import { DocumentationConfigurationModal } from '@/ui/layout/property-pdf/components/DocumentationConfigurationModal';
import { FlyerConfigurationModal } from '@/ui/layout/property-pdf/components/FlyerConfigurationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { useRef, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import {
  LARGE_DESKTOP_VIEWPORT,
  Button,
  IconFileText,
  IconRefresh,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconExternalLink,
  MenuItem,
  MOBILE_VIEWPORT,
  IconButton,
  IconUpload,
} from 'twenty-ui';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { PdfPreview } from './PdfPreview';
import { DocumentTypeIcon } from './DocumentTypeIcon';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import saveAs from 'file-saver';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { DefaultPropertyPdfTemplate } from '@/ui/layout/property-pdf/components/templates/default/DefaultPropertyPdfTemplate';

// Styled components sorted alphabetically
const StyledActionButton = styled.button`
  background: transparent;
  border: none;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledDocumentDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledDocumentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDocumentTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledFileDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StyledFileIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledFileName = styled.span`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${({ theme }) => theme.font.color.primary};
  display: -webkit-box;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  word-break: break-word;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: underline;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSpecialDocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledSpecialDocumentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSpecialDocumentHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  flex-direction: column;

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
  }
`;

const StyledSpecialDocumentListItem = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledDocumentCard = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  transition: all 0.2s ease-in-out;
  max-width: 380px;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: unset;
  }
`;

const StyledDocumentHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 400px;
`;

const StyledPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledPreviewWrapper = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
`;

const StyledPreviewActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 30px;
  justify-content: flex-end;
  flex-wrap: wrap;
  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    flex-wrap: nowrap;
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  min-height: 320px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  justify-content: center;
`;

const StyledEmptyStateIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 48px;
  justify-content: center;
  width: 48px;
`;

const StyledEmptyStateText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 380px;
`;

const StyledEmptyStateActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

type DocumentAttachment = {
  id: string;
  fullPath: string;
  name: string;
  description?: string;
  type: PropertyAttachmentType;
};

type SpecialDocument = {
  type: PropertyPdfType;
  iconType: 'expose' | 'flyer';
  title: string;
  description: string;
  attachment?: DocumentAttachment;
};

type MarketingSuiteProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
};

export const MarketingSuite = ({ targetableObject }: MarketingSuiteProps) => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { t } = useLingui();

  // Create dropdown instances for each document type
  const exposeDropdownId = 'document-dropdown-PropertyDocumentation';
  const flyerDropdownId = 'document-dropdown-PropertyFlyer';
  const { closeDropdown: closeExposeDropdown } = useDropdown(exposeDropdownId);
  const { closeDropdown: closeFlyerDropdown } = useDropdown(flyerDropdownId);

  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentAttachment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { attachments } = useAttachments(targetableObject);

  const propertyDocumentation = attachments.find(
    (attachment) => attachment.type === 'PropertyDocumentation',
  );
  const propertyFlyer = attachments.find(
    (attachment) => attachment.type === 'PropertyFlyer',
  );

  const { record } = useFindOneRecord({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    objectRecordId: targetableObject.id,
  });

  const { destroyOneRecord: destroyOneAttachment } = useDestroyOneRecord({
    objectNameSingular: 'attachment',
  });

  const exposePdfConfigModalRef = useRef<ModalRefType>(null);
  const flyerPdfConfigModalRef = useRef<ModalRefType>(null);

  const handleConfiguredPdfGeneration = async (
    result: {
      blob: Blob;
      fileName: string;
      previewUrl: string;
    },
    type: PropertyPdfType,
  ) => {
    const fileObj = new File([result.blob], result.fileName, {
      type: 'application/pdf',
    });

    await uploadAttachmentFile(
      fileObj,
      {
        id: targetableObject.id,
        targetObjectNameSingular: targetableObject.targetObjectNameSingular,
      },
      type,
      0,
      result.fileName,
      '',
      true,
    );
  };

  const handleGenerateDocument = async (type: PropertyPdfType) => {
    if (!record) return;

    if (type === 'PropertyDocumentation' || type === 'PropertyFlyer') {
      if (type === 'PropertyDocumentation') {
        exposePdfConfigModalRef.current?.open();
      } else {
        flyerPdfConfigModalRef.current?.open();
      }
    }
  };

  const handleConfirmDeleteAttachment = async () => {
    if (!documentToDelete?.id) return;

    try {
      await destroyOneAttachment(documentToDelete.id);
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };

  const handleDownload = (document: DocumentAttachment) => {
    if (!document.fullPath) return;

    downloadFile(document.fullPath, document.name);
  };

  const handleOpenDeleteModal = (attachment?: DocumentAttachment) => {
    if (!attachment) return;
    setDocumentToDelete(attachment);
    setIsDeleteModalOpen(true);
  };

  const handleReplaceDocument = async (type: PropertyPdfType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.[0]) return;

      // Find existing attachment of this type
      const existingAttachment = attachments.find(
        (attachment) => attachment.type === type,
      );

      // If there's an existing attachment, delete it first
      if (existingAttachment) {
        await destroyOneAttachment(existingAttachment.id);
      }

      // Upload the new file
      await uploadAttachmentFile(
        files[0],
        {
          id: targetableObject.id,
          targetObjectNameSingular: targetableObject.targetObjectNameSingular,
        },
        type,
        0,
        files[0].name,
        '',
        true,
      );
    };
    input.click();
  };

  const getDropdownForType = (type: PropertyPdfType) => {
    return type === 'PropertyDocumentation'
      ? closeExposeDropdown
      : closeFlyerDropdown;
  };

  const getDropdownIdForType = (type: PropertyPdfType) => {
    return type === 'PropertyDocumentation'
      ? exposeDropdownId
      : flyerDropdownId;
  };

  const specialDocuments: SpecialDocument[] = [
    {
      type: 'PropertyDocumentation',
      iconType: 'expose',
      title: t`Property Exposé`,
      description: t`Detailed property presentation document sent to potential buyers through the auto responder.`,
      attachment: propertyDocumentation as DocumentAttachment | undefined,
    },
    {
      type: 'PropertyFlyer',
      iconType: 'flyer',
      title: t`Property Flyer`,
      description: t`Concise property information overview sent to clients through the auto responder.`,
      attachment: propertyFlyer as DocumentAttachment | undefined,
    },
  ];

  return (
    <StyledContainer>
      <StyledSection>
        <StyledHeader>
          <StyledTitle>
            <Trans>Marketing Suite</Trans>
          </StyledTitle>
          <StyledDescription>
            <Trans>Create and manage your property marketing documents.</Trans>
          </StyledDescription>
        </StyledHeader>
      </StyledSection>
      <StyledSection>
        <StyledDocumentGrid>
          {specialDocuments.map((doc) => {
            const dropdownId = getDropdownIdForType(doc.type);
            const closeDropdown = getDropdownForType(doc.type);

            return (
              <StyledDocumentCard key={doc.type}>
                <StyledDocumentHeader>
                  <DocumentTypeIcon type={doc.iconType} />
                  <StyledDocumentInfo>
                    <StyledDocumentTitle>{doc.title}</StyledDocumentTitle>
                    <StyledDocumentDescription>
                      {doc.description}
                    </StyledDocumentDescription>
                  </StyledDocumentInfo>
                </StyledDocumentHeader>

                {doc.attachment ? (
                  <StyledPreviewContainer>
                    <StyledPreviewWrapper>
                      <PdfPreview url={doc.attachment.fullPath} />
                    </StyledPreviewWrapper>
                    <StyledPreviewActions>
                      <Button
                        variant="secondary"
                        size="small"
                        Icon={IconRefresh}
                        title={t`Regenerate`}
                        onClick={() => handleGenerateDocument(doc.type)}
                      />
                      <Button
                        variant="secondary"
                        size="small"
                        Icon={IconExternalLink}
                        title={t`Open`}
                        onClick={() => {
                          window.open(doc.attachment?.fullPath, '_blank');
                        }}
                      />
                      <Dropdown
                        dropdownId={dropdownId}
                        clickableComponent={
                          <IconButton
                            variant="secondary"
                            Icon={IconDotsVertical}
                            size="small"
                            ariaLabel={t`More actions`}
                          />
                        }
                        dropdownMenuWidth={160}
                        dropdownComponents={
                          <DropdownMenuItemsContainer>
                            <MenuItem
                              text={t`Download`}
                              LeftIcon={IconDownload}
                              onClick={() => {
                                if (doc.attachment) {
                                  handleDownload(doc.attachment);
                                }
                                closeDropdown();
                              }}
                            />
                            <MenuItem
                              text={t`Replace`}
                              LeftIcon={IconUpload}
                              onClick={() => {
                                handleReplaceDocument(doc.type);
                                closeDropdown();
                              }}
                            />
                            <MenuItem
                              text={t`Delete`}
                              LeftIcon={IconTrash}
                              accent="danger"
                              onClick={() => {
                                handleOpenDeleteModal(doc.attachment);
                                closeDropdown();
                              }}
                            />
                          </DropdownMenuItemsContainer>
                        }
                        dropdownHotkeyScope={{ scope: dropdownId }}
                      />
                    </StyledPreviewActions>
                  </StyledPreviewContainer>
                ) : (
                  <>
                    <StyledEmptyState>
                      <StyledEmptyStateIcon>
                        <IconFileText size={32} />
                      </StyledEmptyStateIcon>
                      <StyledEmptyStateText>
                        {doc.iconType === 'expose' ? (
                          <Trans>
                            Create a detailed property exposé to showcase all
                            the features and details.
                          </Trans>
                        ) : (
                          <Trans>
                            Generate a concise property flyer for quick
                            overview.
                          </Trans>
                        )}
                      </StyledEmptyStateText>
                      <StyledEmptyStateActions>
                        <Button
                          variant="secondary"
                          size="small"
                          Icon={IconRefresh}
                          title={t`Generate`}
                          disabled={!record}
                          onClick={() => handleGenerateDocument(doc.type)}
                        >
                          {t`Generate`}
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          Icon={IconFileText}
                          title={t`Upload`}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx';
                            input.onchange = async (e) => {
                              const files = (e.target as HTMLInputElement)
                                .files;
                              if (files?.[0]) {
                                await uploadAttachmentFile(
                                  files[0],
                                  {
                                    id: targetableObject.id,
                                    targetObjectNameSingular:
                                      targetableObject.targetObjectNameSingular,
                                  },
                                  doc.type,
                                  0,
                                  files[0].name,
                                  '',
                                  true,
                                );
                              }
                            };
                            input.click();
                          }}
                        >
                          {t`Upload`}
                        </Button>
                      </StyledEmptyStateActions>
                    </StyledEmptyState>
                    <StyledPreviewActions />
                  </>
                )}
              </StyledDocumentCard>
            );
          })}
        </StyledDocumentGrid>
      </StyledSection>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title={t`Delete Document`}
        subtitle={
          <Trans>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </Trans>
        }
        loading={false}
        onConfirmClick={handleConfirmDeleteAttachment}
        deleteButtonText={t`Delete`}
      />

      {record && (
        <>
          <DocumentationConfigurationModal
            ref={exposePdfConfigModalRef}
            property={record}
            onClose={() => exposePdfConfigModalRef.current?.close()}
            onGenerate={async (result) => {
              if (result) {
                if (propertyDocumentation) {
                  await destroyOneAttachment(propertyDocumentation.id);
                }
                await handleConfiguredPdfGeneration(
                  result,
                  'PropertyDocumentation',
                );
              }
            }}
          />
          <FlyerConfigurationModal
            ref={flyerPdfConfigModalRef}
            property={record}
            onClose={() => flyerPdfConfigModalRef.current?.close()}
            onGenerate={async (result) => {
              if (result) {
                if (propertyFlyer) {
                  await destroyOneAttachment(propertyFlyer.id);
                }
                await handleConfiguredPdfGeneration(result, 'PropertyFlyer');
              }
            }}
          />
        </>
      )}
    </StyledContainer>
  );
};
