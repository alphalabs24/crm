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

// Reuse styled components from PropertyDocumentFormInput
const StyledContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(8)};

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSpecialDocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledSpecialDocumentRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledDocumentDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

const StyledFileDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

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

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await destroyOneAttachment(attachmentId);
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };

  const specialDocuments = [
    {
      type: 'PropertyDocumentation' as PropertyPdfType,
      title: 'Property Exposé',
      description:
        'Detailed property presentation document sent to potential buyers through the auto responder.',
      attachment: propertyDocumentation,
    },
    {
      type: 'PropertyFlyer' as PropertyPdfType,
      title: 'Property Flyer',
      description:
        'Concise property information overview sent to clients through the auto responder.',
      attachment: propertyFlyer,
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
        <StyledSpecialDocumentContainer>
          {specialDocuments.map((doc) => (
            <StyledSpecialDocumentRow key={doc.type}>
              <StyledSpecialDocumentHeader>
                <StyledDocumentInfo>
                  <StyledDocumentTitle>
                    <Trans id={doc.title}>{doc.title}</Trans>
                  </StyledDocumentTitle>
                  <StyledDocumentDescription>
                    <Trans id={doc.description}>{doc.description}</Trans>
                  </StyledDocumentDescription>
                </StyledDocumentInfo>
                {!doc.attachment && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="small"
                      Icon={IconRefresh}
                      title="Generate"
                      disabled={pdfLoading || !record}
                      onClick={() => handleGenerateDocument(doc.type)}
                    />
                    <Button
                      variant="primary"
                      size="small"
                      Icon={IconFileText}
                      title="Upload"
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
                    />
                  </div>
                )}
              </StyledSpecialDocumentHeader>
              {doc.attachment && (
                <StyledSpecialDocumentContent>
                  <SpecialDocumentItem
                    attachment={doc.attachment}
                    onRemove={handleRemoveAttachment}
                    onRegenerate={() => handleGenerateDocument(doc.type)}
                  />
                </StyledSpecialDocumentContent>
              )}
            </StyledSpecialDocumentRow>
          ))}
        </StyledSpecialDocumentContainer>
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
                // Remove the old attachment if it exists before adding the new one
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
                // Remove the old attachment if it exists before adding the new one
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
