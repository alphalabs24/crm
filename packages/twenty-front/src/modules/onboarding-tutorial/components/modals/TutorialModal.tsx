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
import { Button } from 'twenty-ui';

type Props = {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
} & PropsWithChildren;

export const TutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose, children, title, icon }, ref) => {
    const { t } = useLingui();

    return (
      <Modal
        portal
        ref={ref}
        onClose={onClose}
        isClosable
        closedOnMount
        padding="none"
        size="large"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            {icon}
            <StyledModalTitle>{title}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Close`} onClick={onClose} />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>{children}</StyledModalContent>
      </Modal>
    );
  },
);
