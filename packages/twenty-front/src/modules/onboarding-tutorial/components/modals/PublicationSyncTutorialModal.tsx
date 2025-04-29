import { TutorialModal } from '@/onboarding-tutorial/components/modals/TutorialModal';
import { useLocale } from '@/onboarding-tutorial/hooks/useLocale';
import { mapLocaleToImageSuffix } from '@/onboarding-tutorial/utils/mapLocaleToImageSuffix';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef } from 'react';
import { Button, IconRefresh } from 'twenty-ui';

const StyledModalText = styled.div<{ color?: string }>`
  color: ${({ theme, color }) => color ?? theme.font.color.secondary};
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

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type Props = {
  onClose: () => void;
};

export const PublicationSyncTutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose }, ref) => {
    const locale = useLocale();
    const { t } = useLingui();
    const theme = useTheme();
    return (
      <TutorialModal
        icon={<IconRefresh size={16} />}
        onClose={onClose}
        ref={ref}
        title={t`Publication Synchronization`}
      >
        <StyledModalContentContainer>
          <StyledImageAligner>
            <StyledTutorialImageContainer>
              <StyledTutorialImage
                src={`/images/tutorials/publication_sync_tutorial_${mapLocaleToImageSuffix(locale)}.jpg`}
                alt="Publication Sync Tutorial"
              />
            </StyledTutorialImageContainer>
          </StyledImageAligner>

          <div>
            <StyledSectionTitle>
              <Trans>Easy Synchronization</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                When you make changes to a property's master data, you can
                quickly and easily transfer these to your publications. All
                draft publications can be synchronized with a single click,
                ensuring that current data is displayed correctly everywhere.
              </Trans>
            </StyledModalText>
          </div>

          <StyledModalText>
            <Trans>
              The synchronization ensures that titles, descriptions, prices,
              images and other relevant information are updated across all
              platforms - without having to manually edit each draft.
            </Trans>
          </StyledModalText>

          <StyledModalText>
            <Trans>
              This keeps your property presentation always up-to-date and saves
              you valuable time!
            </Trans>
          </StyledModalText>
          <StyledModalButtonContainer>
            <Button title={t`Understood`} accent="blue" onClick={onClose} />
          </StyledModalButtonContainer>
        </StyledModalContentContainer>
      </TutorialModal>
    );
  },
);

PublicationSyncTutorialModal.displayName = 'PublicationSyncTutorialModal';
