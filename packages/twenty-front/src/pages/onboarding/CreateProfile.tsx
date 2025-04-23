import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import {
  AppTooltip,
  Checkbox,
  H2Title,
  IconInfoCircle,
  MainButton,
  TooltipDelay,
} from 'twenty-ui';
import { z } from 'zod';

import { useNestermind } from '@/api/hooks/useNestermind';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import { OnboardingStatus } from '~/generated/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledCheckboxLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledWhyNeeded = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: italic;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const validationSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name can not be empty' }),
    lastName: z.string().min(1, { message: 'Last name can not be empty' }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateProfile = () => {
  const { t } = useLingui();
  const onboardingStatus = useOnboardingStatus();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const [dataAccessChecked, setDataAccessChecked] = useState(false);
  const theme = useTheme();
  const { useMutations } = useNestermind();

  const { mutate: createWorkspace } = useMutations.useCreateWorkspace({
    onError: (error: Error) => {
      enqueueSnackBar(error?.message || t`Failed to create workspace`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      firstName: currentWorkspaceMember?.name?.firstName ?? '',
      lastName: currentWorkspaceMember?.name?.lastName ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!currentWorkspaceMember?.id) {
          throw new Error('User is not logged in');
        }
        if (!data.firstName || !data.lastName) {
          throw new Error('First name or last name is missing');
        }

        createWorkspace();

        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            name: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
            colorScheme: 'System',
          },
        });

        setCurrentWorkspaceMember((current) => {
          if (isDefined(current)) {
            return {
              ...current,
              name: {
                firstName: data.firstName,
                lastName: data.lastName,
              },
              colorScheme: 'System',
            };
          }
          return current;
        });
        setNextOnboardingStatus();
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: SnackBarVariant.Error,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      updateOneRecord,
      setCurrentWorkspaceMember,
      setNextOnboardingStatus,
      enqueueSnackBar,
      createWorkspace,
    ],
  );

  const [isEditingMode, setIsEditingMode] = useState(false);

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (isEditingMode && dataAccessChecked && isValid) {
        onSubmit(getValues());
      }
    },
    PageHotkeyScope.CreateProfile,
  );

  if (onboardingStatus !== OnboardingStatus.PROFILE_CREATION) {
    return null;
  }

  return (
    <>
      <Title>
        <Trans>Create profile</Trans>
      </Title>
      <SubTitle>
        <Trans>How you'll be identified on the app.</Trans>
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title={t`Name`}
            description={t`Your name as it will be displayed on the app`}
          />
          {/* TODO: When react-web-hook-form is added to edit page we should create a dedicated component with context */}
          <StyledComboInputContainer>
            <Controller
              name="firstName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  autoFocus
                  label={t`First Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="Tim"
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  label={t`Last Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="Cook"
                  error={error?.message}
                  fullWidth
                />
              )}
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
        <StyledCheckboxContainer>
          <Checkbox
            checked={dataAccessChecked}
            onChange={(event) => setDataAccessChecked(event.target.checked)}
          />
          <StyledCheckboxLabel>
            {t`Allow nestermind to access and administer my data.`}{' '}
            <StyledWhyNeeded id="data-access-info">
              <IconInfoCircle size={14} color={theme.font.color.secondary} />
              {t`Why is this required?`}
            </StyledWhyNeeded>
          </StyledCheckboxLabel>
          <AppTooltip
            anchorSelect={`${'#'}data-access-info`}
            content={t`This permission is required for nestermind's automation and AI features to function properly.`}
            place="bottom"
            noArrow
            delay={TooltipDelay.shortDelay}
          />
        </StyledCheckboxContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting || !dataAccessChecked}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
