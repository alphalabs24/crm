import { mapboxAccessTokenState } from '@/client-config/states/mapboxAccessTokenState';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconCopy, IconMap } from 'twenty-ui';

const StyledAddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

const StyledCopyButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledAddressDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledStreetLine = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCityLine = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledMapContainer = styled.div`
  width: 100%;
  max-height: 250px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  position: relative;
  align-items: center;
  justify-content: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledMap = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledMapOverlay = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
`;

type PropertyAddressCardProps = {
  record: any;
  loading?: boolean;
};

export const PropertyAddressCard = ({
  record,
  loading = false,
}: PropertyAddressCardProps) => {
  const { t } = useLingui();
  const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
  const { enqueueSnackBar } = useSnackBar();
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

  if (loading) {
    return null;
  }

  const address = record.address;
  if (!address) {
    return null;
  }

  const hasAddress =
    address.addressStreet1 ||
    address.addressCity ||
    address.addressState ||
    address.addressPostcode ||
    address.addressCountry;

  if (!hasAddress) {
    return null;
  }

  const hasCoordinates = Boolean(address.addressLat && address.addressLng);

  // Format street address (street1 + street2 if available)
  const streetAddress = [address.addressStreet1, address.addressStreet2]
    .filter(Boolean)
    .join(', ');

  // Format city line (city, state postcode, country)
  const cityLine = [
    address.addressCity,
    [address.addressState, address.addressPostcode].filter(Boolean).join(' '),
    address.addressCountry,
  ]
    .filter(Boolean)
    .join(', ');

  const fullAddress = `${streetAddress}\n${cityLine}`;

  // Choose map style based on color scheme
  const mapStyle = colorSchemeToUse === 'Dark' ? 'dark-v11' : 'streets-v11';

  const mapUrl = hasCoordinates
    ? `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-s+ff0000(${address.addressLng},${address.addressLat})/${address.addressLng},${address.addressLat},16/600x400@2x?access_token=${mapboxAccessToken}`
    : '';

  const handleMapClick = () => {
    if (hasCoordinates) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address.addressLat},${address.addressLng}`,
        '_blank',
      );
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(fullAddress);
    enqueueSnackBar(t`Address copied to clipboard`, {
      variant: SnackBarVariant.Success,
    });
  };

  return (
    <Section title={t`Location`} icon={<IconMap size={16} />}>
      <StyledContent>
        <StyledAddressContainer>
          <StyledCopyButton onClick={handleCopyClick}>
            <IconCopy size={14} />
            {t`Copy`}
          </StyledCopyButton>
          <StyledAddressDetails>
            <StyledStreetLine>{streetAddress}</StyledStreetLine>
            <StyledCityLine>{cityLine}</StyledCityLine>
          </StyledAddressDetails>
        </StyledAddressContainer>

        {hasCoordinates ? (
          <StyledMapContainer onClick={handleMapClick}>
            <StyledMap src={mapUrl} alt={`Map of ${streetAddress}`} />
            <StyledMapOverlay>
              <IconMap size={12} />
              {t`Open in Google Maps`}
            </StyledMapOverlay>
          </StyledMapContainer>
        ) : (
          <StyledMapContainer>{t`No Map available`}</StyledMapContainer>
        )}
      </StyledContent>
    </Section>
  );
};
