import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { IconPhoto } from 'twenty-ui';

const StyledContent = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledImagesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  max-height: 400px;
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

  transition: transform 0.2s ease;
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

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  min-height: 200px;
  width: 100%;
`;

type PropertyImagesCardProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  loading?: boolean;
};

export const PropertyImagesCard = ({
  targetableObject,
  loading = false,
}: PropertyImagesCardProps) => {
  const { t } = useLingui();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const { attachments = [] } = useAttachments(targetableObject);
  const images = attachments.filter(
    (attachment) => attachment.type === 'PropertyImage',
  );

  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [imageId]: true,
    }));
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Section title={t`Images`} icon={<IconPhoto size={16} />}>
      <StyledContent>
        {images.length > 0 ? (
          <StyledImagesGrid>
            {images.map((image) => (
              <StyledImageContainer key={image.id}>
                <StyledImage
                  src={image.fullPath}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onLoad={() => handleImageLoad(image.id)}
                  className={loadedImages[image.id] ? 'loaded' : ''}
                />
              </StyledImageContainer>
            ))}
          </StyledImagesGrid>
        ) : (
          <StyledEmptyState>
            <IconPhoto size={32} />
            <div>{t`No images available`}</div>
          </StyledEmptyState>
        )}
      </StyledContent>
    </Section>
  );
};
