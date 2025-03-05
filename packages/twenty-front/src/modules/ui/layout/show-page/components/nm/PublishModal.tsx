import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports

import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Button, IconUpload, LARGE_DESKTOP_VIEWPORT } from 'twenty-ui';

import { Publishing } from '@/ui/layout/show-page/components/nm/modal-pages/Publishing';
import { PlatformId } from './types/Platform';
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
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
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

const ANIMATION_DURATION = 0.2;

type PublishModalProps = {
  onClose: () => void;
  targetableObject: {
    id: string;
    targetObjectNameSingular: string;
  };
  validationDetails: ValidationResult;
};

export const PublishModal = forwardRef<ModalRefType, PublishModalProps>(
  ({ onClose, targetableObject, validationDetails }, ref) => {
    return (
      <Modal
        size="large"
        onClose={onClose}
        isClosable
        ref={ref}
        closedOnMount
        hotkeyScope={ModalHotkeyScope.Default}
        padding="none"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconUpload size={16} />
            <StyledModalTitle>Publication Draft</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={`Cancel`} onClick={onClose} />
          </StyledModalHeaderButtons>
        </StyledModalHeader>

        <StyledModalContent
          key="select"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: ANIMATION_DURATION, ease: 'easeInOut' }}
        >
          <Publishing
            recordId={targetableObject.id}
            renderPlatformIcon={() => <IconUpload size={16} />}
            selectedPlatform={PlatformId.Newhome}
            validationDetails={validationDetails}
          />
        </StyledModalContent>
      </Modal>
    );
  },
);

PublishModal.displayName = 'PublishModal';
