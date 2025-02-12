import styled from '@emotion/styled';
import { useState } from 'react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconPlayerPlay,
    IconX,
} from 'twenty-ui';

const StyledCarouselContainer = styled.div`
  aspect-ratio: 1;
  position: relative;
  width: 100%;
  height: 100%;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const StyledCarouselDot = styled.div<{ isActive?: boolean }>`
  background: ${({ theme, isActive }) =>
    isActive ? theme.color.blue : theme.background.tertiary};
  border-radius: 50%;
  height: 6px;
  width: 6px;
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

const StyledPreviewList = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(4)};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  backdrop-filter: blur(8px);
`;

const StyledPreviewItem = styled.div<{ isActive?: boolean }>`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  border: 2px solid
    ${({ theme, isActive }) => (isActive ? theme.color.blue : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StyledPreviewImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledPreviewVideo = styled.video`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledRemoveButton = styled.div<{ isActive?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.xs};
  cursor: pointer;
  z-index: 1;
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.inverted : 'transparent'};
  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.background.transparent.strong : 'transparent'};
  }
`;

type InstagramCarouselProps = {
  videos: string[];
  images?: string[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  isVideoSelected?: boolean;
};

export const InstagramCarousel = ({
  videos,
  images = [],
  currentSlide,
  setCurrentSlide,
  onPrevSlide,
  onNextSlide,
  isVideoSelected = false,
}: InstagramCarouselProps) => {
  const mediaItems = [...(isVideoSelected ? videos : []), ...images];
  const isVideo = (index: number) => index < videos.length;
  const showNavigation = mediaItems.length > 1;
  const [isPlaying, setIsPlaying] = useState(true);

  const handleVideoClick = () => {
    const videoElement = document.getElementById(
      'preview-video',
    ) as HTMLVideoElement;
    if (videoElement !== null) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
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
          {!isPlaying && (
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

      <StyledPreviewList>
        {mediaItems.map((item, index) => (
          <StyledPreviewItem
            key={index}
            isActive={currentSlide === index}
            onClick={() => setCurrentSlide(index)}
          >
            <StyledRemoveButton isActive={currentSlide === index}>
              <IconX size={16} />
            </StyledRemoveButton>
            {isVideo(index) ? (
              <StyledPreviewVideo>
                <source src={item} type="video/mp4" />
              </StyledPreviewVideo>
            ) : (
              <StyledPreviewImage src={item} alt="Preview" />
            )}
          </StyledPreviewItem>
        ))}
      </StyledPreviewList>
    </StyledCarouselContainer>
  );
};
