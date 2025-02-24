/* eslint-disable react/jsx-props-no-spreading */
import {
  RecordEditPropertyDocument,
  useRecordEdit,
} from '@/record-edit/contexts/RecordEditContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  Button,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFile,
  IconFileZip,
  IconTrash,
  IconUpload,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { DocumentEditModal } from './DocumentEditModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { css } from '@emotion/react';

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledFileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledFileName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const StyledDropzone = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed
    ${({ theme, isDragActive }) =>
      isDragActive ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  background: ${({ theme, isDragActive }) =>
    isDragActive
      ? theme.background.transparent.lighter
      : theme.background.secondary};
  transition: all 200ms ease-in-out;
  transform: ${({ isDragActive }) =>
    isDragActive ? 'scale(1.01)' : 'scale(1)'};
  width: 100%;
  box-sizing: border-box;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledUploadIcon = styled(IconUpload)`
  color: ${({ theme }) => theme.font.color.light};
  width: 32px;
  height: 32px;
`;

const StyledDropzoneText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
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
    document: RecordEditPropertyDocument,
    name: string,
    description: string,
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
    const a = window.document.createElement('a');
    a.href = document.previewUrl;
    a.download = document.file?.name || '';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    closeDropdown();
  };

  const handleSaveEdit = (
    document: RecordEditPropertyDocument,
    name: string,
    description: string,
  ) => {
    onSaveEdit(document, name, description);
  };

  const handleOpen = () => {
    window.open(document.previewUrl, '_blank');
    closeDropdown();
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
              <StyledFileName>{document.fileName}</StyledFileName>
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
                    accent="danger"
                    LeftIcon={IconTrash}
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
        onSave={(document, name, description) =>
          handleSaveEdit(document, name, description)
        }
      />
    </>
  );
};

const StyledHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.primary};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
`;
const StyledDragOverlay = styled.div<{
  position?: 'relative' | 'absolute';
  isDragActive?: boolean;
}>`
  position: ${({ position }) =>
    position === 'relative' ? 'relative' : 'absolute'};

  cursor: ${({ position }) =>
    position === 'relative' ? 'pointer' : 'default'};

  min-height: 80px;

  ${({ position }) =>
    position === 'relative' &&
    css`
      transition: all 200ms ease-in-out;
    `}

  transform: ${({ isDragActive }) =>
    isDragActive ? 'scale(1.01)' : 'scale(1)'};

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
    background: ${({ theme }) => theme.background.tertiary};
  }

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed ${({ theme }) => theme.border.color.medium};

  background: ${({ theme, position, isDragActive }) =>
    position === 'relative' && isDragActive
      ? theme.background.transparent.lighter
      : theme.background.primary};
  opacity: 0.95;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  z-index: 1;
  pointer-events: ${({ position }) =>
    position === 'relative' ? 'auto' : 'none'};
`;

export const PropertyDocumentFormInput = ({
  loading,
}: {
  loading?: boolean;
}) => {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { t } = useLingui();

  const {
    propertyDocuments,
    addPropertyDocument,
    removePropertyDocument,
    refreshPropertyDocumentUrls,
    updatePropertyDocumentOrder,
    updatePropertyDocument,
  } = useRecordEdit();

  const previewFileUrls = propertyDocuments
    .filter((doc) => !doc.isAttachment)
    .map((doc) => doc.previewUrl);

  useEffect(() => {
    if (hasRefreshed) return;

    refreshPropertyDocumentUrls();
    setHasRefreshed(true);
    return () => {
      previewFileUrls.forEach((previewFileUrl) => {
        if (isDefined(previewFileUrl)) {
          URL.revokeObjectURL(previewFileUrl);
        }
      });
    };
  }, [hasRefreshed, previewFileUrls, refreshPropertyDocumentUrls]);

  const [newDocumentIds, setNewDocumentIds] = useState<Set<string>>(new Set());

  const onAdd = async (acceptedFiles: File[]) => {
    const newDocuments = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      isAttachment: false,
      file,
      downloadUrl: URL.createObjectURL(file),
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileType: file.type,
      description: '',
    }));

    const newIds = new Set(newDocuments.map((doc) => doc.id));
    setNewDocumentIds(newIds);

    setTimeout(() => {
      setNewDocumentIds(new Set());
    }, 1500);

    newDocuments.forEach((doc) => {
      addPropertyDocument(doc);
    });
  };

  const onRemove = (propertyDocument: RecordEditPropertyDocument) => {
    URL.revokeObjectURL(propertyDocument.previewUrl);
    removePropertyDocument(propertyDocument);
  };

  const onSaveEdit = (
    document: RecordEditPropertyDocument,
    name: string,
    description: string,
  ) => {
    updatePropertyDocument(document.id, {
      fileName: name,
      description,
    });
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
    onDrop: onAdd,
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

  const renderContent = () => {
    if (!hasRefreshed) {
      return <Skeleton height={200} width={'100%'} />;
    }

    if (propertyDocuments.length === 0) {
      return (
        <StyledDragOverlay
          position="relative"
          isDragActive={isDragActive}
          onClick={(e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) onAdd(Array.from(files));
            };
            input.click();
          }}
        >
          <IconUpload size={32} />
          <span>{t`Drop documents here`}</span>
        </StyledDragOverlay>
      );
    }
    return (
      <>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="property-documents">
            {(provided, snapshot) => (
              <StyledDocumentList
                ref={provided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
              >
                {propertyDocuments.map((document, index) =>
                  !loading && hasRefreshed ? (
                    <DraggableDocumentItem
                      key={document.id}
                      document={document}
                      index={index}
                      onRemove={onRemove}
                      onSaveEdit={onSaveEdit}
                      isNew={newDocumentIds.has(document.id)}
                    />
                  ) : (
                    <Skeleton key={index} height={56} />
                  ),
                )}
                {provided.placeholder}
              </StyledDocumentList>
            )}
          </Droppable>
        </DragDropContext>
      </>
    );
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative' }}>
      <input {...getInputProps()} />
      <StyledContainer>
        <StyledHeaderContainer>
          <StyledTitleContainer>
            <StyledTitle>{t`Property Documents`}</StyledTitle>
            <StyledDescription>
              {t`Add documents related to your property that will be visible in the publication.`}
            </StyledDescription>
          </StyledTitleContainer>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) onAdd(Array.from(files));
              };
              input.click();
            }}
            variant="secondary"
            title={t`Upload Documents`}
            Icon={IconUpload}
          />
        </StyledHeaderContainer>

        {renderContent()}
      </StyledContainer>

      {isDragActive && propertyDocuments.length > 0 && (
        <StyledDragOverlay>
          <IconUpload size={32} />
          <span>{t`Drop documents here`}</span>
        </StyledDragOverlay>
      )}
    </div>
  );
};
