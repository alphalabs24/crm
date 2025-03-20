import { TutorialModal } from '@/onboarding-tutorial/components/modals/TutorialModal';
import { useLocale } from '@/onboarding-tutorial/hooks/useLocale';
import { mapLocaleToImageSuffix } from '@/onboarding-tutorial/utils/mapLocaleToImageSuffix';
import { SettingsPath } from '@/types/SettingsPath';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconMail } from 'twenty-ui';
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
  object-position: left;
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

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type Props = {
  onClose: () => void;
};

export const EmailTutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose }, ref) => {
    const locale = useLocale();
    const { t } = useLingui();
    const navigate = useNavigate();

    const setupEmailSync = () => {
      onClose();
      navigate(getSettingsPath(SettingsPath.Accounts));
    };

    return (
      <TutorialModal
        icon={<IconMail size={16} />}
        onClose={onClose}
        ref={ref}
        title={t`Email Synchronization`}
      >
        <StyledModalContentContainer>
          <StyledImageAligner>
            <StyledTutorialImageContainer>
              <StyledTutorialImage
                src={`/images/tutorials/email_tutorial_${mapLocaleToImageSuffix(locale)}.jpg`}
                alt="Email Tutorial"
              />
            </StyledTutorialImageContainer>
          </StyledImageAligner>

          <div>
            <StyledSectionTitle>
              <Trans>Email Synchronization with nestermind</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                With email synchronization in nestermind, you can seamlessly
                connect your emails and calendar events with the CRM. Microsoft,
                Outlook, and IMAP are supported, allowing you to efficiently
                manage your communication in nestermind – regardless of which
                email service you use.
              </Trans>
            </StyledModalText>
          </div>
          <div>
            <StyledSectionTitle>
              <Trans>Automatic Synchronization of People and Emails</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                nestermind automatically recognizes relevant contacts and
                converts them into CRM people. Through granular settings, you
                can specify which types of emails should be considered.
              </Trans>
            </StyledModalText>
          </div>

          <StyledModalText>
            <Trans>
              Synchronized email threads are stored directly with the respective
              people in the CRM. This allows you to track the entire history of
              communication at any time. You can also individually set whether
              you want to see only the subject lines or the full email text in
              nestermind.
            </Trans>
          </StyledModalText>

          <div>
            <StyledSectionTitle>
              <Trans>Automatic creation of Inquiries</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                When an inquiry comes through a real estate portal, nestermind
                automatically creates a CRM inquiry. This stores not only the
                inquiry details but also the entire email history specifically
                related to interest in a particular publication.
              </Trans>
            </StyledModalText>
          </div>

          <StyledModalText>
            <Trans>
              With email synchronization in nestermind, your communication stays
              structured, efficient, and fully integrated.
            </Trans>
          </StyledModalText>

          <StyledModalButtonContainer>
            <Button
              title={t`Setup Email Sync`}
              accent="blue"
              onClick={setupEmailSync}
            />
          </StyledModalButtonContainer>
        </StyledModalContentContainer>
      </TutorialModal>
    );
  },
);
