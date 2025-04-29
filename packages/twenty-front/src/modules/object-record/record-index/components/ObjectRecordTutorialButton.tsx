import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTutorial } from '@/onboarding-tutorial/contexts/TutorialProvider';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UserTutorialExplanation } from 'twenty-shared';
import { IconHelpCircle } from 'twenty-ui';

const StyledMotionDiv = styled(motion.div)`
  display: inline-flex;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledQuestionButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.gray80};
  cursor: pointer;
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 0;
  padding-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
  transition: all 0.15s ease-in-out;
  vertical-align: middle;

  &:hover {
    color: ${({ theme }) => theme.color.gray};
  }
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: inline-flex;
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(3)};
  padding: 0;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledContent = styled(motion.div)`
  align-items: center;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  transform-origin: center;
`;

type TutorialMapping = {
  tutorialKey: UserTutorialExplanation;
  buttonText: string | React.ReactNode;
};

const OBJECT_TUTORIAL_MAPPING: Partial<
  Record<CoreObjectNameSingular, TutorialMapping>
> = {
  [CoreObjectNameSingular.BuyerLead]: {
    tutorialKey: UserTutorialExplanation.TUTORIAL_BUYER_LEADS,
    buttonText: <Trans>What is an inquiry?</Trans>,
  },
};

type ObjectRecordTutorialButtonProps = {
  objectNameSingular: CoreObjectNameSingular;
};

export const ObjectRecordTutorialButton = ({
  objectNameSingular,
}: ObjectRecordTutorialButtonProps) => {
  const { showTutorial } = useTutorial();
  const { getValueByKey } = useKeyValueStore();
  const theme = useTheme();

  const tutorialMapping = OBJECT_TUTORIAL_MAPPING[objectNameSingular];

  const [isTutorialCompleted, setIsTutorialCompleted] = useState<
    string | number | boolean
  >(true);

  useEffect(() => {
    if (tutorialMapping) {
      const { tutorialKey } = tutorialMapping;
      const isTutorialCompleted = getValueByKey(tutorialKey);
      setIsTutorialCompleted(isTutorialCompleted);
    }
  }, [getValueByKey, tutorialMapping]);

  if (!tutorialMapping) {
    return null;
  }

  if (isTutorialCompleted) {
    return (
      <StyledIconButton
        onClick={() => showTutorial(tutorialMapping.tutorialKey)}
      >
        <IconHelpCircle size={14} />
        {tutorialMapping.buttonText}
      </StyledIconButton>
    );
  }

  return (
    <StyledMotionDiv
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        color: theme.color.blue,
      }}
    >
      <StyledQuestionButton
        onClick={() => showTutorial(tutorialMapping.tutorialKey)}
      >
        <StyledContent
          animate={{
            color: [
              theme.color.blue,
              theme.color.blue50,
              theme.color.purple,
              theme.color.purple50,
              theme.color.blue,
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <IconHelpCircle size={16} />
          {tutorialMapping.buttonText}
        </StyledContent>
      </StyledQuestionButton>
    </StyledMotionDiv>
  );
};
