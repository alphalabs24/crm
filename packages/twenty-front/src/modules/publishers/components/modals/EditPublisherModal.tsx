import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { PlatformCredentialItem } from '@/publishers/components/PlatformCredentialItem';
import { PlatformCredentialItemSkeleton } from '@/publishers/components/PlatformCredentialItemSkeleton';
import {
  PublisherLogoUpload,
  PublisherLogoUploadHandle,
} from '@/publishers/components/PublisherLogoUpload';
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

const StyledSubDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
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

export type AgencyCredential = {
  id: string;
  name: string;
  username: string;
  password: string;
  host: string;
  port: number;
  partnerId: string;
  platformAgencyId: string;
};

type InitialState = {
  name: string;
  email: string;
  platformCredentials: Record<string, AgencyCredential>;
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
      Record<string, AgencyCredential>
    >({});
    const [hasLogoChanges, setHasLogoChanges] = useState(false);

    const initialStateRef = useRef<InitialState | null>(null);
    const publisherLogoRef = useRef<PublisherLogoUploadHandle>(null);

    const [isSaving, setIsSaving] = useState(false);
    const { enqueueSnackBar } = useSnackBar();

    const {
      record: agencyRecord,
      loading: loadingAgencyRecord,
      refetch: refetchAgencyRecord,
    } = useFindOneRecord({
      objectNameSingular: CoreObjectNameSingular.Agency,
      objectRecordId: publisherId,
    });

    const [hasSetInitialValues, setHasSetInitialValues] = useState(false);

    const { createOneRecord, loading: creatingAgencyRecord } =
      useCreateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Agency,
      });

    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Agency,
    });

    const { createOneRecord: createCredentialRecord } = useCreateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Credential,
    });

    const { updateOneRecord: updateCredentialRecord } = useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Credential,
    });

    const theme = useTheme();

    useEffect(() => {
      if (hasSetInitialValues) return;
      if (agencyRecord) {
        const newName = agencyRecord.name || '';
        const newEmail =
          agencyRecord.email?.primaryEmail ||
          agencyRecord.emailPrimaryEmail ||
          '';

        // Initialize platform credentials from agency record
        const credentials: Record<string, AgencyCredential> = {};
        PUBLISHABLE_PLATFORMS.forEach((platformId) => {
          const platform = PLATFORMS[platformId];

          if (platform.fieldsOnAgency) {
            const creds = (
              agencyRecord.credentials as Array<AgencyCredential>
            ).find((c) => c.name === platformId);
            if (creds) credentials[platformId] = creds;
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
        setHasSetInitialValues(true);
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
    }, [agencyRecord, hasSetInitialValues, publisherId]);

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

      return !isEqual(currentState, initialStateRef.current) || hasLogoChanges;
    }, [name, email, platformCredentials, publisherId, hasLogoChanges]);

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

      if (!name.trim() || !emailSchema.safeParse(email).success) {
        setEmailError(t`Please enter a valid email address`);
        isValid = false;
      }

      return isValid;
    };

    const closeModal = () => {
      setName('');
      setEmail('');
      setPlatformCredentials({});
      setHasLogoChanges(false);
      onClose();
    };

    const handleSave = async () => {
      if (!validateFields()) {
        return;
      }

      setIsSaving(true);

      try {
        let publisherIdToUse = publisherId;
        if (publisherId) {
          await updateOneRecord({
            idToUpdate: publisherId,
            updateOneRecordInput: {
              email: {
                primaryEmail: email,
                additionalEmails: [],
              },
              name,
            },
          });
        } else {
          const newPublisher = await createOneRecord({
            name,
            email: {
              primaryEmail: email,
              additionalEmails: [],
            },
          });
          // TODO check if id is returned since its undefined when trying to create attachment
          publisherIdToUse = newPublisher.id;
        }

        await Promise.all(
          PUBLISHABLE_PLATFORMS.map(async (platform) => {
            const oldCredentials = agencyRecord?.credentials.find(
              (cred: AgencyCredential) => cred.name === platform,
            );
            const newCredentials = platformCredentials[platform];

            const propertiesToUpdate = {
              password: newCredentials?.password,
              username: newCredentials?.username,
              port: newCredentials?.port,
              host: newCredentials?.host,
              partnerId: newCredentials?.partnerId,
              platformAgencyId: newCredentials?.platformAgencyId,
            };

            if (!oldCredentials && newCredentials) {
              await createCredentialRecord({
                agencyId: publisherIdToUse,
                name: platform,
                ...propertiesToUpdate,
              });
            } else if (newCredentials) {
              await updateCredentialRecord({
                idToUpdate: oldCredentials.id,
                updateOneRecordInput: {
                  ...propertiesToUpdate,
                },
              });
            }
          }),
        );

        // Save logo changes if needed
        if (hasLogoChanges && publisherLogoRef.current) {
          // For a new publisher, we need to make sure the new ID is used
          if (publisherId) {
            // We need to wait for the refetch to complete to get the latest data
            await refetchAgencyRecord();
          }
          // Now save the logo changes
          await publisherLogoRef.current.saveChanges();
        }

        enqueueSnackBar(t`Credentials saved successfully`, {
          variant: SnackBarVariant.Success,
        });

        closeModal();
      } catch (error) {
        console.error(error);
        enqueueSnackBar(t`Error saving publisher`, {
          variant: SnackBarVariant.Error,
        });
      } finally {
        setIsSaving(false);
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
            <Button
              variant="tertiary"
              title={t`Cancel`}
              onClick={closeModal}
              disabled={isSaving || creatingAgencyRecord}
            />
            <Button
              title={t`Save`}
              onClick={handleSave}
              accent="blue"
              loading={isSaving || creatingAgencyRecord}
              disabled={!hasChanges}
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
                    required
                  />
                </>
              )}
            </StyledInputContainer>
            <StyledSubDescription>
              <Trans>
                Name and Email are internally used by nestermind to identify the
                publisher.
              </Trans>
            </StyledSubDescription>
          </StyledSection>

          {/* Add PublisherLogoUpload section */}
          <StyledSection>
            <PublisherLogoUpload
              ref={publisherLogoRef}
              publisherId={publisherId || ''}
              onImageChange={setHasLogoChanges}
            />
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
