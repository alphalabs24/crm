import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, useState, useEffect } from 'react';
import { RecordEditPropertyDocument } from '@/record-edit/contexts/RecordEditContext';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { TextAreaFormInput } from '@/ui/field/input/components/TextAreaFormInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from 'twenty-ui';
import { motion } from 'framer-motion';

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

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type DocumentEditModalProps = {
  document: RecordEditPropertyDocument;
  onClose: () => void;
  onSave: (updates: Partial<RecordEditPropertyDocument>) => void;
};

export const DocumentEditModal = forwardRef<
  ModalRefType,
  DocumentEditModalProps
>(({ document, onClose, onSave }, ref) => {
  const { t } = useLingui();
  const [name, setName] = useState(document.fileName || '');
  const [description, setDescription] = useState(document.description || '');

  const handleSave = () => {
    onSave({
      fileName: name,
      description,
    });
    onClose();
  };

  useEffect(() => {
    setName(document.fileName || '');
    setDescription(document.description || '');
  }, [document]);

  return (
    <Modal
      ref={ref}
      size="medium"
      onClose={onClose}
      isClosable
      closedOnMount
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
    >
      <StyledModalHeader>
        <StyledModalTitle>{t`Edit Document`}</StyledModalTitle>
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
        <TextInput
          value={name}
          onChange={(text) => setName(text)}
          placeholder={t`Enter document name`}
          autoFocus={name === '' || !name}
        />
        <TextAreaFormInput
          value={description}
          onChange={(text) => setDescription(text)}
          placeholder={t`Add a description...`}
          onEnter={handleSave}
          onEscape={onClose}
          onClickOutside={onClose}
          hotkeyScope={ModalHotkeyScope.Default}
          minHeight={80}
          copyButton={false}
          autoFocus={Boolean(name)}
        />
      </StyledModalContent>
    </Modal>
  );
});
