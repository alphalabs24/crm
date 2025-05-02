/* eslint-disable react/jsx-props-no-spreading */
import {
  RecordEditPropertyImage,
  useRecordEdit,
} from '@/record-edit/contexts/RecordEditContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  Button,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconPhoto,
  IconTrash,
  IconUpload,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { ImageEditModal } from './ImageEditModal';
import RGL, { WidthProvider } from 'react-grid-layout';
const ReactGridLayout = WidthProvider(RGL);

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  min-height: 120px;
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

  /* Prevent flex items from stretching */
  align-items: flex-start;

  /* Smooth scroll behavior */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
`;

const StyledGridItem = styled.div`
  height: 100%;
  position: relative;
  transition: transform 0.2s ease;
  user-select: none;
  -webkit-user-drag: none;
  width: 100%;

  &:hover {
    transform: scale(1.02);
  }
`;

const StyledGridLayout = styled(ReactGridLayout)`
  width: 100% !important;
  position: relative;

  .react-grid-item {
    transition: all 0.2s ease;
    transition-property: transform, left, top, width, height;

    &.react-grid-placeholder {
      background: ${({ theme }) => theme.background.transparent.lighter};
      border-radius: ${({ theme }) => theme.border.radius.sm};
      opacity: 0.4;
      z-index: 2;
    }

    &.react-draggable-dragging {
      transition: none;
      z-index: 3;
      will-change: transform;
      cursor: grabbing;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
`;

const StyledSkeletonLoader = styled(Skeleton)`
  display: inline-block;
  flex: 0 0 120px;
  margin: 0 8px 0 0; /* Add this to respect white-space: nowrap */
  height: 120px;
  width: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledImageWrapper = styled.div`
  position: relative;
  height: 120px;
  width: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  cursor: grab;
  will-change: transform;
  display: inline-block; /* Add this to respect white-space: nowrap */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  /* Prevent browser's default drag */
  -webkit-user-drag: none;
  user-select: none;

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
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
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

const StyledDropdownButtonContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
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

const StyledHeaderContainer = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

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
  return result;
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

  // Prevent browser's default drag behavior
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const theme = useTheme();

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
      <StyledImageWrapper
        className={isNew ? 'highlight-new' : ''}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onDragStart={handleDragStart}
      >
        <StyledImage
          src={image.previewUrl}
          alt=""
          loading="lazy"
          id={`image-${image.id}`}
          onDragStart={handleDragStart}
          draggable="false"
        />

        <StyledDropdownButtonContainer>
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <StyledRemoveButton show={hovering}>
                <IconDotsVertical size={14} color={theme.font.color.primary} />
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

export const PropertyImageFormInput = ({ loading }: { loading?: boolean }) => {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { t } = useLingui();
  const theme = useTheme();
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    }, 2500);

    newPreviewFiles.forEach((file) => {
      addPropertyImage({
        ...file,
        description: '',
      });
    });
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
    noClick: true,
    noDragEventsBubbling: true,
  });

  const gridRef = useRef<HTMLDivElement | null>(null);

  const checkScrollability = useCallback(() => {
    if (isDefined(gridRef.current)) {
      const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  }, []);

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
      return (
        <Skeleton
          height={200}
          width={'100%'}
          baseColor={theme.background.secondary}
          highlightColor={theme.background.transparent.lighter}
        />
      );
    }

    if (propertyImages.length === 0) {
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
          <span>{t`Drop images here`}</span>
        </StyledDragOverlay>
      );
    }

    // Calculate optimal number of columns based on viewport
    const calculateCols = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 768) return 2;
      if (viewportWidth < 1024) return 3;
      if (viewportWidth < 1440) return 4;
      return 5;
    };

    const cols = calculateCols();

    return (
      <>
        <StyledGridLayout
          className="layout"
          cols={cols}
          rowHeight={140}
          compactType="horizontal"
          isResizable={false}
          margin={[12, 12]}
          verticalCompact={true}
          preventCollision={false}
          onLayoutChange={(layout) => {
            // Ensure the correct order is maintained in the layout
            const normalizedLayout = [...layout].sort((a, b) => {
              if (a.y !== b.y) return a.y - b.y;
              return a.x - b.x;
            });

            // Update x and y values to maintain consistent left-to-right, top-to-bottom ordering
            for (let i = 0; i < normalizedLayout.length; i++) {
              const row = Math.floor(i / cols);
              const col = i % cols;
              normalizedLayout[i].x = col;
              normalizedLayout[i].y = row;
            }
          }}
          onDragStop={(layout) => {
            // Create a copy of the layout to avoid mutating the original
            const newLayout = [...layout];

            // Sort by position (row first, then column)
            newLayout.sort((a, b) => {
              if (a.y !== b.y) return a.y - b.y;
              return a.x - b.x;
            });

            // Get the images in the new order
            const newOrder = newLayout
              .map((l) => propertyImages.find((img) => img.id === l.i))
              .filter(Boolean) as RecordEditPropertyImage[];

            // Only update if there's a change
            const hasChanged = newOrder.some(
              (img, idx) => img.id !== propertyImages[idx]?.id,
            );

            if (hasChanged) {
              updatePropertyImageOrder(newOrder);
            }
          }}
          draggableHandle=".drag-handle"
        >
          {propertyImages.map((image, index) => {
            const gridItem = {
              i: image.id,
              x: index % cols,
              y: Math.floor(index / cols),
              w: 1,
              h: 1,
              static: false,
            };

            return (
              <StyledGridItem
                key={image.id}
                data-grid={gridItem}
                className="drag-handle"
              >
                {!loading && hasRefreshed ? (
                  <DraggableImageItem
                    image={image}
                    index={index}
                    onRemove={onRemove}
                    onSaveEdit={onSaveEdit}
                    isNew={newImageIds.has(image.id)}
                  />
                ) : (
                  <StyledSkeletonLoader
                    height={120}
                    width={120}
                    borderRadius={theme.border.radius.sm}
                    highlightColor={theme.background.transparent.medium}
                    baseColor={theme.background.transparent.lighter}
                  />
                )}
              </StyledGridItem>
            );
          })}
        </StyledGridLayout>
      </>
    );
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative' }}>
      <input {...getInputProps()} />
      <StyledContainer>
        <StyledHeaderContainer>
          <StyledTitleContainer>
            <StyledTitle>{t`Property Images`}</StyledTitle>
            <StyledDescription>
              {t`Add images of your property that will be visible in the publication.`}
            </StyledDescription>
          </StyledTitleContainer>
          <Button
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
            variant="secondary"
            title={t`Upload Images`}
            Icon={IconPhoto}
          />
        </StyledHeaderContainer>

        {renderContent()}
      </StyledContainer>

      {isDragActive && propertyImages.length > 0 && (
        <StyledDragOverlay>
          <IconUpload size={32} />
          <span>{t`Drop images here`}</span>
        </StyledDragOverlay>
      )}
    </div>
  );
};
