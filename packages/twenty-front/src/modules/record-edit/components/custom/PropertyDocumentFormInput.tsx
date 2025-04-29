/* eslint-disable react/jsx-props-no-spreading */
import { PropertyAttachmentType } from '@/activities/files/types/Attachment';
import {
  RecordEditPropertyDocument,
  useRecordEdit,
} from '@/record-edit/contexts/RecordEditContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';

import { saveAs } from 'file-saver';
import { usePropertyPdfGenerator } from '@/ui/layout/property-pdf/hooks/usePropertyPdfGenerator';
import {
  PdfFlyerConfiguration,
  PropertyPdfType,
} from '@/ui/layout/property-pdf/types/types';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import {
  AppTooltip,
  Button,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFile,
  IconFileText,
  IconFileZip,
  IconRefresh,
  IconTrash,
  IconUpload,
  LARGE_DESKTOP_VIEWPORT,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { DocumentEditModal } from './DocumentEditModal';
import { FlyerConfigurationModal } from '@/ui/layout/property-pdf/components/FlyerConfigurationModal';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DocumentationConfigurationModal } from '@/ui/layout/property-pdf/components/DocumentationConfigurationModal';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  flex: 1;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
`;

const StyledDocumentList = styled.div<{ isDraggingOver?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  min-height: 40px;
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme, isDraggingOver }) =>
    isDraggingOver ? theme.background.transparent.lighter : 'transparent'};
`;

const StyledDocumentItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  cursor: move;
  min-width: 0;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }

  &.highlight-new {
    animation: highlightNew 1.5s ease-out;
  }

  @keyframes highlightNew {
    0% {
      scale: 0.95;
      opacity: 0;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue};
    }
    15% {
      scale: 1;
      opacity: 1;
    }
    75% {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue};
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }
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

const StyledClosePdfModalHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const StyledPdfPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 95vh;
`;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  userSelect: 'none' as const,
  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
  transition: 'transform 0.2s ease',
  ...draggableStyle,
});

const reorderDocuments = (
  list: RecordEditPropertyDocument[],
  startIndex: number,
  endIndex: number,
): RecordEditPropertyDocument[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return <IconFileZip size={24} />;
  return <IconFile size={24} />;
};

const DraggableDocumentItem = ({
  document,
  index,
  onRemove,
  isNew,
  onSaveEdit,
}: {
  document: RecordEditPropertyDocument;
  index: number;
  onRemove: (document: RecordEditPropertyDocument) => void;
  onSaveEdit: (
    id: string,
    updates: Partial<RecordEditPropertyDocument>,
  ) => void;
  isNew?: boolean;
}) => {
  const [hovering, setHovering] = useState(false);
  const { t } = useLingui();
  const dropdownId = `document-${document.id}-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);
  const modalRef = useRef<ModalRefType>(null);

  const handleDelete = () => {
    onRemove(document);
    closeDropdown();
  };

  const handleEdit = () => {
    modalRef.current?.open();
    setHovering(false);
    closeDropdown();
  };

  const handleDownload = () => {
    if (!document.file) return;
    const blob = new Blob([document.file], { type: document.file.type });
    saveAs(blob, document.file.name);
    closeDropdown();
  };

  const handleSaveEdit = (
    document: RecordEditPropertyDocument,
    updates: Partial<RecordEditPropertyDocument>,
  ) => {
    onSaveEdit(document.id, updates);
  };

  const handleOpen = () => {
    window.open(document.previewUrl, '_blank');
    closeDropdown();
  };

  const handleFileNameClick = () => {
    window.open(document.previewUrl, '_blank');
  };

  return (
    <>
      <AppTooltip
        anchorSelect={`#document-${document.id}`}
        content={document.description || t`No description`}
        place="bottom"
        noArrow
        delay={TooltipDelay.noDelay}
        isOpen={hovering}
        clickable
      />
      <Draggable draggableId={document.id} index={index}>
        {(provided, snapshot) => (
          <StyledDocumentItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style,
            )}
            className={isNew ? 'highlight-new' : ''}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            id={`document-${document.id}`}
          >
            <StyledFileIcon>
              {getFileIcon(document.file?.name || '')}
            </StyledFileIcon>
            <StyledFileInfo>
              <StyledFileName onClick={handleFileNameClick}>
                {document.fileName}
              </StyledFileName>
              <StyledFileDescription>
                {document.description || t`No description`}
              </StyledFileDescription>
            </StyledFileInfo>
            <Dropdown
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
                    onClick={handleOpen}
                  />
                  <MenuItem
                    text={t`Download`}
                    LeftIcon={IconDownload}
                    onClick={handleDownload}
                  />
                  <MenuItem
                    text={t`Edit Details`}
                    LeftIcon={IconEdit}
                    onClick={handleEdit}
                  />
                  <MenuItem
                    text={t`Delete`}
                    LeftIcon={IconTrash}
                    accent="danger"
                    onClick={handleDelete}
                  />
                </DropdownMenuItemsContainer>
              }
              dropdownHotkeyScope={{ scope: dropdownId }}
            />
          </StyledDocumentItem>
        )}
      </Draggable>

      <DocumentEditModal
        ref={modalRef}
        document={document}
        onClose={() => modalRef.current?.close()}
        onSave={(updates) => handleSaveEdit(document, updates)}
      />
    </>
  );
};

const StyledDragOverlay = styled.div<{
  position?: 'relative' | 'absolute';
  isDragActive?: boolean;
}>`
  align-items: center;

  background: ${({ theme, position, isDragActive }) =>
    position === 'relative' && isDragActive
      ? theme.background.transparent.lighter
      : theme.background.primary};

  border: 3px dashed ${({ theme }) => theme.border.color.medium};

  ${({ position }) =>
    position === 'relative' &&
    css`
      transition: all 200ms ease-in-out;
    `}

  border-radius: ${({ theme }) => theme.border.radius.md};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.strong};
  }

  bottom: 0;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ position }) =>
    position === 'relative' ? 'pointer' : 'default'};
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  left: 0;
  min-height: 80px;
  opacity: 0.95;
  pointer-events: ${({ position }) =>
    position === 'relative' ? 'auto' : 'none'};
  position: ${({ position }) =>
    position === 'relative' ? 'relative' : 'absolute'};
  right: 0;
  top: 0;
  transform: ${({ isDragActive }) =>
    isDragActive ? 'scale(1.01)' : 'scale(1)'};
  z-index: 1;
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

const StyledSpecialDocumentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledSpecialDocumentListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: 100%;
`;

const SpecialDocumentItem = ({
  document,
  onRemove,
  onSaveEdit,
  onClick,
  onRegenerate,
}: {
  document: RecordEditPropertyDocument;
  onRemove: (doc: RecordEditPropertyDocument) => void;
  onSaveEdit: (
    id: string,
    updates: Partial<RecordEditPropertyDocument>,
  ) => void;
  onClick?: () => void;
  onRegenerate?: () => void;
}) => {
  const { t } = useLingui();
  const dropdownId = `document-dropdown-${document.id}`;
  const { closeDropdown } = useDropdown(dropdownId);
  const modalRef = useRef<ModalRefType>(null);

  const handleDelete = () => {
    onRemove(document);
    closeDropdown();
  };

  const handleEdit = () => {
    modalRef.current?.open();
    closeDropdown();
  };

  const handleDownload = () => {
    window.open(document.previewUrl, '_blank');
    closeDropdown();
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
      closeDropdown();
    }
  };

  const handleFileNameClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(document.previewUrl, '_blank');
    }
  };

  return (
    <>
      <StyledSpecialDocumentListItem>
        <StyledFileIcon>{getFileIcon(document.fileName || '')}</StyledFileIcon>
        <StyledFileInfo>
          <StyledFileName onClick={handleFileNameClick}>
            {document.fileName}
          </StyledFileName>
          <StyledFileDescription>
            {document.description || t`No description`}
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
                text={t`Edit`}
                LeftIcon={IconEdit}
                onClick={handleEdit}
              />
              <MenuItem
                text={t`Download`}
                LeftIcon={IconDownload}
                onClick={handleDownload}
              />
              {onRegenerate && (
                <MenuItem
                  text={t`Regenerate`}
                  LeftIcon={IconRefresh}
                  onClick={handleRegenerate}
                />
              )}
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

      <DocumentEditModal
        ref={modalRef}
        document={document}
        onClose={() => modalRef.current?.close()}
        onSave={(updates) => onSaveEdit(document.id, updates)}
      />
    </>
  );
};

const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.h4`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0;
`;

const StyledSectionDescription = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border.color.medium};
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledSectionHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  flex-direction: column;
  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
  }
`;

const PdfConfigurationModalWrapper = ({
  modalRef,
  property,
  pdfType,
  onGenerate,
}: {
  modalRef: React.RefObject<ModalRefType>;
  property: ObjectRecord;
  pdfType: PropertyPdfType;
  onGenerate: (result: {
    blob: Blob;
    fileName: string;
    previewUrl: string;
  }) => void;
}) => {
  const propertyPdfGenerator = usePropertyPdfGenerator({
    record: property,
  });

  const handleGeneratePdf = async (
    config: PdfFlyerConfiguration,
  ): Promise<void> => {
    try {
      const result = await propertyPdfGenerator.generatePdf(pdfType, config);
      if (result) {
        // Process the generated PDF immediately
        onGenerate(result);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (pdfType === 'PropertyDocumentation') {
    return (
      <DocumentationConfigurationModal
        ref={modalRef}
        property={property}
        onClose={() => modalRef.current?.close()}
        onGenerate={handleGeneratePdf}
      />
    );
  }

  return (
    <FlyerConfigurationModal
      ref={modalRef}
      property={property}
      onClose={() => modalRef.current?.close()}
      onGenerate={handleGeneratePdf}
    />
  );
};

export const PropertyDocumentFormInput = ({
  loading,
}: {
  loading?: boolean;
}) => {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { t } = useLingui();
  const theme = useTheme();
  const {
    propertyDocuments,
    addPropertyDocument,
    removePropertyDocument,
    refreshPropertyDocumentUrls,
    updatePropertyDocumentOrder,
    updatePropertyDocument,
    initialRecord: property,
  } = useRecordEdit();

  const { generatePdf, isLoading: pdfLoading } = usePropertyPdfGenerator({
    record: property,
  });

  const urlObjectsRef = useRef<Map<string, string>>(new Map());

  const createAndStorePersistentURL = (file: File): string => {
    const url = URL.createObjectURL(file);
    urlObjectsRef.current.set(url, file.name);
    return url;
  };

  useEffect(() => {
    if (hasRefreshed) return;

    refreshPropertyDocumentUrls();
    setHasRefreshed(true);

    return () => {
      urlObjectsRef.current.forEach((_, url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [hasRefreshed, refreshPropertyDocumentUrls]);

  const onAdd = (files: File[], type: PropertyAttachmentType) => {
    const newDocuments = files.map((file) => {
      const url = createAndStorePersistentURL(file);
      return {
        id: crypto.randomUUID(),
        isAttachment: false,
        file,
        downloadUrl: url,
        previewUrl: url,
        fileName: file.name,
        fileType: file.type,
        description: '',
        type,
      };
    });

    newDocuments.forEach((doc) => {
      addPropertyDocument(doc);
    });
  };

  const onRemove = (propertyDocument: RecordEditPropertyDocument) => {
    if (propertyDocument.previewUrl) {
      urlObjectsRef.current.delete(propertyDocument.previewUrl);
    }
    removePropertyDocument(propertyDocument);
  };

  const onSaveEdit = (
    id: string,
    updates: Partial<RecordEditPropertyDocument>,
  ) => {
    updatePropertyDocument(id, updates);
  };

  const exposePdfConfigModalRef = useRef<ModalRefType>(null);
  const flyerPdfConfigModalRef = useRef<ModalRefType>(null);

  const handleConfiguredPdfGeneration = (
    result: {
      blob: Blob;
      fileName: string;
      previewUrl: string;
    },
    type: PropertyPdfType,
  ) => {
    // Find and remove any existing document of this type before adding the new one
    const existingDoc = propertyDocuments.find((doc) => doc.type === type);
    if (existingDoc) {
      onRemove(existingDoc);
    }

    const fileObj = new File([result.blob], result.fileName, {
      type: 'application/pdf',
    });

    const url = createAndStorePersistentURL(fileObj);

    const doc = {
      id: crypto.randomUUID(),
      isAttachment: false,
      file: fileObj,
      previewUrl: url,
      fileName: result.fileName,
      type: type,
    };

    addPropertyDocument(doc);
  };

  const handleGenerateDocument = async (type: PropertyPdfType) => {
    if (!property) return;

    // Opening the configuration modal only, without deleting the existing document
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

        // For other document types, still handle replacement here
        const existingDoc = propertyDocuments.find((doc) => doc.type === type);
        if (existingDoc) {
          onRemove(existingDoc);
        }

        const file = new File([result.blob], result.fileName, {
          type: 'application/pdf',
        });

        const persistentUrl = createAndStorePersistentURL(file);

        const newDocument = {
          id: crypto.randomUUID(),
          isAttachment: false,
          file,
          previewUrl: persistentUrl,
          fileName: result.fileName,
          type: type,
        };

        addPropertyDocument(newDocument);
      } catch (error) {
        console.error('Error generating document:', error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    onDrop: (files) => {
      onAdd(files, 'PropertyDocument');
    },
    noClick: true,
    noDragEventsBubbling: true,
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const updatedDocuments = reorderDocuments(
      propertyDocuments,
      source.index,
      destination.index,
    );

    updatePropertyDocumentOrder(updatedDocuments);
  };

  const specialDocuments = [
    {
      type: 'PropertyDocumentation' as PropertyPdfType,
      title: t`Property Exposé`,
      description: t`Detailed property presentation document sent to potential buyers through the auto responder.`,
    },
    {
      type: 'PropertyFlyer' as PropertyPdfType,
      title: t`Property Flyer`,
      description: t`Concise property information overview sent to clients through the auto responder.`,
    },
  ];

  const renderContent = () => {
    if (!hasRefreshed || loading) {
      return (
        <>
          <StyledSpecialDocumentContainer>
            {[1, 2].map((index) => (
              <StyledSpecialDocumentRow key={index}>
                <StyledSpecialDocumentHeader>
                  <StyledDocumentInfo>
                    <Skeleton
                      width={200}
                      height={24}
                      baseColor={theme.background.secondary}
                      highlightColor={theme.background.transparent.lighter}
                    />
                    <Skeleton
                      width={300}
                      height={20}
                      baseColor={theme.background.secondary}
                      highlightColor={theme.background.transparent.lighter}
                    />
                  </StyledDocumentInfo>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Skeleton
                      width={80}
                      height={32}
                      baseColor={theme.background.secondary}
                      highlightColor={theme.background.transparent.lighter}
                    />
                    <Skeleton
                      width={80}
                      height={32}
                      baseColor={theme.background.secondary}
                      highlightColor={theme.background.transparent.lighter}
                    />
                  </div>
                </StyledSpecialDocumentHeader>
              </StyledSpecialDocumentRow>
            ))}
          </StyledSpecialDocumentContainer>

          <StyledDivider />

          <StyledSectionContainer>
            <Skeleton
              height={200}
              width={'100%'}
              baseColor={theme.background.secondary}
              highlightColor={theme.background.transparent.lighter}
            />
          </StyledSectionContainer>
        </>
      );
    }

    const standardDocuments = propertyDocuments.filter(
      (doc) => doc.type === 'PropertyDocument',
    );

    const specialDocumentTypes = [
      'PropertyDocumentation',
      'PropertyFlyer',
    ] as const;
    const specialDocs = Object.fromEntries(
      specialDocumentTypes.map((type) => [
        type,
        propertyDocuments.find((doc) => doc.type === type),
      ]),
    );

    return (
      <>
        <StyledSpecialDocumentContainer>
          {specialDocuments.map((doc) => {
            const docType = doc.type;
            const specialDoc = specialDocs[docType];
            return (
              <StyledSpecialDocumentRow key={docType}>
                <StyledSpecialDocumentHeader>
                  <StyledDocumentInfo>
                    <StyledDocumentTitle>{doc.title}</StyledDocumentTitle>
                    <StyledDocumentDescription>
                      {doc.description}
                    </StyledDocumentDescription>
                  </StyledDocumentInfo>
                  {!specialDoc && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="secondary"
                        size="small"
                        Icon={IconRefresh}
                        title={t`Generate`}
                        disabled={pdfLoading || !property}
                        onClick={() => handleGenerateDocument(doc.type)}
                      />
                      <Button
                        variant="primary"
                        size="small"
                        Icon={IconFileText}
                        title={t`Upload`}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.doc,.docx';
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files?.[0]) {
                              onAdd([files[0]], doc.type);
                            }
                          };
                          input.click();
                        }}
                      />
                    </div>
                  )}
                </StyledSpecialDocumentHeader>
                {specialDoc && (
                  <StyledSpecialDocumentContent>
                    <SpecialDocumentItem
                      document={specialDoc}
                      onRemove={onRemove}
                      onSaveEdit={onSaveEdit}
                      onClick={() =>
                        window.open(specialDoc.previewUrl, '_blank')
                      }
                      onRegenerate={() => handleGenerateDocument(doc.type)}
                    />
                  </StyledSpecialDocumentContent>
                )}
              </StyledSpecialDocumentRow>
            );
          })}
        </StyledSpecialDocumentContainer>

        <StyledDivider />

        <StyledSectionContainer>
          <StyledSectionHeader>
            <div>
              <StyledSectionTitle>{t`Additional Documents`}</StyledSectionTitle>
              <StyledSectionDescription>
                {t`Add any other documents that should be included in the publication.`}
              </StyledSectionDescription>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) onAdd(Array.from(files), 'PropertyDocument');
                };
                input.click();
              }}
              variant="secondary"
              Icon={IconUpload}
              title={t`Upload Documents`}
            />
          </StyledSectionHeader>

          {standardDocuments.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="property-documents">
                {(provided, snapshot) => (
                  <StyledDocumentList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={snapshot.isDraggingOver}
                  >
                    {standardDocuments.map((document, index) =>
                      !loading && hasRefreshed ? (
                        <DraggableDocumentItem
                          key={document.id}
                          document={document}
                          index={index}
                          onRemove={onRemove}
                          onSaveEdit={onSaveEdit}
                        />
                      ) : (
                        <Skeleton
                          key={index}
                          height={56}
                          baseColor={theme.background.secondary}
                          highlightColor={theme.background.transparent.lighter}
                        />
                      ),
                    )}
                    {provided.placeholder}
                  </StyledDocumentList>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </StyledSectionContainer>
      </>
    );
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative' }}>
      <input {...getInputProps()} />
      <StyledContainer>
        <StyledTitleContainer>
          <StyledTitle>{t`Property Documents`}</StyledTitle>
          <StyledDescription>
            {t`Add documents related to your property that will be visible in the publication.`}
          </StyledDescription>
        </StyledTitleContainer>

        {renderContent()}
      </StyledContainer>

      {isDragActive && propertyDocuments.length > 0 && (
        <StyledDragOverlay>
          <IconUpload size={32} />
          <span>{t`Drop documents here`}</span>
        </StyledDragOverlay>
      )}

      {property && (
        <>
          <PdfConfigurationModalWrapper
            modalRef={exposePdfConfigModalRef}
            property={property}
            pdfType="PropertyDocumentation"
            onGenerate={(result) =>
              handleConfiguredPdfGeneration(result, 'PropertyDocumentation')
            }
          />

          <PdfConfigurationModalWrapper
            modalRef={flyerPdfConfigModalRef}
            property={property}
            pdfType="PropertyFlyer"
            onGenerate={(result) =>
              handleConfiguredPdfGeneration(result, 'PropertyFlyer')
            }
          />
        </>
      )}
    </div>
  );
};
