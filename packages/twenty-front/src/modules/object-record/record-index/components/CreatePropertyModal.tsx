import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { AddressInput } from '@/ui/field/input/components/AddressInput';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import styled from '@emotion/styled';
import { forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  const handleCreate = async () => {
    if (!propertyName) return;

    const record = await createOneRecord({
      name: propertyName.trim(),
      address: address,
    });

    onClose();
    setPropertyName('');

    navigate(`/${objectNameSingular}/${record?.id}/edit`);
  };

  return (
    <Modal
      size="medium"
      onClose={onClose}
      isClosable
      ref={ref}
      closedOnMount
      hotkeyScope={ModalHotkeyScope.Default}
      padding="none"
    >
      <StyledModalHeader>
        <StyledModalTitleContainer>
          <IconPlus size={16} />
          <StyledModalTitle>Create new property</StyledModalTitle>
        </StyledModalTitleContainer>
        <StyledModalHeaderButtons>
          <Button variant="tertiary" title="Cancel" onClick={onClose} />
          <Button
            title="Create"
            onClick={handleCreate}
            accent="blue"
            disabled={!propertyName.trim()}
          />
        </StyledModalHeaderButtons>
      </StyledModalHeader>

      <StyledModalContent>
        <StyledDescription>
          Enter the address of the new property
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
          hotkeyScope="address"
        />
        {((address.addressStreet1 !== '' &&
          address.addressPostcode !== '' &&
          address.addressCity !== '' &&
          address.addressCountry !== '') ||
          propertyName) && (
          <>
            <StyledDescription>Enter a name for the property</StyledDescription>
            <TextInputV2
              value={propertyName}
              onChange={(text) => setPropertyName(text)}
              placeholder="Property name"
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
