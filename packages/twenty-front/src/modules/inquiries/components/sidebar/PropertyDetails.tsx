import { DateFormat } from '@/localization/constants/DateFormat';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { capitalize } from 'twenty-shared';
import {
  AppTooltip,
  Button,
  IconLayoutBottombarCollapse,
  IconMap,
  IconPhoto,
  TooltipDelay,
} from 'twenty-ui';
import { formatAmount } from '~/utils/format/formatAmount';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
`;

const StyledPropertyInfoContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 42px;
`;

const StyledHeaderContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 50px;
  height: 50px;
`;

const StyledPropertyAddress = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyDetails = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;
  flex-shrink: 0;
`;

const StyledPropertyInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyHeaderName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledPropertyHeaderDetails = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledHoverName = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const StyledPropertyPrice = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-top: ${({ theme }) => theme.spacing(1)};
  text-decoration: underline;
`;

const StyledDetailCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailCard = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: default;
`;

const StyledPropertyDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPropertyDetailsCard = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

// Additional details fields to display with proper formatting
const DETAIL_FIELDS = [
  'category',
  'surface',
  'rooms',
  'livingSurface',
  'floor',
  'constructionYear',
  'renovationYear',
];

// Get formatted value based on field type
const getFormattedValue = (fieldName: string, value: any, label?: string) => {
  if (value === undefined || value === null) return '';

  if (fieldName === 'surface' || fieldName === 'livingSurface') {
    return `${value} m²`;
  }

  if (fieldName === 'volume') {
    return `${value} m³`;
  }

  if (fieldName === 'category') {
    return capitalize(value.toLowerCase());
  }

  if ((fieldName === 'rooms' || fieldName === 'floor') && label)
    return `${label}: ${value}`;

  return String(value);
};

type PropertyDetailsProps = {
  property: any;
  onCollapse: () => void;
};

export const PropertyDetails = ({
  property,
  onCollapse,
}: PropertyDetailsProps) => {
  const theme = useTheme();
  const { t } = useLingui();

  // Get property details from the object metadata
  const { recordFromStore, recordLoading } = useRecordShowContainerData({
    objectNameSingular: CoreObjectNameSingular.Property,
    objectRecordId: property?.id,
  });

  // object metadata
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  // Use the data from the store if available, otherwise use the passed property
  const propertyData = useMemo(() => {
    return recordFromStore || property;
  }, [recordFromStore, property]);

  // Get field metadata map for tooltips
  const fieldMetadataMap = useMemo(() => {
    if (!objectMetadataItem) return {};

    return objectMetadataItem.fields.reduce(
      (acc, field) => {
        acc[field.name] = field;
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [objectMetadataItem]);

  if (!propertyData) return null;

  const formattedPrice = propertyData.rentNet?.amountMicros
    ? `${formatAmount(propertyData.rentNet.amountMicros / 1000000)} ${propertyData.rentNet.currencyCode}`
    : propertyData.sellingPrice?.amountMicros
      ? `${formatAmount(propertyData.sellingPrice.amountMicros / 1000000)} ${propertyData.sellingPrice.currencyCode}`
      : null;

  const isRental = propertyData.category === 'Rental';

  if (recordLoading) {
    return (
      <StyledPropertyDetails>
        <StyledHeader>
          <StyledHeaderContent>
            <StyledHeaderTitle>
              <Trans>Property Details</Trans>
            </StyledHeaderTitle>
          </StyledHeaderContent>
          <Button
            Icon={IconLayoutBottombarCollapse}
            variant="tertiary"
            onClick={onCollapse}
            disabled={true}
          />
        </StyledHeader>
        <StyledLoadingContainer>
          <Trans>Loading...</Trans>
        </StyledLoadingContainer>
      </StyledPropertyDetails>
    );
  }

  return (
    <StyledPropertyDetails>
      <StyledHeader>
        <StyledHeaderContent>
          <StyledHeaderTitle>
            <Trans>Property Details</Trans>
          </StyledHeaderTitle>
        </StyledHeaderContent>
        <Button
          Icon={IconLayoutBottombarCollapse}
          variant="tertiary"
          onClick={onCollapse}
        />
      </StyledHeader>
      <StyledContent>
        <StyledPropertyInfoContainer>
          <StyledImageContainer>
            {propertyData.images?.[0] ? (
              <StyledImage
                src={propertyData.images[0]}
                alt={propertyData.name}
              />
            ) : (
              <IconPhoto size={20} color={theme.font.color.light} />
            )}
          </StyledImageContainer>

          <StyledPropertyInfo>
            <StyledPropertyHeaderName>
              {propertyData.name}
            </StyledPropertyHeaderName>
            <StyledPropertyHeaderDetails>
              {objectMetadataItem?.labelSingular}
              {propertyData.createdAt
                ? ` · ${t`Created on`} ${format(
                    new Date(propertyData.createdAt),
                    DateFormat.DAY_FIRST,
                  )}`
                : ''}
            </StyledPropertyHeaderDetails>
          </StyledPropertyInfo>
        </StyledPropertyInfoContainer>
        <StyledPropertyDetailsContainer>
          <StyledPropertyDetailsCard>
            <StyledPropertyName>
              <StyledHoverName
                to={getLinkToShowPage(
                  CoreObjectNameSingular.Property,
                  propertyData,
                )}
              >
                {propertyData.name}{' '}
              </StyledHoverName>
              <StyledDetailCard>
                ref: {propertyData.refProperty}
              </StyledDetailCard>
            </StyledPropertyName>
            {propertyData.address && (
              <StyledPropertyAddress>
                <IconMap size={14} />
                {[
                  propertyData.address.addressStreet1,
                  propertyData.address.addressCity,
                  propertyData.address.addressPostcode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </StyledPropertyAddress>
            )}

            {formattedPrice && (
              <StyledPropertyPrice>
                {formattedPrice}
                {isRental && <span> / month</span>}
              </StyledPropertyPrice>
            )}

            <StyledDetailCardsContainer>
              {DETAIL_FIELDS.map((field) => {
                if (!propertyData[field]) return null;

                const fieldId = `property-field-${field}`;
                const fieldMetadata = fieldMetadataMap[field];
                const formattedValue = getFormattedValue(
                  field,
                  propertyData[field],
                  fieldMetadata?.label,
                );

                return (
                  <React.Fragment key={field}>
                    <StyledDetailCard id={fieldId}>
                      {formattedValue}
                    </StyledDetailCard>
                    <AppTooltip
                      anchorSelect={`#${fieldId}`}
                      content={fieldMetadata?.label || field}
                      place="bottom"
                      noArrow
                      delay={TooltipDelay.noDelay}
                      clickable
                    />
                  </React.Fragment>
                );
              })}
            </StyledDetailCardsContainer>
          </StyledPropertyDetailsCard>
        </StyledPropertyDetailsContainer>
      </StyledContent>
    </StyledPropertyDetails>
  );
};
