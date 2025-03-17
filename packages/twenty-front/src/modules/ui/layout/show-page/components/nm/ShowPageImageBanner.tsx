import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { IconPhoto, LARGE_DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from 'twenty-ui';

type ShowPageImageBannerProps = {
  targetableObject: ActivityTargetableObject;
};

const SECONDARY_IMAGES_WIDTH_PERCENT = 40;
const IMAGE_HEIGHT_LARGE_DESKTOP = 400;
const IMAGE_HEIGHT = 230;
const IMAGE_HEIGHT_MOBILE = 190;

const StyledFirstImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const StyledSecondImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const StyledInnerFirstImageContainer = styled.div<{ isSingleImage?: boolean }>`
  display: flex;
  height: 100%;
  width: ${({ isSingleImage }) =>
    isSingleImage ? '100%' : `${100 - SECONDARY_IMAGES_WIDTH_PERCENT}%`};

  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledInnerSecondaryImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${SECONDARY_IMAGES_WIDTH_PERCENT}%;

  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledSecondImageContainer = styled.div<{ isFullHeight?: boolean }>`
  height: ${({ isFullHeight }) => (isFullHeight ? '100%' : '50%')};
  width: 100%;
`;

const StyledImageContainer = styled.div`
  display: flex;
  height: ${IMAGE_HEIGHT}px;
  width: 100%;

  @media only screen and (max-width: ${MOBILE_VIEWPORT}px) {
    height: ${IMAGE_HEIGHT_MOBILE}px;
  }
  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    height: ${IMAGE_HEIGHT_LARGE_DESKTOP}px;
  }
`;

const StyledDropZoneContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  pointer-events: none;
`;

const StyledUploadTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPlaceholderContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledPlaceholderText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.lg};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ShowPageImageBanner = ({
  targetableObject,
}: ShowPageImageBannerProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { attachments = [] } = useAttachments(targetableObject);
  const images = useMemo(
    () =>
      attachments
        .filter((attachment) => attachment.type === 'PropertyImage')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  return (
    <div style={{ position: 'relative' }}>
      <StyledImageContainer>
        {images.length === 0 ? (
          <StyledInnerFirstImageContainer isSingleImage>
            <StyledPlaceholderContainer>
              <IconPhoto size={48} color={theme.font.color.light} />
              <StyledPlaceholderText>
                {t`No images available`}
              </StyledPlaceholderText>
            </StyledPlaceholderContainer>
          </StyledInnerFirstImageContainer>
        ) : (
          <>
            <StyledInnerFirstImageContainer isSingleImage={images.length === 1}>
              <StyledFirstImage src={images[0].fullPath} alt="Property" />
            </StyledInnerFirstImageContainer>
            {images.length > 1 && (
              <StyledInnerSecondaryImageContainer>
                {images[1] && (
                  <StyledSecondImageContainer
                    isFullHeight={images.length === 2}
                  >
                    <StyledSecondImage
                      src={images[1].fullPath}
                      alt="Property"
                    />
                  </StyledSecondImageContainer>
                )}
                {images[2] && (
                  <StyledSecondImageContainer>
                    <StyledSecondImage
                      src={images[2].fullPath}
                      alt="Property"
                    />
                  </StyledSecondImageContainer>
                )}
              </StyledInnerSecondaryImageContainer>
            )}
          </>
        )}
      </StyledImageContainer>
    </div>
  );
};
