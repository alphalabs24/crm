import { RecordEditPropertyImage } from '@/record-edit/contexts/RecordEditContext';
import { TextAreaFormInput } from '@/ui/field/input/components/TextAreaFormInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from 'twenty-ui';

const StyledModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type ImageEditModalProps = {
  image: RecordEditPropertyImage;
  onClose: () => void;
  onSave: (description: string) => void;
};

export const ImageEditModal = ({
  image,
  onClose,
  onSave,
}: ImageEditModalProps) => {
  const { t } = useLingui();
  const [description, setDescription] = useState(image.description);

  const handleSave = () => {
    onSave(description);
    onClose();
  };

  return (
    <Modal
      size="medium"
      onClose={onClose}
      isClosable
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
    >
      <StyledModalHeader>
        <StyledModalTitle>{t`Edit Image`}</StyledModalTitle>
        <StyledButtonContainer>
          <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
          <Button
            variant="primary"
            title={t`Save`}
            onClick={handleSave}
            accent="blue"
          />
        </StyledButtonContainer>
      </StyledModalHeader>
      <StyledModalContent
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <StyledImage src={image.previewUrl} alt="" />
        <TextAreaFormInput
          value={description}
          onChange={(e) => setDescription(e)}
          placeholder={t`Add a description...`}
          onEnter={handleSave}
          onEscape={onClose}
          onClickOutside={onClose}
          hotkeyScope={ModalHotkeyScope.Default}
          minHeight={80}
          autoFocus
          copyButton={false}
        />
      </StyledModalContent>
    </Modal>
  );
};
