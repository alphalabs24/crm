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
  Button,
  IconDotsVertical,
  IconEdit,
  IconPhoto,
  IconTrash,
  IconUpload,
  MenuItem,
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
  transition: opacity 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    opacity: 1;
  }
`;

const StyledSkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const StyledSkeletonItem = styled(Skeleton)`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 120px;
  width: 100%;
`;

// Custom overlay for the image grid that has additional information
const CustomImageControls = ({
  image,
  onRemove,
  onSaveEdit,
  isHovering,
}: {
  image: RecordEditPropertyImage;
  onRemove: (image: RecordEditPropertyImage) => void;
  onSaveEdit: (image: RecordEditPropertyImage, description: string) => void;
  isHovering: boolean;
}) => {
  const { t } = useLingui();
  const dropdownId = `image-${image.id}-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <StyledDropdownButtonContainer className="no-drag">
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <StyledRemoveButton show={isHovering}>
              <IconDotsVertical size={14} color={theme.font.color.primary} />
            </StyledRemoveButton>
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              <MenuItem
                text={t`Edit Description`}
                LeftIcon={IconEdit}
                onClick={() => {
                  setIsEditModalOpen(true);
                  closeDropdown();
                }}
              />
              <MenuItem
                text={t`Delete`}
                accent="danger"
                LeftIcon={IconTrash}
                onClick={() => {
                  onRemove(image);
                  closeDropdown();
                }}
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
          onSave={(description) => onSaveEdit(image, description)}
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

  const onReorder = (
    newOrder: { id: string; previewUrl: string; tooltipContent?: string }[],
  ) => {
    // Map the simplified image objects back to the full RecordEditPropertyImage objects
    const reorderedImages = newOrder.map((item) =>
      propertyImages.find((img) => img.id === item.id),
    );
    // If any image is not found, return
    if (reorderedImages.some((image) => !image)) {
      return;
    }
    updatePropertyImageOrder(reorderedImages as RecordEditPropertyImage[]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: onAdd,
    noClick: true,
    noDragEventsBubbling: true,
  });

  const renderContent = () => {
    // Show loading skeleton when explicitly loading or while refreshing URLs
    if (loading || !hasRefreshed) {
      // Determine number of skeleton items to show
      // If we have existing images, match that count, otherwise show at least 4
      const skeletonCount =
        propertyImages.length > 0 ? propertyImages.length : 4;

      return (
        <StyledSkeletonGrid>
          {Array(skeletonCount)
            .fill(0)
            .map((_, index) => (
              <StyledSkeletonItem
                key={index}
                baseColor={theme.background.secondary}
                highlightColor={theme.background.transparent.lighter}
              />
            ))}
        </StyledSkeletonGrid>
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
    // Include the description for the tooltip
    const simplifiedImages = propertyImages.map((image) => ({
      id: image.id,
      previewUrl: image.previewUrl,
      tooltipContent: image.description || t`No description`, // Pass description for tooltip
    }));

    // Render controls for a specific image ID
    const renderControls = (imageId: string, isHovering = false) => {
      const image = propertyImages.find((img) => img.id === imageId);
      if (!image) return null;

      return (
        <CustomImageControls
          image={image}
          onRemove={onRemove}
          onSaveEdit={onSaveEdit}
          isHovering={isHovering}
        />
      );
    };

    return (
      <div style={{ position: 'relative' }}>
        <ImageGridDnd
          images={simplifiedImages}
          onReorder={onReorder}
          renderControls={renderControls}
          newImageIds={newImageIds}
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
