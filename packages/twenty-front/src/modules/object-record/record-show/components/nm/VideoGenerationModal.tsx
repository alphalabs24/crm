import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { ContentCustomize } from '@/ui/layout/show-page/components/nm/modal-pages/ContentCustomize';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, useState } from 'react';
import { Button, IconVideo, LARGE_DESKTOP_VIEWPORT } from 'twenty-ui';

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    padding: 0 ${({ theme }) => theme.spacing(4)};
    height: 50px;
  }
`;

const StyledModalHeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledModalTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type VideoGenerationModalProps = {
  onClose: () => void;
  onGenerate: () => void;
  targetableObject: {
    id: string;
    targetObjectNameSingular: string;
  };
};

export const VideoGenerationModal = forwardRef<
  ModalRefType,
  VideoGenerationModalProps
>(({ onClose, onGenerate, targetableObject }, ref) => {
  const { t } = useLingui();
  const { attachments = [] } = useAttachments(targetableObject);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const images =
    attachments?.filter((attachment) => attachment.type === 'PropertyImage') ??
    [];

  const handleGenerate = () => {
    setIsGenerating(true);
    onGenerate();
  };

  return (
    <Modal
      ref={ref}
      size="extraLarge"
      onClose={onClose}
      isClosable
      closedOnMount
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
      portal
    >
      <StyledModalHeader>
        <StyledModalTitleContainer>
          <IconVideo size={16} />
          <StyledModalTitle>Generate Marketing Video</StyledModalTitle>
        </StyledModalTitleContainer>
        <StyledModalHeaderButtons>
          <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
        </StyledModalHeaderButtons>
      </StyledModalHeader>
      <StyledModalContent>
        <ContentCustomize
          images={images}
          selectedImagesForPost={images.map((image) => image.id)}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          isVideoSelected={isVideoSelected}
          description={description}
          setDescription={setDescription}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          setIsGenerating={setIsGenerating}
          setGenerationProgress={setGenerationProgress}
          setIsVideoSelected={setIsVideoSelected}
        />
      </StyledModalContent>
    </Modal>
  );
});

VideoGenerationModal.displayName = 'VideoGenerationModal';
