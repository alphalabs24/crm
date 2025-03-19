import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { PlatformCredentialItem } from '@/publishers/components/PlatformCredentialItem';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import {
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import {
  PLATFORMS,
  PUBLISHABLE_PLATFORMS,
  PublishablePlatforms,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Button, IconSettings } from 'twenty-ui';

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledSectionDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledMultiInputContainer = styled.div`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMultiInputWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  min-height: 32px;
  width: 100%;

  &:focus-within {
    border-color: ${({ theme }) => theme.color.blue};
  }

  & > div {
    background-color: transparent;
    border: none;
    width: 100%;
  }

  & input {
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.font.color.primary};
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size.md};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    height: 32px;
    line-height: 32px;
    padding: ${({ theme }) => theme.spacing(2)};
    width: 100%;

    &::placeholder {
      color: ${({ theme }) => theme.font.color.light};
      font-family: ${({ theme }) => theme.font.family};
      font-weight: ${({ theme }) => theme.font.weight.medium};
    }

    &:focus {
      outline: none;
    }
  }
`;

type Props = {
  onClose: () => void;
  publisherId?: string;
};

export const EditPublisherModal = forwardRef<ModalRefType, Props>(
  ({ onClose, publisherId }, ref) => {
    const { t } = useLingui();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [platformCredentials, setPlatformCredentials] = useState<
      Record<string, Record<string, string>>
    >({});

    const { record: agencyRecord, loading: loadingAgencyRecord } =
      useFindOneRecord({
        objectNameSingular: CoreObjectNameSingular.Agency,
        objectRecordId: publisherId,
      });

    const { createOneRecord, loading: creatingAgencyRecord } =
      useCreateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Agency,
      });

    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Agency,
    });

    useEffect(() => {
      if (agencyRecord) {
        setName(agencyRecord.name || '');
        setEmail(agencyRecord.emailPrimaryEmail || '');

        // Initialize platform credentials from agency record
        const credentials: Record<string, Record<string, string>> = {};
        PUBLISHABLE_PLATFORMS.forEach((platformId) => {
          const platform = PLATFORMS[platformId];
          if (platform.fieldsOnAgency) {
            credentials[platformId] = {};
            platform.fieldsOnAgency.forEach((field) => {
              credentials[platformId][field] = agencyRecord[field] || '';
            });
          }
        });
        setPlatformCredentials(credentials);
      }
    }, [agencyRecord]);

    const handleEmailChange = useCallback(
      (value: string) => {
        setEmail(value);
        if (value && !emailSchema.safeParse(value).success) {
          setEmailError(t`Please enter a valid email address`);
        } else {
          setEmailError('');
        }
      },
      [t],
    );

    const handleSave = async () => {
      try {
        const allCredentials = Object.values(platformCredentials).reduce(
          (acc, credentials) => ({ ...acc, ...credentials }),
          {},
        );

        const recordData = {
          name,
          email: {
            primaryEmail: email,
          },
          ...allCredentials,
        };

        if (publisherId) {
          await updateOneRecord({
            idToUpdate: publisherId,
            updateOneRecordInput: recordData,
          });
        } else {
          await createOneRecord(recordData);
        }

        onClose();
      } catch (error) {
        console.error('Error saving publisher:', error);
      }
    };

    const handlePlatformCredentialChange = (
      platformId: PublishablePlatforms,
      fieldName: string,
      value: string,
    ) => {
      setPlatformCredentials((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          [fieldName]: value,
        },
      }));
    };

    const isLoading = loadingAgencyRecord || creatingAgencyRecord;
    const canSave =
      name.trim() !== '' && (!email || emailSchema.safeParse(email).success);

    return (
      <Modal
        ref={ref}
        onClose={onClose}
        isClosable
        closedOnMount
        padding="none"
        size="large"
      >
        <StyledModalHeader>
          <StyledModalTitleContainer>
            <IconSettings size={16} />
            <StyledModalTitle>{t`Configure Publisher`}</StyledModalTitle>
          </StyledModalTitleContainer>
          <StyledModalHeaderButtons>
            <Button variant="tertiary" title={t`Cancel`} onClick={onClose} />
            <Button
              title={t`Save`}
              onClick={handleSave}
              accent="blue"
              disabled={!canSave || isLoading}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>
          {loadingAgencyRecord ? (
            <div>Loading...</div>
          ) : (
            <>
              <StyledSection>
                <StyledSectionTitle>
                  <Trans>Publisher Details</Trans>
                </StyledSectionTitle>
                <StyledSectionDescription>
                  <Trans>
                    Configure your publisher profile information that will be
                    used across all platforms.
                  </Trans>
                </StyledSectionDescription>
                <StyledInputContainer>
                  <TextInputV2
                    label={t`Name`}
                    value={name}
                    onChange={setName}
                    placeholder={t`Enter publisher name`}
                    fullWidth
                    required
                  />
                  <TextInputV2
                    label={t`Email`}
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t`Enter email`}
                    error={emailError}
                    fullWidth
                  />
                </StyledInputContainer>
              </StyledSection>

              <StyledSection>
                <StyledSectionTitle>
                  <Trans>Platform Credentials</Trans>
                </StyledSectionTitle>
                <StyledSectionDescription>
                  <Trans>
                    Set up your credentials for each platforms where you want to
                    publish your listings.
                  </Trans>
                </StyledSectionDescription>
                {Object.entries(PLATFORMS)
                  .filter(([key]) =>
                    PUBLISHABLE_PLATFORMS.includes(key as PublishablePlatforms),
                  )
                  .map(([key, platform]) => (
                    <PlatformCredentialItem
                      key={key}
                      platformId={key as PublishablePlatforms}
                      platform={platform}
                      values={platformCredentials[key] || {}}
                      onChange={(fieldName: string, value: string) =>
                        handlePlatformCredentialChange(
                          key as PublishablePlatforms,
                          fieldName,
                          value,
                        )
                      }
                    />
                  ))}
              </StyledSection>
            </>
          )}
        </StyledModalContent>
      </Modal>
    );
  },
);
