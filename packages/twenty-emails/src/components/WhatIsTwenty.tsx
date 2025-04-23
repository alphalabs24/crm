import { t } from '@lingui/core/macro';
import { Footer } from 'src/components/Footer';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

export const WhatIsTwenty = () => {
  return (
    <>
      <SubTitle value={t`What is nestermind?`} />
      <MainText>{t`The AI real estate software for innovative agents.`}</MainText>
      <Footer />
    </>
  );
};
