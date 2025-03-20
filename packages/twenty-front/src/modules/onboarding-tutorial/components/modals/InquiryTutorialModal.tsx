import { TutorialModal } from '@/onboarding-tutorial/components/modals/TutorialModal';
import { useLocale } from '@/onboarding-tutorial/hooks/useLocale';
import { mapLocaleToImageSuffix } from '@/onboarding-tutorial/utils/mapLocaleToImageSuffix';
import { ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef } from 'react';
import { Button, IconMessageCircle2 } from 'twenty-ui';

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

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type Props = {
  onClose: () => void;
};

export const InquiryTutorialModal = forwardRef<ModalRefType, Props>(
  ({ onClose }, ref) => {
    const locale = useLocale();
    const { t } = useLingui();

    return (
      <TutorialModal
        icon={<IconMessageCircle2 size={16} />}
        onClose={onClose}
        ref={ref}
        title={t`Inquiries`}
      >
        <StyledModalContentContainer>
          <StyledImageAligner>
            <StyledTutorialImageContainer>
              <StyledTutorialImage
                src={`/images/tutorials/inquiry_tutorial_${mapLocaleToImageSuffix(locale)}.jpg`}
                alt="Inquiry Tutorial"
              />
            </StyledTutorialImageContainer>
          </StyledImageAligner>

          <div>
            <StyledSectionTitle>
              <Trans>Inquiries in nestermind</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                Inquiries are the central connection between interested parties
                and property listings. They are{' '}
                <strong>automatically created</strong> when an inquiry about a
                property is received and are <strong>directly linked</strong> to
                the relevant property, the specific publication, and the
                inquiring person.
              </Trans>
            </StyledModalText>
          </div>

          <div>
            <StyledSectionTitle>
              <Trans>What are inquiries created for?</Trans>
            </StyledSectionTitle>
            <StyledModalText>
              <Trans>
                All emails related to the inquiry are stored here. Additionally,
                you can store files, notes, and other details directly on the
                inquiry – <strong>everything in one place</strong> and
                specifically related to this connection. This is how nestermind
                ensures that you can manage inquiries in a structured way and no
                important information is lost.
              </Trans>
            </StyledModalText>
          </div>

          <StyledModalButtonContainer>
            <Button title={t`Understood`} accent="blue" onClick={onClose} />
          </StyledModalButtonContainer>
        </StyledModalContentContainer>
      </TutorialModal>
    );
  },
);

InquiryTutorialModal.displayName = 'InquiryTutorialModal';
