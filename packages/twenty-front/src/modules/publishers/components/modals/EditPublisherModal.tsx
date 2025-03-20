import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { PlatformCredentialItem } from '@/publishers/components/PlatformCredentialItem';
import { PlatformCredentialItemSkeleton } from '@/publishers/components/PlatformCredentialItemSkeleton';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
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
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import isEqual from 'lodash.isequal';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
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
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type InitialState = {
  name: string;
  email: string;
  platformCredentials: Record<string, Record<string, string>>;
};

type Props = {
  onClose: () => void;
  publisherId?: string;
};

export const EditPublisherModal = forwardRef<ModalRefType, Props>(
  ({ onClose, publisherId }, ref) => {
    const { t } = useLingui();
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [platformCredentials, setPlatformCredentials] = useState<
      Record<string, Record<string, string>>
    >({});

    const initialStateRef = useRef<InitialState | null>(null);

    const { enqueueSnackBar } = useSnackBar();

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

    const theme = useTheme();

    useEffect(() => {
      if (agencyRecord) {
        const newName = agencyRecord.name || '';
        const newEmail =
          agencyRecord.email?.primaryEmail ||
          agencyRecord.emailPrimaryEmail ||
          '';

        // Initialize platform credentials from agency record
        const credentials: Record<string, Record<string, string>> = {};
        PUBLISHABLE_PLATFORMS.forEach((platformId) => {
          const platform = PLATFORMS[platformId];
          if (platform.fieldsOnAgency) {
            credentials[platformId] = {};
            platform.fieldsOnAgency.forEach((field) => {
              credentials[platformId][field.name] =
                agencyRecord[field.name] || '';
            });
          }
        });

        setName(newName);
        setEmail(newEmail);
        setPlatformCredentials(credentials);

        // Store initial state for existing publisher
        initialStateRef.current = {
          name: newName,
          email: newEmail,
          platformCredentials: credentials,
        };
      } else if (!publisherId) {
        // Initialize empty state for new publisher
        setName('');
        setEmail('');
        setPlatformCredentials({});

        initialStateRef.current = {
          name: '',
          email: '',
          platformCredentials: {},
        };
      }
    }, [agencyRecord, publisherId]);

    const hasChanges = useMemo(() => {
      // For new publishers, require at least a name
      if (!publisherId) {
        return name.trim() !== '';
      }

      if (!initialStateRef.current) return false;

      const currentState: InitialState = {
        name,
        email,
        platformCredentials,
      };

      return !isEqual(currentState, initialStateRef.current);
    }, [name, email, platformCredentials, publisherId]);

    const handleNameChange = useCallback(
      (value: string) => {
        setName(value);
        if (nameError) {
          setNameError('');
        }
      },
      [nameError],
    );

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

    const validateFields = () => {
      let isValid = true;

      if (!name.trim()) {
        setNameError(t`Name is required`);
        isValid = false;
      }

      if (email && !emailSchema.safeParse(email).success) {
        setEmailError(t`Please enter a valid email address`);
        isValid = false;
      }

      return isValid;
    };

    const closeModal = () => {
      setName('');
      setEmail('');
      setPlatformCredentials({});
      onClose();
    };

    const handleSave = async () => {
      if (!validateFields()) {
        return;
      }

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

        enqueueSnackBar(t`Credentials saved successfully`, {
          variant: SnackBarVariant.Success,
        });

        closeModal();
      } catch (error) {
        enqueueSnackBar(t`Error saving publisher`, {
          variant: SnackBarVariant.Error,
        });
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

    return (
      <Modal
        ref={ref}
        onClose={closeModal}
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
            <Button variant="tertiary" title={t`Cancel`} onClick={closeModal} />
            <Button
              title={t`Save`}
              onClick={handleSave}
              accent="blue"
              disabled={isLoading || !hasChanges}
            />
          </StyledModalHeaderButtons>
        </StyledModalHeader>
        <StyledModalContent>
          <StyledSection>
            <StyledSectionTitle>
              <Trans>Publisher Details</Trans>
            </StyledSectionTitle>
            <StyledSectionDescription>
              <Trans>
                Configure your publisher credentials that will be used across
                all platforms.
              </Trans>
            </StyledSectionDescription>
            <StyledInputContainer>
              {loadingAgencyRecord ? (
                <SkeletonTheme
                  baseColor={theme.background.tertiary}
                  highlightColor={theme.background.transparent.lighter}
                  borderRadius={theme.border.radius.sm}
                >
                  <div style={{ width: '100%' }}>
                    <Skeleton height={36} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <Skeleton height={36} />
                  </div>
                </SkeletonTheme>
              ) : (
                <>
                  <TextInputV2
                    label={t`Name`}
                    value={name}
                    onChange={handleNameChange}
                    placeholder={t`Enter publisher name`}
                    error={nameError}
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
                </>
              )}
            </StyledInputContainer>
            <StyledSectionDescription>
              <Trans>
                Name and Email are internally used by nestermind to identify the
                publisher.
              </Trans>
            </StyledSectionDescription>
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
            {loadingAgencyRecord ? (
              <>
                <PlatformCredentialItemSkeleton />
                <PlatformCredentialItemSkeleton />
                <PlatformCredentialItemSkeleton />
              </>
            ) : (
              Object.entries(PLATFORMS)
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
                ))
            )}
          </StyledSection>
        </StyledModalContent>
      </Modal>
    );
  },
);
