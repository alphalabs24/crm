import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports

import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Button, IconUpload, LARGE_DESKTOP_VIEWPORT } from 'twenty-ui';

import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { Publishing } from '@/ui/layout/show-page/components/nm/modal-pages/Publishing';
import { useLingui } from '@lingui/react/macro';
import { ValidationResult } from '../../hooks/usePublicationValidation';
import { PlatformId } from './types/Platform';

const StyledModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  height: 100%;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};
    height: unset;
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
  platformId: PlatformId;
  hasDraftAndPublished: boolean;
};

export const PublishModal = forwardRef<ModalRefType, PublishModalProps>(
  (
    {
      onClose,
      targetableObject,
      validationDetails,
      platformId,
      hasDraftAndPublished,
    },
    ref,
  ) => {
    const { t } = useLingui();
    const [isPublished, setIsPublished] = useState(false);
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
            <StyledModalTitle>{t`Publication Draft`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button
              variant="tertiary"
              title={isPublished ? t`Done` : t`Cancel`}
              onClick={onClose}
            />
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
            renderPlatformIcon={() => (
              <PlatformBadge platformId={platformId} size="small" />
            )}
            selectedPlatform={platformId}
            validationDetails={validationDetails}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            hasDraftAndPublished={hasDraftAndPublished}
          />
        </StyledModalContent>
      </Modal>
    );
  },
);

PublishModal.displayName = 'PublishModal';
