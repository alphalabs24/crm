import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, IconLayoutBottombarExpand, IconPhoto } from 'twenty-ui';
import { formatAmount } from '~/utils/format/formatAmount';

const StyledCollapsedPreview = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  bottom: ${({ theme }) => theme.spacing(2)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: fixed;
  right: ${({ theme }) => theme.spacing(2)};
  width: 300px;
  z-index: 2;
`;

const StyledImageContainer = styled.div`
  aspect-ratio: 1;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 60px;
  overflow: hidden;
  position: relative;
  width: 60px;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

const StyledPropertyName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPropertyPrice = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  if (!property) return null;

  const formattedPrice = property.rentNet?.amountMicros
    ? `${formatAmount(property.rentNet.amountMicros / 1000000)} ${property.rentNet.currencyCode}`
    : property.sellingPrice?.amountMicros
      ? `${formatAmount(property.sellingPrice.amountMicros / 1000000)} ${property.sellingPrice.currencyCode}`
      : null;

  return (
    <StyledCollapsedPreview>
      <StyledImageContainer>
        {property.images?.[0] ? (
          <StyledImage src={property.images[0]} alt={property.name} />
        ) : (
          <IconPhoto
            size={24}
            color={theme.font.color.light}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </StyledImageContainer>
      <StyledInfo>
        <StyledPropertyName>{property.name}</StyledPropertyName>
        {formattedPrice && (
          <StyledPropertyPrice>{formattedPrice}</StyledPropertyPrice>
        )}
      </StyledInfo>
      <Button
        Icon={IconLayoutBottombarExpand}
        variant="tertiary"
        onClick={onExpand}
      />
    </StyledCollapsedPreview>
  );
};
