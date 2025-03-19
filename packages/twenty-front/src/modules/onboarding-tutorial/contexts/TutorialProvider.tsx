import { ProviderTutorialModal } from '@/onboarding-tutorial/components/modals/ProviderTutorialModal';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { createContext, useContext, useRef, useState } from 'react';
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
  const tutorialModalRef = useRef<ModalRefType>(null);

  const showProviderTutorial = () => {
    tutorialModalRef.current?.open();
  };

  const showTutorial = (step: UserTutorialTask) => {
    setIsTutorialOpen(true);

    switch (step) {
      case UserTutorialTask.TUTORIAL_PLATFORM_SETUP:
        showProviderTutorial();
        break;
      default:
        setIsTutorialOpen(false);
        break;
    }
  };

  const onCloseTutorial = () => {
    setIsTutorialOpen(false);
    tutorialModalRef.current?.close();
  };

  return (
    <TutorialContext.Provider value={{ isTutorialOpen, showTutorial }}>
      {children}
      <ProviderTutorialModal ref={tutorialModalRef} onClose={onCloseTutorial} />
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
