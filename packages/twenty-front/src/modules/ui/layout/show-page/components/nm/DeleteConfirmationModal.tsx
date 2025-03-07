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
import { Button, IconTrash } from 'twenty-ui';
import { useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';

const StyledSpacer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

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
              <IconTrash size={16} />
              <StyledModalTitle>{t`Delete`}</StyledModalTitle>
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
            <StyledSpacer />
            <div>
              <Button
                title={'Yes, I understand'}
                variant={'primary'}
                accent={'danger'}
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
