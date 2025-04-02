import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { IconPhoto, MOBILE_VIEWPORT } from 'twenty-ui';
import { formatAmount } from '~/utils/format/formatAmount';

const StyledChipButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.25, 3)};
  position: relative;
  transition: all 0.1s ease-in-out;
  display: none;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.medium};
  }

  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
  }
`;

const StyledContent = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledPropertyName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPropertyDetails = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDot = styled.div`
  background-color: ${({ theme }) => theme.font.color.light};
  border-radius: 50%;
  height: 3px;
  width: 3px;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

type CollapsedPropertyPreviewProps = {
  property: any;
  onExpand: () => void;
};

export const CollapsedPropertyPreview = ({
  property,
  onExpand,
}: CollapsedPropertyPreviewProps) => {
  const theme = useTheme();

  const { attachments = [] } = useAttachments({
    id: property?.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  const propertyImages = useMemo(
    () =>
      attachments
        .filter((attachment) => attachment.type === 'PropertyImage')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  if (!property) return null;

  const formattedPrice = property.rentNet?.amountMicros
    ? `${formatAmount(property.rentNet.amountMicros / 1000000)} ${property.rentNet.currencyCode}`
    : property.sellingPrice?.amountMicros
      ? `${formatAmount(property.sellingPrice.amountMicros / 1000000)} ${property.sellingPrice.currencyCode}`
      : null;

  const propertyType = property.type || 'Property';
  const propertyLocation = property.location?.city || '';

  return (
    <StyledChipButton onClick={onExpand}>
      <StyledImageContainer>
        {propertyImages[0] ? (
          <StyledImage src={propertyImages[0].fullPath} alt={property.name} />
        ) : (
          <IconPhoto size={16} color={theme.font.color.light} />
        )}
      </StyledImageContainer>
      <StyledContent>
        <StyledPropertyName>{property.name}</StyledPropertyName>
        <StyledPropertyDetails>
          {propertyType}
          {propertyLocation && (
            <>
              <StyledDot />
              {propertyLocation}
            </>
          )}
          {formattedPrice && (
            <>
              <StyledDot />
              {formattedPrice}
            </>
          )}
        </StyledPropertyDetails>
      </StyledContent>
    </StyledChipButton>
  );
};
