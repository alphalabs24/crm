import { TutorialModal } from '@/onboarding-tutorial/components/modals/TutorialModal';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { createContext, useContext, useRef, useState } from 'react';
import { UserTutorialTask } from 'twenty-shared';
import { Button } from 'twenty-ui';

const StyledModalText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

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
  const { setAsCompleted } = useTutorialSteps();
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

  const onCloseTutorial = (step?: UserTutorialTask) => {
    setIsTutorialOpen(false);
    tutorialModalRef.current?.close();
    if (step) {
      setAsCompleted(step);
    }
  };

  return (
    <TutorialContext.Provider value={{ isTutorialOpen, showTutorial }}>
      {children}
      <TutorialModal
        onClose={() =>
          onCloseTutorial(UserTutorialTask.TUTORIAL_PLATFORM_SETUP)
        }
        ref={tutorialModalRef}
        title="Platform Credentials"
      >
        <StyledModalContentContainer>
          <StyledModalText>
            With Nestermind, you can set up provider details to efficiently
            manage the publication of your properties on various platforms. A
            provider stores the required access credentials for each platform
            publication so you can reuse them for each listing.
          </StyledModalText>
          <div>
            <Button
              title="Continue"
              accent={'blue'}
              onClick={() => onCloseTutorial()}
            />
          </div>
        </StyledModalContentContainer>
      </TutorialModal>
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
