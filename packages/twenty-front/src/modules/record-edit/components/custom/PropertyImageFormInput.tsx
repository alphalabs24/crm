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
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  Button,
  IconDotsVertical,
  IconEdit,
  IconPhoto,
  IconTrash,
  IconUpload,
  MenuItem,
  TooltipDelay,
} from 'twenty-ui';
import { ImageEditModal } from './ImageEditModal';
import { ImageGridDnd } from './ImageGridDnd';

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

const StyledImageWrapper = styled.div`
  position: relative;
  height: 120px;
  width: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  cursor: grab;
  will-change: transform;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

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

const StyledDropdownButtonContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
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
  border-radius: ${({ theme }) => theme.border.radius.md};
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

  ${({ position }) =>
    position === 'relative' &&
    css`
      transition: all 200ms ease-in-out;
    `}

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

// Custom overlay for the image grid that has additional information
const CustomImageControls = ({
  image,
  onRemove,
  onSaveEdit,
  isNew,
}: {
  image: RecordEditPropertyImage;
  onRemove: (image: RecordEditPropertyImage) => void;
  onSaveEdit: (image: RecordEditPropertyImage, description: string) => void;
  isNew?: boolean;
}) => {
  const [hovering, setHovering] = useState(false);
  const { t } = useLingui();
  const dropdownId = `image-${image.id}-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const theme = useTheme();

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
      <StyledDropdownButtonContainer>
        <AppTooltip
          anchorSelect={`#image-${image.id}`}
          content={image.description || t`No description`}
          place="bottom"
          noArrow
          delay={TooltipDelay.noDelay}
          isOpen={hovering}
          clickable
        />
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <Button
              variant="tertiary"
              size="small"
              Icon={IconDotsVertical}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            />
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
      {isEditModalOpen && (
        <ImageEditModal
          image={image}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
      {isNew && (
        <div
          className="highlight-new"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: theme.border.radius.sm,
            pointerEvents: 'none',
          }}
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

  const onReorder = (newOrder: { id: string; previewUrl: string }[]) => {
    // Map the simplified image objects back to the full RecordEditPropertyImage objects
    const reorderedImages = newOrder.map(
      (item) => propertyImages.find((img) => img.id === item.id)!,
    );
    updatePropertyImageOrder(reorderedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    onDrop: onAdd,
    noClick: true,
    noDragEventsBubbling: true,
  });

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

    // Convert property images to the format expected by ImageGridDnd
    const simplifiedImages = propertyImages.map((image) => ({
      id: image.id,
      previewUrl: image.previewUrl,
    }));

    // Render controls for a specific image ID
    const renderControls = (imageId: string) => {
      const image = propertyImages.find((img) => img.id === imageId);
      if (!image) return null;

      return (
        <CustomImageControls
          image={image}
          onRemove={onRemove}
          onSaveEdit={onSaveEdit}
          isNew={newImageIds.has(image.id)}
        />
      );
    };

    return (
      <div style={{ position: 'relative' }}>
        <ImageGridDnd
          images={simplifiedImages}
          onReorder={onReorder}
          renderControls={renderControls}
        />
      </div>
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
