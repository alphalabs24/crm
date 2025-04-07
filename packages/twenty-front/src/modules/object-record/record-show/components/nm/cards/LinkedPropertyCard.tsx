import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { IconChevronRight, IconPhoto } from 'twenty-ui';

const StyledContainer = styled(Link)`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  text-decoration: none;
  transition: background 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.medium};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-shrink: 0;
  height: 34px;
  justify-content: center;
  width: 34px;
  background: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledImage = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 34px;
  width: 34px;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const StyledTitleAndRefPropertyContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

const StyledRefProperty = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAddress = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.light};
  flex-shrink: 0;
`;

type LinkedPropertyCardProps = {
  property: ObjectRecord;
};

export const LinkedPropertyCard = ({ property }: LinkedPropertyCardProps) => {
  const address = property.address
    ? `${property.address?.addressStreet1 || ''} ${
        property.address?.addressCity || ''
      } ${property.address?.addressState || ''} ${
        property.address?.addressPostcode || ''
      } ${property.address?.addressCountry || ''}`
    : '';

  const propertyImages = usePropertyImages({
    id: property.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  const image = propertyImages[0];

  return (
    <StyledContainer
      to={getLinkToShowPage(CoreObjectNameSingular.Property, property)}
    >
      <StyledIconContainer>
        {image ? (
          <StyledImage src={image.fullPath} alt={property.name} />
        ) : (
          <IconPhoto size={14} />
        )}
      </StyledIconContainer>
      <StyledContent>
        <StyledTitleAndRefPropertyContainer>
          <StyledTitle>{property.name}</StyledTitle>
          <StyledRefProperty>{property.refProperty}</StyledRefProperty>
        </StyledTitleAndRefPropertyContainer>
        {address && <StyledAddress>{address}</StyledAddress>}
      </StyledContent>
      <StyledChevronRight size={16} />
    </StyledContainer>
  );
};
