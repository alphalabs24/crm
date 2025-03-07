import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports

import { motion } from 'framer-motion';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Button,
  IconUpload,
  LARGE_DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
} from 'twenty-ui';

import { PlatformSelect } from './modal-pages/PlatformSelect';
import { PlatformId } from './types/Platform';
import { useLingui } from '@lingui/react/macro';
import { ValidationResult } from '../../hooks/usePublicationValidation';

const StyledModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    padding: 0 ${({ theme }) => theme.spacing(4)};
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

type Step =
  | 'platform-select'
  | 'upload-assets'
  | 'content-customize'
  | 'real-estate-config';

const ANIMATION_DURATION = 0.2;

type PublishModalProps = {
  onClose: () => void;
  targetableObject: {
    id: string;
    targetObjectNameSingular: string;
  };
  validationDetails: ValidationResult;
};

export const PublishDraftModal = forwardRef<ModalRefType, PublishModalProps>(
  ({ onClose, targetableObject, validationDetails }, ref) => {
    const [currentStep, setCurrentStep] = useState<Step>('platform-select');
    const { t } = useLingui();
    const [selectedPlatforms, setSelectedPlatforms] = useState<
      PlatformId[] | null
    >(null);

    const { attachments = [] } = useAttachments(targetableObject);

    const images = useMemo(
      () => attachments.filter((attachment) => attachment.type === 'Image'),
      [attachments],
    );

    const handlePlatformSelect = (platformId: PlatformId) => {
      setSelectedPlatforms((prev) =>
        prev?.includes(platformId)
          ? prev?.filter((id) => id !== platformId)
          : [...(prev || []), platformId],
      );
    };

    useEffect(() => {
      if (images.length > 0 && currentStep === 'upload-assets') {
        setTimeout(() => {
          setCurrentStep('content-customize');
        }, 500);
      }
    }, [images, currentStep]);

    return (
      <Modal
        size="large"
        onClose={onClose}
        isClosable
        ref={ref}
        closedOnMount
        hotkeyScope={ModalHotkeyScope.Default}
        padding="none"
        portal
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconUpload size={16} />
            <StyledModalTitle>Publication Draft</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent
          key="select"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: ANIMATION_DURATION, ease: 'easeInOut' }}
        >
          <PlatformSelect
            handlePlatformSelect={handlePlatformSelect}
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
            recordId={targetableObject.id}
            closeModal={onClose}
            validationDetails={validationDetails}
          />
        </StyledModalContent>
      </Modal>
    );
  },
);

PublishDraftModal.displayName = 'PublishDraftModal';
