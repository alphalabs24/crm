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

const StyledSkeletonLoader = styled(Skeleton)`
  display: inline-block;
  flex: 0 0 120px;
  margin: 0 8px 0 0; /* Add this to respect white-space: nowrap */
`;

const StyledImageWrapper = styled.div`
  position: relative;
  flex: 0 0 120px; /* Fixed width, no growing or shrinking */
  height: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  cursor: move;
  will-change: transform;
  display: inline-block; /* Add this to respect white-space: nowrap */

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

  useEffect(() => {
    // Check on mount and when images change
    checkScrollability();

    // Check on scroll
    const gridElement = gridRef.current;
    if (isDefined(gridElement)) {
      gridElement.addEventListener('scroll', checkScrollability);
    }

    // Check on window resize
    window.addEventListener('resize', checkScrollability);

    // Check after images load
    const observer = new ResizeObserver(checkScrollability);
    if (gridElement) {
      observer.observe(gridElement);
    }

    return () => {
      if (isDefined(gridElement)) {
        gridElement.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
      observer.disconnect();
    };
  }, [checkScrollability, propertyImages]);

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

    return (
      <>
        <ReactGridLayout
          className="layout"
          cols={4}
          rowHeight={140}
          width={800}
          margin={[12, 12]}
          isResizable={false}
          compactType={'horizontal'} // disables automatic vertical compaction
          onDragStop={(layout) => {
            // Sort by y then x to get the new visual order
            const sorted = [...layout].sort((a, b) =>
              a.y === b.y ? a.x - b.x : a.y - b.y,
            );

            const newOrder = sorted
              .map((l) => propertyImages.find((img) => img.id === l.i))
              .filter(Boolean) as RecordEditPropertyImage[];

            updatePropertyImageOrder(newOrder);
          }}
        >
          {propertyImages.map((image, index) => {
            const gridItem = {
              i: image.id,
              x: index % 4, // 4 columns
              y: Math.floor(index / 4),
              w: 1,
              h: 1,
              static: false,
            };

            return (
              <div key={image.id} data-grid={gridItem}>
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
              </div>
            );
          })}
        </ReactGridLayout>
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
