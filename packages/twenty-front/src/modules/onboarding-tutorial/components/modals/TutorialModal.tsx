import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import {
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, PropsWithChildren } from 'react';
import { Button, IconExchange } from 'twenty-ui';

type Props = {
  title: string;
  onClose: () => void;
} & PropsWithChildren;

export const TutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose, children, title }, ref) => {
    const { t } = useLingui();

    return (
      <Modal
        portal
        ref={ref}
        onClose={onClose}
        isClosable
        closedOnMount
        padding="none"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconExchange size={16} />
            <StyledModalTitle>{title}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Skip`} onClick={onClose} />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>{children}</StyledModalContent>
      </Modal>
    );
  },
);
