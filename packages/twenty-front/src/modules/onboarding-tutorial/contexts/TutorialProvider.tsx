import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { EmailTutorialModal } from '@/onboarding-tutorial/components/modals/EmailTutorialModal';
import { ProviderTutorialModal } from '@/onboarding-tutorial/components/modals/PublisherTutorialModal';
import { AppPath } from '@/types/AppPath';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { createContext, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserTutorialTask } from 'twenty-shared';

type TutorialContextType = {
  showTutorial: (step: UserTutorialTask) => void;
  isTutorialOpen: boolean;
};

export const TutorialContext = createContext<TutorialContextType>({
  isTutorialOpen: false,
  showTutorial: () => {},
});

export const TutorialProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<UserTutorialTask | null>(null);
  const tutorialModalRef = useRef<ModalRefType>(null);
  const emailTutorialModalRef = useRef<ModalRefType>(null);
  const navigate = useNavigate();

  const showProviderTutorial = () => {
    setActiveModal(UserTutorialTask.TUTORIAL_PLATFORM_SETUP);
    setTimeout(() => {
      tutorialModalRef.current?.open();
    }, 100);
  };

  const showEmailTutorial = () => {
    setActiveModal(UserTutorialTask.TUTORIAL_EMAIL);
    setTimeout(() => {
      emailTutorialModalRef.current?.open();
    }, 100);
  };

  const showPropertyTutorial = () => {
    const path = AppPath.RecordIndexPage.replace(
      ':objectNamePlural',
      CoreObjectNamePlural.Property,
    );
    navigate(`${path}?create=true`);
  };

  const showTutorial = (step: UserTutorialTask) => {
    setIsTutorialOpen(true);

    switch (step) {
      case UserTutorialTask.TUTORIAL_PLATFORM_SETUP:
        showProviderTutorial();
        break;
      case UserTutorialTask.TUTORIAL_EMAIL:
        showEmailTutorial();
        break;
      case UserTutorialTask.TUTORIAL_PROPERTY:
        showPropertyTutorial();
        break;
      default:
        break;
    }
  };

  const reset = () => {
    setIsTutorialOpen(false);
    setActiveModal(null);
  };

  const onCloseTutorial = () => {
    reset();
    tutorialModalRef.current?.close();
  };

  const onCloseEmailTutorial = () => {
    reset();
    emailTutorialModalRef.current?.close();
  };

  return (
    <TutorialContext.Provider value={{ isTutorialOpen, showTutorial }}>
      {children}
      {activeModal === UserTutorialTask.TUTORIAL_EMAIL && (
        <EmailTutorialModal
          ref={emailTutorialModalRef}
          onClose={onCloseEmailTutorial}
        />
      )}
      {activeModal === UserTutorialTask.TUTORIAL_PLATFORM_SETUP && (
        <ProviderTutorialModal
          ref={tutorialModalRef}
          onClose={onCloseTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
