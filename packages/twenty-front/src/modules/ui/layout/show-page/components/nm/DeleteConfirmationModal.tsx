import React, { forwardRef } from 'react';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import {
  StyledModalContainer,
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import { Button, IconExchange, IconTrash } from 'twenty-ui';
import { useLingui } from '@lingui/react/macro';

type Props = {
  onClose: () => void;
  onOpen?: () => void;
  onDelete?: () => void;
  description?: string;
  loading?: boolean;
};

const DeleteConfirmationModal = forwardRef<ModalRefType, Props>(
  ({ onOpen, onClose, onDelete, description, loading }, ref) => {
    const { t } = useLingui();

    return (
      <Modal
        closedOnMount
        isClosable
        ref={ref}
        size={'small'}
        padding={'none'}
        modalVariant={'primary'}
        onClose={loading ? () => {} : onClose}
        onEnter={onOpen}
      >
        <StyledModalContainer adaptiveHeight>
          <StyledModalHeader>
            <StyledModalTitleContainer>
              <IconExchange size={16} />
              <StyledModalTitle>{t`Compare Changes`}</StyledModalTitle>
            </StyledModalTitleContainer>
            <StyledModalHeaderButtons>
              <Button
                variant="tertiary"
                title={t`Cancel`}
                onClick={onClose}
                disabled={loading}
              />
            </StyledModalHeaderButtons>
          </StyledModalHeader>
          <StyledModalContent>
            {description && <div>{description}</div>}
            <div>
              <Button
                title={'Yes, I understand'}
                variant={'primary'}
                accent={'danger'}
                Icon={IconTrash}
                disabled={loading}
                onClick={onDelete}
              />
            </div>
          </StyledModalContent>
        </StyledModalContainer>
      </Modal>
    );
  },
);

export default DeleteConfirmationModal;
