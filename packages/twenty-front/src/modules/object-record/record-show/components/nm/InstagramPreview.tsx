import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import {
  IconBrandInstagram,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from 'twenty-ui';
import { useEffect, useState } from 'react';

const StyledInstagramPreview = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  max-width: 468px;
  width: 100%;
  margin: 0 auto;
`;

const StyledPostHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledProfileImage = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledProfileName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCarouselContainer = styled.div`
  aspect-ratio: 1;
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  cursor: pointer;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledCarouselNav = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
`;

const StyledCarouselButton = styled.button`
  background: ${({ theme }) => theme.background.transparent.medium};
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.inverted};
  cursor: pointer;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.strong};
  }
`;

const StyledCarouselDots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledCarouselDot = styled.div<{ isActive?: boolean }>`
  background: ${({ theme, isActive }) =>
    isActive ? theme.color.blue : theme.background.tertiary};
  border-radius: 50%;
  height: 6px;
  width: 6px;
`;

const StyledPostDescription = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledDescriptionHeader = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledPostText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  white-space: pre-wrap;
`;

const StyledHashtags = styled.span`
  color: ${({ theme }) => theme.color.blue};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledPostTime = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.inverted};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  opacity: 0.8;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.strong};
    opacity: 1;
  }
`;

type InstagramPreviewProps = {
  videos: string[];
  images?: string[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  isVideoSelected?: boolean;
};

const formatDescription = (description: string) => {
  const hashtags = [
    '#luxuryrealestate',
    '#swissproperties',
    '#dreamhome',
    '#propertyforsale',
    '#luxuryliving',
  ];

  const emojis = '🏠✨';
  const formattedDesc = description?.split('\n')[0] || ''; // Take first paragraph

  return (
    <>
      {emojis} {formattedDesc}
      <StyledHashtags>{hashtags.join(' ')}</StyledHashtags>
    </>
  );
};

export const InstagramPreview = ({
  videos,
  images = [],
  currentSlide,
  setCurrentSlide,
  onPrevSlide,
  onNextSlide,
  isVideoSelected = false,
}: InstagramPreviewProps) => {
  const mediaItems = [...images, ...(isVideoSelected ? videos : [])];
  const isVideo = (index: number) => index >= images.length;
  const showNavigation = mediaItems.length > 1;
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isVideoSelected) {
      setCurrentSlide(0);
    }
  }, [isVideoSelected, setCurrentSlide]);

  const handleVideoClick = () => {
    const videoElement = document.getElementById(
      'preview-video',
    ) as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <StyledInstagramPreview>
      <StyledPostHeader>
        <StyledProfileImage>
          <IconBrandInstagram size={16} />
        </StyledProfileImage>
        <StyledProfileName>nestermind</StyledProfileName>
      </StyledPostHeader>
      <StyledCarouselContainer>
        {isVideo(currentSlide) ? (
          <>
            <StyledVideo
              id="preview-video"
              key={currentSlide}
              controls={false}
              loop
              muted
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onClick={handleVideoClick}
            >
              <source src={mediaItems[currentSlide]} type="video/mp4" />
            </StyledVideo>
            {isPlaying === false && (
              <StyledPlayButton onClick={handleVideoClick}>
                <IconPlayerPlay size={24} />
              </StyledPlayButton>
            )}
          </>
        ) : (
          <StyledImage src={mediaItems[currentSlide]} alt="Property" />
        )}
        {showNavigation && (
          <StyledCarouselNav>
            <StyledCarouselButton onClick={onPrevSlide}>
              <IconChevronLeft size={16} />
            </StyledCarouselButton>
            <StyledCarouselButton onClick={onNextSlide}>
              <IconChevronRight size={16} />
            </StyledCarouselButton>
          </StyledCarouselNav>
        )}
      </StyledCarouselContainer>
      {showNavigation && (
        <StyledCarouselDots>
          {mediaItems.map((_, index) => (
            <StyledCarouselDot key={index} isActive={currentSlide === index} />
          ))}
        </StyledCarouselDots>
      )}
      <StyledPostDescription>
        <StyledDescriptionHeader>nestermind</StyledDescriptionHeader>
        <StyledPostText>{formatDescription('')}</StyledPostText>
        <StyledPostTime>2 HOURS AGO</StyledPostTime>
      </StyledPostDescription>
    </StyledInstagramPreview>
  );
};
