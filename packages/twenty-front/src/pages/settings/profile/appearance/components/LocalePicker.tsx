import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Select } from '@/ui/input/components/Select';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { APP_LOCALES, isDefined } from 'twenty-shared';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const LocalePicker = () => {
  const { t, i18n } = useLingui();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const isDebugMode = useRecoilValue(isDebugModeState);

  // Track selected locale when workspace member isn't defined
  const [selectedLocale, setSelectedLocale] = useState<
    keyof typeof APP_LOCALES
  >(
    (currentWorkspaceMember?.locale as keyof typeof APP_LOCALES) ||
      i18n.locale ||
      APP_LOCALES.en,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const updateWorkspaceMember = async (changedFields: any) => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: changedFields,
      });
    } catch (error) {
      logError(error);
    }
  };

  const handleLocaleChange = async (value: keyof typeof APP_LOCALES) => {
    if (isDefined(currentWorkspaceMember)) {
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...{ locale: value },
      });
      await updateWorkspaceMember({ locale: value });

      // Only refresh metadata if user is authenticated
      await refreshObjectMetadataItems();
    } else {
      // Just update the local state when workspace member isn't defined
      setSelectedLocale(value);
    }

    // Always update the locale regardless of authentication status
    await dynamicActivate(value);
  };

  const localeOptions: Array<{
    label: string;
    value: (typeof APP_LOCALES)[keyof typeof APP_LOCALES];
  }> = [
    {
      label: t`English`,
      value: APP_LOCALES.en,
    },
    {
      label: t`French`,
      value: APP_LOCALES['fr-FR'],
    },
    {
      label: t`German`,
      value: APP_LOCALES['de-DE'],
    },
    {
      label: t`Italian`,
      value: APP_LOCALES['it-IT'],
    },
  ];
  if (isDebugMode) {
    localeOptions.push({
      label: t`Pseudo-English`,
      value: APP_LOCALES['pseudo-en'],
    });
  }

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        value={
          isDefined(currentWorkspaceMember)
            ? currentWorkspaceMember.locale
            : selectedLocale
        }
        options={localeOptions}
        onChange={(value) =>
          handleLocaleChange(value as keyof typeof APP_LOCALES)
        }
      />
    </StyledContainer>
  );
};
