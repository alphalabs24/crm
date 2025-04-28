import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { PropertyAttachmentType } from '@/activities/files/types/Attachment';
import { usePropertyPdfGenerator } from '@/ui/layout/property-pdf/hooks/usePropertyPdfGenerator';
import { PropertyPdfType } from '@/ui/layout/property-pdf/types/types';
import { DocumentationConfigurationModal } from '@/ui/layout/property-pdf/components/DocumentationConfigurationModal';
import { FlyerConfigurationModal } from '@/ui/layout/property-pdf/components/FlyerConfigurationModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { useRef } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import {
  LARGE_DESKTOP_VIEWPORT,
  Button,
  IconFileText,
  IconRefresh,
  IconFile,
  IconDotsVertical,
  IconEdit,
  IconDownload,
  IconTrash,
  IconExternalLink,
  MenuItem,
} from 'twenty-ui';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { PdfPreview } from './PdfPreview';
import { DocumentTypeIcon } from './DocumentTypeIcon';

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
  margin-top: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledSpecialDocumentRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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
  width: 380px;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
    transform: translateY(-2px);
  }
`;

const StyledDocumentHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledDocumentIconContainer = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StyledPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledPreviewWrapper = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const StyledPreviewActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  text-align: center;
`;

const StyledEmptyStateIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
`;

const StyledEmptyStateText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

type SpecialDocumentItemProps = {
  attachment: any;
  onRemove: (attachmentId: string) => void;
  onRegenerate: () => void;
};

const SpecialDocumentItem = ({
  attachment,
  onRemove,
  onRegenerate,
}: SpecialDocumentItemProps) => {
  const { t } = useLingui();
  const dropdownId = `document-dropdown-${attachment.id}`;
  const { closeDropdown } = useDropdown(dropdownId);

  const handleDelete = () => {
    onRemove(attachment.id);
    closeDropdown();
  };

  const handleDownload = async () => {
    try {
      // Fetch the file
      const response = await fetch(attachment.fullPath);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the blob
      const blob = await response.blob();

      // Create a temporary link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.name;

      // Append to the document and trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      closeDropdown();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleRegenerate = () => {
    onRegenerate();
    closeDropdown();
  };

  const handleFileNameClick = () => {
    window.open(attachment.fullPath, '_blank');
  };

  return (
    <StyledSpecialDocumentListItem>
      <StyledFileIcon>
        <IconFile size={24} />
      </StyledFileIcon>
      <StyledFileInfo>
        <StyledFileName onClick={handleFileNameClick}>
          {attachment.name}
        </StyledFileName>
        <StyledFileDescription>
          {attachment.description || t`No description`}
        </StyledFileDescription>
      </StyledFileInfo>
      <Dropdown
        dropdownHotkeyScope={{ scope: dropdownId }}
        dropdownId={dropdownId}
        clickableComponent={
          <StyledActionButton>
            <IconDotsVertical size={16} />
          </StyledActionButton>
        }
        dropdownMenuWidth={160}
        dropdownComponents={
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Open`}
              LeftIcon={IconExternalLink}
              onClick={() => {
                window.open(attachment.fullPath, '_blank');
                closeDropdown();
              }}
            />
            <MenuItem
              text={t`Download`}
              LeftIcon={IconDownload}
              onClick={handleDownload}
            />
            <MenuItem
              text={t`Regenerate`}
              LeftIcon={IconRefresh}
              onClick={handleRegenerate}
            />
            <MenuItem
              text={t`Remove`}
              LeftIcon={IconTrash}
              accent="danger"
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        }
      />
    </StyledSpecialDocumentListItem>
  );
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

  const { generatePdf, isLoading: pdfLoading } = usePropertyPdfGenerator({
    record,
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
    } else {
      try {
        const orientation = 'portrait';
        const result = await generatePdf(type, orientation);

        if (!result) throw new Error('Failed to generate document');

        const file = new File([result.blob], result.fileName, {
          type: 'application/pdf',
        });

        await uploadAttachmentFile(
          file,
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
      } catch (error) {
        console.error('Error generating document:', error);
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId?: string) => {
    if (!attachmentId) return;

    try {
      await destroyOneAttachment(attachmentId);
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };

  const specialDocuments: SpecialDocument[] = [
    {
      type: 'PropertyDocumentation',
      iconType: 'expose',
      title: 'Property Exposé',
      description:
        'Detailed property presentation document sent to potential buyers through the auto responder.',
      attachment: propertyDocumentation as DocumentAttachment | undefined,
    },
    {
      type: 'PropertyFlyer',
      iconType: 'flyer',
      title: 'Property Flyer',
      description:
        'Concise property information overview sent to clients through the auto responder.',
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
          {specialDocuments.map((doc) => (
            <StyledDocumentCard key={doc.type}>
              <StyledDocumentHeader>
                <StyledDocumentIconContainer>
                  <DocumentTypeIcon type={doc.iconType} />
                </StyledDocumentIconContainer>
                <StyledDocumentInfo>
                  <StyledDocumentTitle>
                    <Trans id={doc.title}>{doc.title}</Trans>
                  </StyledDocumentTitle>
                  <StyledDocumentDescription>
                    <Trans id={doc.description}>{doc.description}</Trans>
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
                      Icon={IconDownload}
                      title={t`Download`}
                      onClick={() => {
                        window.open(doc.attachment?.fullPath, '_blank');
                      }}
                    />
                    <Button
                      variant="secondary"
                      size="small"
                      Icon={IconTrash}
                      title={t`Remove`}
                      accent="danger"
                      onClick={() => handleRemoveAttachment(doc.attachment?.id)}
                    />
                  </StyledPreviewActions>
                </StyledPreviewContainer>
              ) : (
                <StyledEmptyState>
                  <StyledEmptyStateIcon>
                    <IconFileText size={32} />
                  </StyledEmptyStateIcon>
                  <StyledEmptyStateText>
                    {doc.iconType === 'expose' ? (
                      <Trans>
                        Create a detailed property exposé to showcase all the
                        features and details.
                      </Trans>
                    ) : (
                      <Trans>
                        Generate a concise property flyer for quick overview.
                      </Trans>
                    )}
                  </StyledEmptyStateText>
                  <StyledEmptyStateActions>
                    <Button
                      variant="secondary"
                      size="small"
                      Icon={IconRefresh}
                      title={t`Generate`}
                      disabled={pdfLoading || !record}
                      onClick={() => handleGenerateDocument(doc.type)}
                    >
                      {t`Generate`}
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      Icon={IconFileText}
                      title={t`Upload`}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx';
                        input.onchange = async (e) => {
                          const files = (e.target as HTMLInputElement).files;
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
              )}
            </StyledDocumentCard>
          ))}
        </StyledDocumentGrid>
      </StyledSection>
      {record && (
        <>
          <DocumentationConfigurationModal
            ref={exposePdfConfigModalRef}
            property={record}
            onClose={() => exposePdfConfigModalRef.current?.close()}
            onGenerate={async (config) => {
              const result = await generatePdf(
                'PropertyDocumentation',
                'portrait',
              );
              if (result) {
                if (propertyDocumentation) {
                  await handleRemoveAttachment(propertyDocumentation.id);
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
            onGenerate={async (config) => {
              const result = await generatePdf('PropertyFlyer', 'portrait');
              if (result) {
                if (propertyFlyer) {
                  await handleRemoveAttachment(propertyFlyer.id);
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
