import { TutorialStepCompletedSnackbar } from '@/onboarding-tutorial/components/TutorialStepCompletedSnackbar';
import { AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState } from 'react';
import { UserTutorialExplanation, UserTutorialTask } from 'twenty-shared';
import { ModalPortal } from '~/ui/layout/modal/components/ModalPortal';

type TutorialSnackbarContextType = {
  showSnackbar: (step: UserTutorialTask | UserTutorialExplanation) => void;
  hideSnackbar: () => void;
  isVisible: boolean;
};

const TutorialSnackbarContext = createContext<TutorialSnackbarContextType>({
  showSnackbar: () => {},
  hideSnackbar: () => {},
  isVisible: false,
});

export const TutorialSnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [completedStep, setCompletedStep] = useState<
    UserTutorialTask | UserTutorialExplanation | null
  >(null);
  const [isVisible, setIsVisible] = useState(false);

  const showSnackbar = (step: UserTutorialTask | UserTutorialExplanation) => {
    setCompletedStep(step);
    setIsVisible(true);
  };

  const hideSnackbar = () => {
    setIsVisible(false);
    setCompletedStep(null);
  };

  return (
    <TutorialSnackbarContext.Provider
      value={{
        showSnackbar,
        hideSnackbar,
        isVisible,
      }}
    >
      {children}
      <ModalPortal>
        <AnimatePresence mode="wait">
          {completedStep && isVisible && (
            <TutorialStepCompletedSnackbar
              step={completedStep}
              onComplete={hideSnackbar}
            />
          )}
        </AnimatePresence>
      </ModalPortal>
    </TutorialSnackbarContext.Provider>
  );
};

export const useTutorialSnackbar = () => {
  const context = useContext(TutorialSnackbarContext);

  if (!context) {
    throw new Error(
      'useTutorialSnackbar must be used within a TutorialSnackbarProvider',
    );
  }

  return context;
};
