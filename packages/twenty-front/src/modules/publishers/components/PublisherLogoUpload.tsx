import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import {
  Button,
  IconBuilding,
  IconEdit,
  IconTrash,
  IconUpload,
  MOBILE_VIEWPORT,
} from 'twenty-ui';
import Skeleton from 'react-loading-skeleton';
import { motion } from 'framer-motion';
import { Attachment } from '@/activities/files/types/Attachment';
import { AgencyLogoEffect } from '@/ui/layout/property-pdf/components/effects/AgencyLogoEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledLogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledImageWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background-color: ${({ theme }) => theme.background.tertiary};

  &.highlight-new {
    animation: highlightNew 1.5s ease-out;
  }

  @keyframes highlightNew {
    0% {
      box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue};
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
  object-fit: contain;
  object-position: center;
  width: 100%;
`;

const StyledImageContainer = styled(motion.div)`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .image-button {
    opacity: 1;
    visibility: visible;
  }
  &:hover .image-button {
    opacity: 1;
    visibility: visible;
  }

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    .image-button {
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.2s ease,
        visibility 0.2s ease;
    }
  }
`;

const StyledActionButtonBase = styled(motion.div)`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  position: absolute;
  width: 24px;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledDeleteButton = styled(StyledActionButtonBase)`
  right: 4px;
  top: 4px;
`;

const StyledEditButton = styled(StyledActionButtonBase)`
  left: 4px;
  top: 4px;
`;

const StyledPlaceholder = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDragOverlay = styled(motion.div)<{ isDragActive?: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 3px dashed ${({ theme }) => theme.border.color.medium};
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  left: 0;
  opacity: 0.95;
  position: absolute;
  right: 0;
  top: 0;
  transform: ${({ isDragActive }) =>
    isDragActive ? 'scale(1.01)' : 'scale(1)'};
  transition: transform 200ms ease-in-out;
  z-index: 1;
`;

export type PublisherLogoUploadHandle = {
  saveChanges: (publisherId?: string) => Promise<void>;
};

type PublisherLogoUploadProps = {
  initialPublisherId?: string;
  onImageChange?: (hasChanges: boolean) => void;
};

// Add the variants for the animations
const buttonVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  hover: { scale: 1.1 },
};

const imageContainerVariants = {
  hidden: { opacity: 0, y: 2 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Add new variants
const placeholderVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const dragOverlayVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 0.95, scale: 1, transition: { duration: 0.2 } },
};

export const PublisherLogoUpload = forwardRef<
  PublisherLogoUploadHandle,
  PublisherLogoUploadProps
>(({ initialPublisherId, onImageChange }, ref) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAttachmentMarkedForDeletion, setIsAttachmentMarkedForDeletion] =
    useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);

  const [logoAttachment, setLogoAttachment] = useState<Attachment | null>(null);

  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  // Expose the save function through the imperative handle
  useImperativeHandle(ref, () => ({
    saveChanges: async (publisherId?: string) => {
      if (!publisherId) {
        console.warn('Cannot save logo: no publisher ID available yet');
        return;
      }

      try {
        // Create a fresh targetableObject with the current publisherId
        const currentTargetableObject: ActivityTargetableObject = {
          id: publisherId,
          targetObjectNameSingular: CoreObjectNameSingular.Agency,
        };

        // Handle deletion if marked for deletion
        if (isAttachmentMarkedForDeletion && logoAttachment) {
          await deleteOneRecord(logoAttachment.id);
          setIsAttachmentMarkedForDeletion(false);
          setHasChanges(false);
          return;
        }

        // Handle upload of new logo
        if (selectedFile && hasChanges) {
          // Delete existing logo if there is one
          if (logoAttachment) {
            await deleteOneRecord(logoAttachment.id);
          }

          await uploadAttachmentFile(
            selectedFile,
            currentTargetableObject,
            'PublisherLogo',
            0,
            'Publisher Logo',
          );

          // Reset state
          setSelectedFile(null);
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Error saving logo changes:', error);
      }
    },
  }));

  // Notify parent component when there are changes
  useEffect(() => {
    onImageChange?.(hasChanges);
  }, [hasChanges, onImageChange]);

  const handleSelectFile = (file: File) => {
    if (!file) return;

    // If attachment was marked for deletion, unmark it
    if (isAttachmentMarkedForDeletion) {
      setIsAttachmentMarkedForDeletion(false);
    }

    // Revoke previous URL if exists to prevent memory leaks
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    // Create local preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    setSelectedFile(file);
    setHasChanges(true);

    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleSelectFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0]);
    }
  };

  const handleClickUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileInputChange(event);
    };
    fileInput.click();
  };

  const handleDeleteLocalImage = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      setSelectedFile(null);
      setHasChanges(false);
    }
  };

  const handleDeleteLogoAttachment = () => {
    if (logoAttachment) {
      // Mark the attachment for deletion instead of deleting it immediately
      setIsAttachmentMarkedForDeletion(true);
      setHasChanges(true);
    }
  };

  // Cleanup function to revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  return (
    <StyledContainer>
      {initialPublisherId ? (
        <AgencyLogoEffect
          agencyId={initialPublisherId}
          setAgencyLogo={setLogoAttachment}
          setLoading={setLoadingLogo}
        />
      ) : null}
      <StyledHeaderContainer>
        <StyledTitle>
          <Trans>Publisher Logo</Trans>
        </StyledTitle>
        <StyledDescription>
          <Trans>
            Upload your publisher logo that will be used in PDFs, documentation
            and flyers. A square logo with <strong>256x256px</strong> size is
            recommended.
          </Trans>
        </StyledDescription>
      </StyledHeaderContainer>

      <StyledLogoContainer>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <StyledImageWrapper className={isHighlighted ? 'highlight-new' : ''}>
            {loadingLogo ? (
              <Skeleton
                height={120}
                width={120}
                borderRadius={theme.border.radius.sm}
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
              />
            ) : localPreviewUrl ? (
              <StyledImageContainer
                variants={imageContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <StyledImage
                  src={localPreviewUrl}
                  alt="Publisher Logo Preview"
                />
                <StyledEditButton
                  className="image-button"
                  onClick={handleClickUpload}
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  <IconEdit size={14} color={theme.font.color.tertiary} />
                </StyledEditButton>
                <StyledDeleteButton
                  className="image-button"
                  onClick={handleDeleteLocalImage}
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  <IconTrash size={14} color={theme.font.color.tertiary} />
                </StyledDeleteButton>
              </StyledImageContainer>
            ) : logoAttachment && !isAttachmentMarkedForDeletion ? (
              <StyledImageContainer
                variants={imageContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <StyledImage
                  src={logoAttachment.fullPath}
                  alt="Publisher Logo"
                />
                <StyledEditButton
                  className="image-button"
                  onClick={handleClickUpload}
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  <IconEdit size={14} color={theme.font.color.tertiary} />
                </StyledEditButton>
                <StyledDeleteButton
                  className="image-button"
                  onClick={handleDeleteLogoAttachment}
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  <IconTrash size={14} color={theme.font.color.tertiary} />
                </StyledDeleteButton>
              </StyledImageContainer>
            ) : (
              <StyledPlaceholder
                variants={placeholderVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <IconBuilding size={32} />
                <span>
                  <Trans>No logo</Trans>
                </span>
              </StyledPlaceholder>
            )}

            {isDragActive && (
              <StyledDragOverlay
                isDragActive={isDragActive}
                variants={dragOverlayVariants}
                initial="hidden"
                animate="visible"
              >
                <IconUpload size={24} />
                <span>
                  <Trans>Drop logo here</Trans>
                </span>
              </StyledDragOverlay>
            )}
          </StyledImageWrapper>
        </div>

        {(!logoAttachment || isAttachmentMarkedForDeletion) &&
          !localPreviewUrl && (
            <div>
              <Button
                title={t`Upload Logo`}
                variant="secondary"
                Icon={IconUpload}
                onClick={handleClickUpload}
              />
            </div>
          )}
      </StyledLogoContainer>
    </StyledContainer>
  );
});
