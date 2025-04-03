import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconMap } from 'twenty-ui';

const StyledContent = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddressContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledAddressDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAddressLine = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledMapPlaceholder = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 200px;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
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

  return (
    <Section title={t`Location`} icon={<IconMap size={16} />}>
      <StyledContent>
        <StyledAddressContainer>
          <StyledIconContainer>
            <IconMap size={16} />
          </StyledIconContainer>
          <StyledAddressDetails>
            {address.addressStreet1 && (
              <StyledAddressLine>{address.addressStreet1}</StyledAddressLine>
            )}
            <StyledAddressLine>
              {[
                address.addressCity,
                address.addressState,
                address.addressPostcode,
              ]
                .filter(Boolean)
                .join(', ')}
            </StyledAddressLine>
            {address.addressCountry && (
              <StyledAddressLine>{address.addressCountry}</StyledAddressLine>
            )}
          </StyledAddressDetails>
        </StyledAddressContainer>
        <StyledMapPlaceholder>{t`Map integration coming soon`}</StyledMapPlaceholder>
      </StyledContent>
    </Section>
  );
};
