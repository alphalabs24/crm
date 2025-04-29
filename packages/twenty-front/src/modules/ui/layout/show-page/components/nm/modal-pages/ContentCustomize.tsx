import { InstagramCarousel } from '@/object-record/record-show/components/nm/InstagramCarousel';
import { TextAreaFormInput } from '@/ui/field/input/components/TextAreaFormInput';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Dispatch, SetStateAction } from 'react';
import {
  Button,
  ColorScheme,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  LARGE_DESKTOP_VIEWPORT,
  ProgressBar,
} from 'twenty-ui';

const StyledContentLayout = styled.div`
  display: flex;

  flex-direction: column;

  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
    height: 660px;
  }
`;

const StyledCarouselContainer = styled.div`
  aspect-ratio: 1;
  min-width: 0;
  width: 100%;
  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    width: unset;
  }
`;

const StyledSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSettingsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledMainTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledMainSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledConnectedContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledConnectedTag = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.green50};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledAccountButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 350px;
  justify-content: space-between;
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledAccountContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAccountAvatar = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  height: 24px;
  width: 24px;
  overflow: hidden;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledAccountName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSectionSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescriptionContainer = styled.div`
  max-width: 350px;
`;

const StyledVideoGeneratorContainer = styled.div<{
  colorScheme?: ColorScheme;
}>`
  background: ${({ theme, colorScheme }) =>
    colorScheme ? theme.background.tertiary : theme.color.purple10};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledVideoGeneratorTitle = styled.div`
  color: ${({ theme }) => theme.color.purple};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledVideoGeneratorSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledToolDescription = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.purple50};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.purple50};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledProgressContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 300px;
`;

const StyledProgressText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledAdditonalSettingsDivider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledAdditionalSettingsButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

type ContentCustomizeProps = {
  images: any[];
  selectedImagesForPost: string[];
  currentSlide: number;
  setCurrentSlide: Dispatch<SetStateAction<number>>;
  isVideoSelected: boolean;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;
  generationProgress: number;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  setGenerationProgress: Dispatch<SetStateAction<number>>;
  setIsVideoSelected: Dispatch<SetStateAction<boolean>>;
};

// TODO: Add Video Generation Here
const VIDEOS: string[] = ['/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4'];

export const ContentCustomize = ({
  images,
  selectedImagesForPost,
  currentSlide,
  setCurrentSlide,
  isVideoSelected,
  description,
  setDescription,
  isGenerating,
  generationProgress,
  setIsGenerating,
  setGenerationProgress,
  setIsVideoSelected,
}: ContentCustomizeProps) => {
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const { t } = useLingui();
  return (
    <StyledContentLayout>
      <StyledCarouselContainer>
        <InstagramCarousel
          videos={isVideoSelected ? VIDEOS : []}
          images={images
            .filter((img) => selectedImagesForPost.includes(img.id))
            .map((img) => img.fullPath)}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          onPrevSlide={() => {
            const totalItems =
              selectedImagesForPost.length +
              (isVideoSelected ? VIDEOS.length : 0);
            setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          }}
          onNextSlide={() => {
            const totalItems =
              selectedImagesForPost.length +
              (isVideoSelected ? VIDEOS.length : 0);
            setCurrentSlide((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          }}
          isVideoSelected={isVideoSelected}
        />
      </StyledCarouselContainer>
      <StyledSettingsContainer>
        <StyledSettingsSectionContainer>
          <StyledMainTitle>Post Content</StyledMainTitle>
          <StyledMainSubtitle>
            {t`Create your Instagram post with a compelling description and media`}
          </StyledMainSubtitle>
        </StyledSettingsSectionContainer>
        <StyledSettingsSectionContainer>
          <StyledSectionTitle>
            <StyledConnectedContainer>
              {t`Account`}
              <StyledConnectedTag>
                <IconCheck size={12} />
                {t`Connected`}
              </StyledConnectedTag>
            </StyledConnectedContainer>
          </StyledSectionTitle>
          <StyledAccountButton>
            <StyledAccountContent>
              <StyledAccountAvatar>
                <StyledImage
                  src="/logos/nestermind-logo.png"
                  alt="Account avatar"
                />
              </StyledAccountAvatar>
              <StyledAccountName>nester.mind</StyledAccountName>
            </StyledAccountContent>
            <IconChevronRight size={16} />
          </StyledAccountButton>
        </StyledSettingsSectionContainer>
        <StyledSettingsSectionContainer>
          <StyledSectionTitle>{t`Description`}</StyledSectionTitle>
          <StyledSectionSubtitle>
            {t`Write a compelling description that highlights the key features of
            your property`}
          </StyledSectionSubtitle>
          <StyledDescriptionContainer>
            <TextAreaFormInput
              placeholder={t`Write a description for your post...`}
              value={description}
              onChange={(value) => setDescription(value)}
              onEnter={() => {}}
              onEscape={() => {}}
              onClickOutside={() => {}}
              onTab={() => {}}
              onShiftTab={() => {}}
              hotkeyScope={ModalHotkeyScope.Default}
              copyButton={false}
            />
          </StyledDescriptionContainer>
        </StyledSettingsSectionContainer>

        <StyledVideoGeneratorContainer colorScheme={colorSchemeToUse}>
          <StyledSettingsSectionContainer>
            <StyledVideoGeneratorTitle>
              <IconSparkles size={16} />
              {t`Generate Videos`}
            </StyledVideoGeneratorTitle>
            {generationProgress < 100 && (
              <StyledVideoGeneratorSubtitle>
                {t`We found 3 videos we can generate from your property images`}
              </StyledVideoGeneratorSubtitle>
            )}
          </StyledSettingsSectionContainer>
          {generationProgress === 100 ? (
            <StyledToolDescription>
              <IconCheck size={22} />
              <div>{t`3 videos have been generated and added to your carousel`}</div>
            </StyledToolDescription>
          ) : isGenerating ? (
            <StyledProgressContainer>
              <ProgressBar value={generationProgress} />
              <StyledProgressText>
                {t`Generating videos...`} {Math.min(generationProgress, 100)}%
              </StyledProgressText>
            </StyledProgressContainer>
          ) : (
            <div>
              <Button
                title={t`Generate`}
                Icon={IconSparkles}
                accent="purple"
                onClick={() => {
                  setIsGenerating(true);
                  setGenerationProgress(0);
                  const interval = setInterval(() => {
                    setGenerationProgress((prev) => {
                      const newProgress = Math.floor(prev + 100 / (7000 / 100));
                      if (newProgress >= 100) {
                        clearInterval(interval);
                        setIsGenerating(false);
                        setIsVideoSelected(true);
                        setCurrentSlide(0);
                        return 100;
                      }
                      return newProgress;
                    });
                  }, 100);
                }}
                style={{ alignSelf: 'flex-start' }}
              />
            </div>
          )}
        </StyledVideoGeneratorContainer>
        <StyledAdditonalSettingsDivider />

        <StyledAdditionalSettingsButton>
          <span>{t`Additional post settings`}</span>
          <IconChevronRight size={16} />
        </StyledAdditionalSettingsButton>
      </StyledSettingsContainer>
    </StyledContentLayout>
  );
};
