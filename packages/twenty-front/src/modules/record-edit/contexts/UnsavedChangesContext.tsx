import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import {
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import { useLingui } from '@lingui/react/macro';
import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { Button, IconAlertTriangle } from 'twenty-ui';
import { useRecordEdit } from './RecordEditContext';

type ModalAction = {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'tertiary';
  accent?: 'blue' | 'danger';
  disabled?: boolean;
};

type ModalConfig = {
  title: string;
  message: string;
  actions: ModalAction[];
};

type UnsavedChangesContextType = {
  openUnsavedChangesModal: () => void;
  openActionModal: (config: ModalConfig) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(
  null,
);

type UnsavedChangesModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
};

const UnsavedChangesModal = forwardRef<ModalRefType, UnsavedChangesModalProps>(
  ({ onConfirm, onCancel, onSave, isSaving }, ref) => {
    const { t } = useLingui();

    const handleCancel = useCallback(() => {
      (ref as React.RefObject<ModalRefType>).current?.close();
      onCancel();
    }, [onCancel, ref]);

    const handleConfirm = useCallback(() => {
      (ref as React.RefObject<ModalRefType>).current?.close();
      onConfirm();
    }, [onConfirm, ref]);

    const handleSave = useCallback(async () => {
      await onSave();
      (ref as React.RefObject<ModalRefType>).current?.close();
    }, [onSave, ref]);

    return (
      <Modal
        ref={ref}
        onClose={handleCancel}
        isClosable
        closedOnMount
        padding="none"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconAlertTriangle size={16} />
            <StyledModalTitle>{t`Unsaved Changes`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button
              variant="tertiary"
              title={t`Cancel`}
              onClick={handleCancel}
              disabled={isSaving}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>
          <div>{t`You have unsaved changes. What would you like to do?`}</div>
          <StyledModalHeaderButtons>
            <Button
              title={t`Save & Leave`}
              onClick={handleSave}
              variant="secondary"
              accent="blue"
              disabled={isSaving}
            />
            <Button
              title={t`Leave without saving`}
              onClick={handleConfirm}
              variant="secondary"
              accent="danger"
              disabled={isSaving}
            />
          </StyledModalHeaderButtons>
        </StyledModalContent>
      </Modal>
    );
  },
);

const ActionModal = forwardRef<ModalRefType, ModalConfig>(
  ({ title, message, actions }, ref) => {
    const { t } = useLingui();

    const handleClose = useCallback(() => {
      (ref as React.RefObject<ModalRefType>).current?.close();
    }, [ref]);

    const handleActionClick = useCallback(
      async (action: ModalAction) => {
        await action.onClick();
        handleClose();
      },
      [handleClose],
    );

    return (
      <Modal
        ref={ref}
        onClose={handleClose}
        isClosable
        closedOnMount
        padding="none"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconAlertTriangle size={16} />
            <StyledModalTitle>{title}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button
              variant="tertiary"
              title={t`Cancel`}
              onClick={handleClose}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>
          <div>{message}</div>
          <StyledModalHeaderButtons>
            {actions.map((action, index) => (
              <Button
                key={index}
                title={action.label}
                onClick={() => handleActionClick(action)}
                variant={action.variant || 'secondary'}
                accent={action.accent}
                disabled={action.disabled}
              />
            ))}
          </StyledModalHeaderButtons>
        </StyledModalContent>
      </Modal>
    );
  },
);

type UnsavedChangesProviderProps = PropsWithChildren;

export const UnsavedChangesProvider = ({
  children,
}: UnsavedChangesProviderProps) => {
  const modalRef = useRef<ModalRefType>(null);
  const actionModalRef = useRef<ModalRefType>(null);
  const navigate = useNavigate();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const { t } = useLingui();
  const [isSaving, setIsSaving] = useState(false);
  const { isDirty, saveRecord, resetFields } = useRecordEdit();
  const { enqueueSnackBar } = useSnackBar();

  const handleConfirmNavigation = useCallback(() => {
    if (pendingNavigation && !isSaving) {
      resetFields();
      setTimeout(() => {
        navigate(pendingNavigation);
      }, 200);
      setPendingNavigation(null);
    }
  }, [isSaving, navigate, pendingNavigation, resetFields]);

  const handleCancelNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  const handleSaveAndLeave = useCallback(async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await saveRecord();
      handleConfirmNavigation();
    } catch (error) {
      enqueueSnackBar(t`Failed to save changes`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, saveRecord, handleConfirmNavigation, enqueueSnackBar, t]);

  const openUnsavedChangesModal = useCallback(() => {
    modalRef.current?.open();
  }, []);

  const openActionModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    actionModalRef.current?.open();
  }, []);

  // Block navigation when there are unsaved changes
  useBlocker(({ currentLocation, nextLocation }) => {
    // If there are no unsaved changes or the user is navigating to the same page, don't block
    if (!isDirty || nextLocation.pathname.includes(currentLocation.pathname)) {
      return false;
    }

    // Store the pending navigation and show the modal
    setPendingNavigation(nextLocation.pathname);
    openUnsavedChangesModal();
    return true;
  });

  return (
    <UnsavedChangesContext.Provider
      value={{
        openUnsavedChangesModal,
        openActionModal,
      }}
    >
      {children}
      <UnsavedChangesModal
        ref={modalRef}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        onSave={handleSaveAndLeave}
        isSaving={isSaving}
      />
      {modalConfig && (
        <ActionModal
          ref={actionModalRef}
          title={modalConfig.title}
          message={modalConfig.message}
          actions={modalConfig.actions}
        />
      )}
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    throw new Error(
      'useUnsavedChanges must be used within an UnsavedChangesProvider',
    );
  }

  return context;
};
