import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawerItems } from '@/navigation/components/MainNavigationDrawerItems';
import { OnboardingSteps } from '@/onboarding-tutorial/components/OnboardingSteps';
import NestermindBranding from '@/ui/navigation/navigation-drawer/components/NavigationNestermindBranding';
import { useLingui } from '@lingui/react/macro';
import { AdvancedSettingsToggle } from 'twenty-ui';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );

  const { t } = useLingui();

  const drawerProps: NavigationDrawerProps = isSettingsDrawer
    ? {
        title: t`Exit Settings`,
        children: <SettingsNavigationDrawerItems />,
        footer: (
          <>
            <AdvancedSettingsToggle
              isAdvancedModeEnabled={isAdvancedModeEnabled}
              setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
              label={t`Advanced:`}
            />
            <NestermindBranding size={75} />
          </>
        ),
        logo: '',
      }
    : {
        logo: currentWorkspace?.logo ?? '',
        title: currentWorkspace?.displayName ?? '',
        children: <MainNavigationDrawerItems />,
        footer: (
          <>
            <SupportDropdown />
            <OnboardingSteps />
            <NestermindBranding size={75} />
          </>
        ),
      };

  return (
    <NavigationDrawer
      className={className}
      logo={drawerProps.logo}
      title={drawerProps.title}
      footer={drawerProps.footer}
    >
      {drawerProps.children}
    </NavigationDrawer>
  );
};
