/* eslint-disable react/jsx-props-no-spreading */
import {
  RecordEditPropertyImage,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUpload,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { ImageEditModal } from './ImageEditModal';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledImageGrid = styled.div<{ isDraggingOver?: boolean }>`
  display: flex;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme, isDraggingOver }) =>
    isDraggingOver ? theme.background.transparent.lighter : 'transparent'};

  /* Add horizontal scroll */
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  /* Smooth scroll behavior */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
`;

const StyledSkeletonLoader = styled(Skeleton)`
  height: 120px;
  margin: 0 8px 0 0;
  width: 120px;
`;

const StyledImageWrapper = styled.div`
  position: relative;
  flex: 0 0 120px; /* Fixed width, no growing or shrinking */
  height: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  cursor: move;
  will-change: transform;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }

  &.highlight-new {
    animation: highlightNew 1.5s ease-out;
  }

  @keyframes highlightNew {
    0% {
      scale: 0;
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

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledRemoveButton = styled.button<{ show: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ show }) => (show ? 1 : 0)};
  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
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

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledImageGridContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledScrollButton = styled.button<{ direction: 'left' | 'right' }>`
  align-items: center;
  ${({ direction }) => direction}: 0;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 50%;

  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;

  height: 32px;
  justify-content: center;
  opacity: 0.8;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  transition: all 0.2s ease;
  width: 32px;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    opacity: 1;
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

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // base styles
  userSelect: 'none' as const,
  margin: `0 8px 0 0`,

  // change appearance when dragging
  transform: isDragging ? 'scale(1.05)' : 'scale(1)',
  transition: 'transform 0.2s ease',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const reorderImages = (
  list: RecordEditPropertyImage[],
  startIndex: number,
  endIndex: number,
): RecordEditPropertyImage[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  // Update orderIndex for all items
  return result.map((image, index) => ({
    ...image,
    orderIndex: index,
  }));
};

const DraggableImageItem = ({
  image,
  index,
  onRemove,
  isNew,
  onSaveEdit,
}: {
  image: RecordEditPropertyImage;
  index: number;
  onRemove: (image: RecordEditPropertyImage) => void;
  onSaveEdit: (image: RecordEditPropertyImage, description: string) => void;
  isNew?: boolean;
}) => {
  const [hovering, setHovering] = useState(false);
  const { t } = useLingui();
  const dropdownId = `image-${image.id}-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = () => {
    onRemove(image);
    closeDropdown();
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setHovering(false);
    closeDropdown();
  };

  const handleSaveEdit = (newDescription: string) => {
    onSaveEdit(image, newDescription);
  };

  return (
    <>
      <AppTooltip
        anchorSelect={`#image-${image.id}`}
        content={image.description || t`No description`}
        place="bottom"
        noArrow
        delay={TooltipDelay.noDelay}
        isOpen={hovering}
        clickable
      />
      <Draggable key={image.id} draggableId={image.id} index={index}>
        {(provided, snapshot) => (
          <StyledImageWrapper
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
          >
            <StyledImage
              src={image.previewUrl}
              alt=""
              loading="lazy"
              id={`image-${image.id}`}
            />

            <StyledDropdownButtonContainer>
              <Dropdown
                dropdownId={dropdownId}
                clickableComponent={
                  <StyledRemoveButton show={hovering}>
                    <IconDotsVertical size={14} />
                  </StyledRemoveButton>
                }
                dropdownMenuWidth={160}
                dropdownComponents={
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text={t`Edit Description`}
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
            </StyledDropdownButtonContainer>
          </StyledImageWrapper>
        )}
      </Draggable>
      {isEditModalOpen && (
        <ImageEditModal
          image={image}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

const StyledFullHeightDropzone = styled(StyledDropzone)`
  min-height: 200px;
`;

export const PropertyImageFormInput = ({ loading }: { loading?: boolean }) => {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { t } = useLingui();
  const {
    propertyImages,
    addPropertyImage,
    removePropertyImage,
    refreshPropertyImageUrls,
    updatePropertyImageOrder,
    updatePropertyImage,
  } = useRecordEdit();

  const previewFileUrls = propertyImages
    .filter((image) => !image.isAttachment)
    .map((image) => image.previewUrl);

  useEffect(() => {
    if (hasRefreshed) return;

    // Refresh property image URLs when the component mounts
    refreshPropertyImageUrls();
    setHasRefreshed(true);
    return () => {
      // Cleanup object URLs on unmount to free up memory
      previewFileUrls.forEach((previewFileUrl) => {
        if (isDefined(previewFileUrl)) {
          URL.revokeObjectURL(previewFileUrl);
        }
      });
    };
  }, [hasRefreshed, previewFileUrls, refreshPropertyImageUrls]);

  const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());

  const onAdd = async (acceptedFiles: File[]) => {
    const newPreviewFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      isAttachment: false,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    // Track new image IDs
    const newIds = new Set(newPreviewFiles.map((file) => file.id));
    setNewImageIds(newIds);

    // Clear highlight after 2.5 seconds
    setTimeout(() => {
      setNewImageIds(new Set());
    }, 1500);

    newPreviewFiles.forEach((file) => {
      addPropertyImage({
        ...file,
        orderIndex: propertyImages.length,
        description: '',
      });
    });

    // Scroll to end after adding images
    setTimeout(() => {
      if (isDefined(gridRef.current)) {
        gridRef.current.scrollTo({
          left: gridRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const onRemove = (propertyImage: RecordEditPropertyImage) => {
    // Invalidate Url
    URL.revokeObjectURL(propertyImage.previewUrl);
    removePropertyImage(propertyImage);
  };

  const onSaveEdit = (image: RecordEditPropertyImage, description: string) => {
    updatePropertyImage(image.id, { description });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    onDrop: onAdd,
  });

  // Initialize images with orderIndex from attachments or array index
  const sortedImages = useMemo(() => {
    return [...propertyImages].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [propertyImages]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const updatedImages = reorderImages(
      sortedImages,
      source.index,
      destination.index,
    );

    updatePropertyImageOrder(updatedImages);
  };

  // eslint-disable-next-line @nx/workspace-no-state-useref
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    if (isDefined(gridRef.current)) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability, propertyImages]);

  // Add scroll event listener to update button visibility
  useEffect(() => {
    const gridElement = gridRef.current;
    if (isDefined(gridElement)) {
      gridElement.addEventListener('scroll', checkScrollability);
      return () =>
        gridElement.removeEventListener('scroll', checkScrollability);
    }
  }, [checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    if (isDefined(gridRef.current)) {
      const scrollAmount = 240; // Two images + gap
      const newScrollPosition =
        gridRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      gridRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const renderContent = () => {
    if (!hasRefreshed) {
      return <Skeleton height={200} width={'100%'} />;
    }

    if (sortedImages.length === 0) {
      return (
        <StyledFullHeightDropzone
          {...getRootProps()}
          isDragActive={isDragActive}
        >
          <input {...getInputProps()} />
          <StyledUploadIcon />
          <StyledDropzoneText>
            {isDragActive
              ? t`Drop the files here...`
              : t`Drag & drop images here, or click to select files`}
          </StyledDropzoneText>
        </StyledFullHeightDropzone>
      );
    }

    return (
      <>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="property-images" direction="horizontal">
            {(provided, snapshot) => (
              <StyledImageGridContainer>
                {showScrollButtons && (
                  <>
                    {canScrollLeft && (
                      <StyledScrollButton
                        direction="left"
                        onClick={() => scroll('left')}
                        aria-label={t`Scroll left`}
                      >
                        <IconChevronLeft size={16} />
                      </StyledScrollButton>
                    )}
                    {canScrollRight && (
                      <StyledScrollButton
                        direction="right"
                        onClick={() => scroll('right')}
                        aria-label={t`Scroll right`}
                      >
                        <IconChevronRight size={16} />
                      </StyledScrollButton>
                    )}
                  </>
                )}
                <StyledImageGrid
                  ref={(el) => {
                    (
                      gridRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = el;
                    provided.innerRef(el);
                  }}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  {sortedImages.map((image, index) =>
                    !loading && hasRefreshed ? (
                      <DraggableImageItem
                        key={image.id}
                        image={image}
                        index={index}
                        onRemove={onRemove}
                        onSaveEdit={onSaveEdit}
                        isNew={newImageIds.has(image.id)}
                      />
                    ) : (
                      <StyledSkeletonLoader key={index} />
                    ),
                  )}
                  {provided.placeholder}
                </StyledImageGrid>
              </StyledImageGridContainer>
            )}
          </Droppable>
        </DragDropContext>

        <StyledDropzone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <StyledUploadIcon />
          <StyledDropzoneText>
            {isDragActive
              ? t`Drop the files here...`
              : t`Drag & drop images here, or click to select files`}
          </StyledDropzoneText>
        </StyledDropzone>
      </>
    );
  };

  return (
    <StyledContainer>
      <StyledTitleContainer>
        <StyledTitle>{t`Property Images`}</StyledTitle>
        <StyledDescription>
          {t`Add images of your property that will be visible in the publication.`}
        </StyledDescription>
      </StyledTitleContainer>
      {renderContent()}
    </StyledContainer>
  );
};
const StyledDropdownButtonContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
`;
