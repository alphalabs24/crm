import { TutorialModal } from '@/onboarding-tutorial/components/modals/TutorialModal';
import { useLocale } from '@/onboarding-tutorial/hooks/useLocale';
import { mapLocaleToImageSuffix } from '@/onboarding-tutorial/utils/mapLocaleToImageSuffix';
import { SettingsPath } from '@/types/SettingsPath';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconBuilding } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledModalText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
`;

const StyledModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledTutorialImage = styled.img`
  border: 2px solid ${({ theme }) => theme.color.gray35};
  display: block;
  height: 250px;
  margin: 0 auto;
  object-fit: cover;
  object-position: center;
  width: 100%;
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledTutorialImageContainer = styled.div`
  max-width: 1000px;
`;

const StyledImageAligner = styled.div`
  display: flex;
  justify-content: center;
`;

type Props = {
  onClose: () => void;
};

export const ProviderTutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose }, ref) => {
    const locale = useLocale();
    const { t } = useLingui();
    const navigate = useNavigate();

    const editPublisher = () => {
      onClose();
      navigate(getSettingsPath(SettingsPath.Platforms));
    };

    return (
      <TutorialModal
        icon={<IconBuilding size={16} />}
        onClose={onClose}
        ref={ref}
        title={t`Platform Credentials`}
      >
        <StyledModalContentContainer>
          <StyledImageAligner>
            <StyledTutorialImageContainer>
              <StyledTutorialImage
                src={`/images/tutorials/publisher_tutorial_${mapLocaleToImageSuffix(locale)}.jpg`}
                alt="Provider Tutorial"
              />
            </StyledTutorialImageContainer>
          </StyledImageAligner>
          <StyledModalText>
            <Trans>
              With nestermind, you can set up publisher details to efficiently
              manage the publication of your properties on various platforms.
              The publisher entity stores the required access credentials for
              each platform publication so you can reuse them for each listing.
            </Trans>
          </StyledModalText>
          <StyledModalButtonContainer>
            <Button
              title={t`Setup Credentials`}
              accent="blue"
              onClick={() => editPublisher()}
            />
          </StyledModalButtonContainer>
        </StyledModalContentContainer>
      </TutorialModal>
    );
  },
);
