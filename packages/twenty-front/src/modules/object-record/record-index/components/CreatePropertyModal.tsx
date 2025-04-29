import { mapboxAccessTokenState } from '@/client-config/states/mapboxAccessTokenState';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { AddressInput } from '@/ui/field/input/components/AddressInput';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { Button, IconPlus } from 'twenty-ui';

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  min-height: 40vh;
`;

const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

const StyledModalHeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledModalTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledModalTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

type CreatePropertyModalProps = {
  onClose: () => void;
  objectNameSingular: string;
};

export const CreatePropertyModal = forwardRef<
  ModalRefType,
  CreatePropertyModalProps
>(({ onClose, objectNameSingular }, ref) => {
  const { records } = useFindManyRecords({
    objectNameSingular,
  });
  const { t } = useLingui();
  const navigate = useNavigate();
  const mapboxAccessToken = useRecoilValue(mapboxAccessTokenState);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState<FieldAddressValue>({
    addressStreet1: '',
    addressStreet2: '',
    addressCity: '',
    addressState: '',
    addressPostcode: '',
    addressCountry: '',
    addressLat: 0,
    addressLng: 0,
  });
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
  });

  const generateNumericRef = () => {
    const existingRefs = records.map((record) => record.refProperty);
    let id = Math.floor(Math.random() * 100000000);

    while (existingRefs?.includes(id.toString())) {
      id = Math.floor(Math.random() * 100000000);
    }
    return id.toString();
  };

  const geocodeAddress = async (address: FieldAddressValue) => {
    if (!mapboxAccessToken) return null;

    // Only geocode if we have at least a street and city
    if (!address.addressStreet1 || !address.addressCity) return null;

    const addressString = [
      address.addressStreet1,
      address.addressStreet2,
      address.addressCity,
      address.addressState,
      address.addressPostcode,
      address.addressCountry,
    ]
      .filter(Boolean)
      .join(', ');

    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      addressString,
    )}.json?access_token=${mapboxAccessToken}&types=address&country=ch,de,fr,it&proximity=8.5417,47.3769&limit=1`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { addressLat: lat, addressLng: lng };
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }

    return null;
  };

  const handleCreate = async () => {
    if (!propertyName) return;

    // Get coordinates for the address
    let addressWithCoordinates = address;
    if (address.addressLat === 0 && address.addressLng === 0) {
      const coordinates = await geocodeAddress(address);
      addressWithCoordinates = coordinates
        ? { ...address, ...coordinates }
        : address;
    }

    const record = await createOneRecord({
      name: propertyName.trim(),
      address: addressWithCoordinates,
      refProperty: generateNumericRef(),
    });

    onClose();
    setPropertyName('');

    navigate(
      `${getLinkToShowPage(objectNameSingular, { id: record?.id })}/edit`,
    );
  };

  return (
    <Modal
      size="medium"
      onClose={onClose}
      isClosable
      ref={ref}
      closedOnMount
      hotkeyScope={ModalHotkeyScope.CreateProperty}
      padding="none"
    >
      <StyledModalHeader>
        <StyledModalTitleContainer>
          <IconPlus size={16} />
          <StyledModalTitle>
            <Trans>Create new property</Trans>
          </StyledModalTitle>
        </StyledModalTitleContainer>
        <StyledModalHeaderButtons>
          <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
          <Button
            title={t`Create`}
            onClick={handleCreate}
            accent="blue"
            disabled={!propertyName.trim()}
          />
        </StyledModalHeaderButtons>
      </StyledModalHeader>

      <StyledModalContent>
        <StyledDescription>
          <Trans>Enter the address of the new property</Trans>
        </StyledDescription>
        <AddressInput
          listenToOutsideClick={false}
          autofocus={true}
          value={address}
          fullWidth={true}
          noPadding
          onChange={(updatedAddress) => setAddress(updatedAddress)}
          onEnter={handleCreate}
          onEscape={() => {}}
          onClickOutside={() => {}}
          onTab={() => {}}
          onShiftTab={() => {}}
          hotkeyScope={ModalHotkeyScope.CreateProperty}
        />
        {((address.addressStreet1 !== '' &&
          address.addressPostcode !== '' &&
          address.addressCity !== '' &&
          address.addressCountry !== '') ||
          propertyName) && (
          <>
            <StyledDescription>
              <Trans>Enter a name for the property</Trans>
            </StyledDescription>
            <TextInputV2
              value={propertyName}
              onChange={(text) => setPropertyName(text)}
              placeholder={t`Property name`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isDefined(propertyName)) {
                    handleCreate();
                  }
                }
              }}
            />
          </>
        )}
      </StyledModalContent>
    </Modal>
  );
});

CreatePropertyModal.displayName = 'CreatePropertyModal';
