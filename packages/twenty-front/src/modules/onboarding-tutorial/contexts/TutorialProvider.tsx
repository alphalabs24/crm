import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { EmailTutorialModal } from '@/onboarding-tutorial/components/modals/EmailTutorialModal';
import { InquiryTutorialModal } from '@/onboarding-tutorial/components/modals/InquiryTutorialModal';
import { ProviderTutorialModal } from '@/onboarding-tutorial/components/modals/PublisherTutorialModal';
import { useTutorialSteps } from '@/onboarding-tutorial/hooks/useTutorialSteps';
import { AppPath } from '@/types/AppPath';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { createContext, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserTutorialExplanation, UserTutorialTask } from 'twenty-shared';

type TutorialContextType = {
  showTutorial: (step: UserTutorialTask | UserTutorialExplanation) => void;
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
  const [activeModal, setActiveModal] = useState<
    UserTutorialTask | UserTutorialExplanation | null
  >(null);
  const tutorialModalRef = useRef<ModalRefType>(null);
  const emailTutorialModalRef = useRef<ModalRefType>(null);
  const inquiryTutorialModalRef = useRef<ModalRefType>(null);
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

  const showInquiryTutorial = () => {
    setActiveModal(UserTutorialExplanation.TUTORIAL_BUYER_LEADS);
    setTimeout(() => {
      inquiryTutorialModalRef.current?.open();
    }, 100);
  };

  const showPropertyTutorial = () => {
    const path = AppPath.RecordIndexPage.replace(
      ':objectNamePlural',
      CoreObjectNamePlural.Property,
    );
    navigate(`${path}?create=true`);
  };

  const showTutorial = (step: UserTutorialTask | UserTutorialExplanation) => {
    setIsTutorialOpen(true);

    switch (step) {
      case UserTutorialTask.TUTORIAL_PLATFORM_SETUP:
        showProviderTutorial();
        break;
      case UserTutorialTask.TUTORIAL_EMAIL:
        showEmailTutorial();
        break;
      case UserTutorialExplanation.TUTORIAL_BUYER_LEADS:
        showInquiryTutorial();
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

  const onCloseInquiryTutorial = () => {
    reset();
    inquiryTutorialModalRef.current?.close();
    setAsCompleted({
      step: UserTutorialExplanation.TUTORIAL_BUYER_LEADS,
    });
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
      {activeModal === UserTutorialExplanation.TUTORIAL_BUYER_LEADS && (
        <InquiryTutorialModal
          ref={inquiryTutorialModalRef}
          onClose={onCloseInquiryTutorial}
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
