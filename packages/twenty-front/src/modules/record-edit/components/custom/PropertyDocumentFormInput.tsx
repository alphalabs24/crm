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
  IconTrash,
  IconUpload,
  LARGE_DESKTOP_VIEWPORT,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { DocumentEditModal } from './DocumentEditModal';
import { downloadFile } from '@/activities/files/utils/downloadFile';

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
    if (document.attachment) {
      // Handle remote files
      downloadFile(document.attachment.fullPath, document.attachment.name);
    } else if (document.file) {
      // Handle local files
      const blob = new Blob([document.file], { type: document.file.type });
      saveAs(blob, document.file.name);
    }
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
  } = useRecordEdit();

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

  const standardDocuments = propertyDocuments.filter(
    (doc) => doc.type === 'PropertyDocument',
  );

  const renderContent = () => {
    if (!hasRefreshed || loading) {
      return (
        <StyledSectionContainer>
          <Skeleton
            height={200}
            width={'100%'}
            baseColor={theme.background.secondary}
            highlightColor={theme.background.transparent.lighter}
          />
        </StyledSectionContainer>
      );
    }

    return (
      <StyledSectionContainer>
        <StyledSectionHeader>
          <div>
            <StyledSectionTitle>{t`Property Documents`}</StyledSectionTitle>
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
    );
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative' }}>
      <input {...getInputProps()} />
      <StyledContainer>{renderContent()}</StyledContainer>

      {isDragActive && propertyDocuments.length > 0 && (
        <StyledDragOverlay>
          <IconUpload size={32} />
          <span>{t`Drop documents here`}</span>
        </StyledDragOverlay>
      )}
    </div>
  );
};
