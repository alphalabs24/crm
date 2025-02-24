import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  IconSearch,
  IconSparkles,
  IconVideo,
  ProgressBar,
} from 'twenty-ui';
import { VideoGenerationModal } from './VideoGenerationModal';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin: ${({ theme }) => theme.spacing(4)};
  height: calc(100vh - ${({ theme }) => theme.spacing(8)});
`;

const StyledMainContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 100%;
`;

const StyledLeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 50%;
  height: 100%;
`;

const StyledRightContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
`;

const StyledAvailableAssets = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledAssetsTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledImagesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  max-height: 220px;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.color.medium};
    border-radius: 4px;
  }
`;

const StyledImageContainer = styled.div`
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.background.tertiary};
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  &.loaded {
    opacity: 1;
  }
`;

const StyledAITools = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: 1fr 1fr;
`;

const StyledAITool = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const StyledToolHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledToolTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledToolContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  min-height: 160px;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledToolDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  max-width: 300px;
  text-align: center;
`;

const StyledVideoSection = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledVideoSectionHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledVideoSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledVideoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  flex-grow: 1;
  overflow-y: auto;
`;

const StyledGenerateSection = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
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

const StyledGeneratedVideosSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledGeneratedVideosTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledVideoGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(3, 1fr);
`;

const StyledVideoContainer = styled.div`
  aspect-ratio: 1;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
`;

const StyledVideo = styled.video`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

type AISuiteProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
};

const DEMO_VIDEOS = ['/videos/1.mp4', '/videos/2.mp4', '/videos/3.mp4'];

export const AISuite = ({ targetableObject }: AISuiteProps) => {
  const [isGenerating] = useState(false);
  const [hasGeneratedVideos, setHasGeneratedVideos] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  const videoModalRef = useRef<ModalRefType>(null);

  const { recordFromStore: record } = useRecordShowContainerData({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    objectRecordId: targetableObject.id,
  });
  const { attachments = [] } = useAttachments(targetableObject);
  const { t } = useLingui();
  const images =
    attachments?.filter((attachment) => attachment.type === 'PropertyImage') ??
    [];

  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [imageId]: true,
    }));
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateVideo = () => {
    videoModalRef.current?.open();
  };

  const handleVideoGeneration = () => {
    setHasGeneratedVideos(true);
  };

  if (!record) {
    return <StyledLoadingContainer>{t`Loading...`}</StyledLoadingContainer>;
  }

  return (
    <>
      <StyledContainer>
        <StyledMainContent>
          <StyledLeftContent>
            <StyledAvailableAssets>
              <StyledAssetsTitle>
                <Trans>Available Assets ({images.length})</Trans>
              </StyledAssetsTitle>
              <StyledImagesGrid>
                {images.map((image) => (
                  <StyledImageContainer key={image.id}>
                    <StyledImage
                      src={image.fullPath}
                      alt="Property"
                      loading="lazy"
                      decoding="async"
                      onLoad={() => handleImageLoad(image.id)}
                      className={loadedImages[image.id] ? 'loaded' : ''}
                    />
                  </StyledImageContainer>
                ))}
              </StyledImagesGrid>
            </StyledAvailableAssets>

            <StyledAITools>
              <StyledAITool>
                <StyledToolHeader>
                  <IconSparkles size={16} />
                  <StyledToolTitle>{t`Lead Insights`}</StyledToolTitle>
                </StyledToolHeader>
                <StyledToolContent>
                  <IconSparkles size={32} />
                  <StyledToolDescription>
                    {t`Get AI-powered insights about potential buyers and personalized engagement strategies`}
                  </StyledToolDescription>
                  <Button
                    title={t`Generate Insights`}
                    Icon={IconSparkles}
                    variant="secondary"
                    size="medium"
                    onClick={() => {}}
                  />
                </StyledToolContent>
              </StyledAITool>

              <StyledAITool>
                <StyledToolHeader>
                  <IconSearch size={16} />
                  <StyledToolTitle>{t`Market Analysis`}</StyledToolTitle>
                </StyledToolHeader>
                <StyledToolContent>
                  <IconSearch size={32} />
                  <StyledToolDescription>
                    {t`Get AI-powered insights about the local market and property positioning`}
                  </StyledToolDescription>
                  <Button
                    title={t`Generate Analysis`}
                    Icon={IconSparkles}
                    variant="secondary"
                    size="medium"
                    onClick={() => {}}
                  />
                </StyledToolContent>
              </StyledAITool>
            </StyledAITools>
          </StyledLeftContent>

          <StyledRightContent>
            <StyledVideoSection>
              <StyledVideoSectionHeader>
                <IconVideo size={16} />
                <StyledVideoSectionTitle>
                  {t`Marketing Video`}
                </StyledVideoSectionTitle>
              </StyledVideoSectionHeader>
              <StyledVideoContent>
                <StyledGenerateSection>
                  {isGenerating ? (
                    <StyledProgressContainer>
                      <ProgressBar value={generationProgress} />
                      <StyledProgressText>
                        {t`Generating videos...`} {generationProgress}%
                      </StyledProgressText>
                    </StyledProgressContainer>
                  ) : (
                    <>
                      <IconVideo size={32} />
                      <StyledToolDescription>
                        {t`Generate professional videos using AI by using your property images.`}
                      </StyledToolDescription>
                    </>
                  )}
                  <Button
                    title={isGenerating ? t`Generating...` : t`Generate Video`}
                    Icon={IconSparkles}
                    accent="blue"
                    size="medium"
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || images.length === 0}
                  />
                </StyledGenerateSection>
                {hasGeneratedVideos && (
                  <StyledGeneratedVideosSection>
                    <StyledGeneratedVideosTitle>
                      {t`Generated Videos`}
                    </StyledGeneratedVideosTitle>
                    <StyledVideoGrid>
                      {DEMO_VIDEOS.map((video, index) => (
                        <StyledVideoContainer key={index}>
                          <StyledVideo src={video} controls muted loop />
                        </StyledVideoContainer>
                      ))}
                    </StyledVideoGrid>
                  </StyledGeneratedVideosSection>
                )}
              </StyledVideoContent>
            </StyledVideoSection>
          </StyledRightContent>
        </StyledMainContent>
      </StyledContainer>

      <VideoGenerationModal
        ref={videoModalRef}
        onClose={() => videoModalRef.current?.close()}
        onGenerate={handleVideoGeneration}
        targetableObject={targetableObject}
      />
    </>
  );
};
