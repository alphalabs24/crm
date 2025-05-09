import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';
import { useKeyValueStore } from '@/onboarding/hooks/useKeyValueStore';
import { NestermindWorkspaceTier } from './nm/NestermindWorkspaceTier';
import { WorkspaceTier } from '../types/WorkspaceTierType';

const StyledContainer = styled.div<{
  alignment: 'flex-start' | 'center' | 'flex-end';
}>`
  align-items: ${({ alignment }) => alignment};
  justify-content: center;
  display: flex;
  gap: ${({ theme }: { theme: Theme }) => theme.spacing(2)};
  padding: ${({ theme }: { theme: Theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledImage = styled.img<{ size: number }>`
  aspect-ratio: 1.5;
  width: ${({ size }) => size}px;
`;

type NestermindBrandingProps = {
  size?: number;
  alignment?: 'flex-start' | 'center' | 'flex-end';
  showTier?: boolean;
};

// Make sure we only pass a valid workspace tier since key value pairs are untyped
const getSafeWorkspaceTier = (
  workspaceTier: string | number | boolean,
): WorkspaceTier => {
  switch (workspaceTier) {
    case WorkspaceTier.Booster:
      return WorkspaceTier.Booster;
    case WorkspaceTier.Pro:
      return WorkspaceTier.Pro;
    case WorkspaceTier.Premium:
      return WorkspaceTier.Premium;
    case WorkspaceTier.Starter:
      return WorkspaceTier.Starter;
    default:
      return WorkspaceTier.Booster;
  }
};

const NestermindBranding = ({
  size = 50,
  alignment = 'center',
  showTier = true,
}: NestermindBrandingProps) => {
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const { getValueByKey } = useKeyValueStore();
  const workspaceTier = getValueByKey('WorkspaceTier');

  if (!isNavigationDrawerExpanded) {
    return null;
  }
  return (
    <StyledContainer alignment={alignment}>
      <StyledImage
        src={`/images/integrations/nestermind-logo${
          colorSchemeToUse === 'Dark' ? '-light' : ''
        }.svg`}
        alt="Nestermind logo"
        size={size}
      />
      {showTier && (
        <NestermindWorkspaceTier tier={getSafeWorkspaceTier(workspaceTier)} />
      )}
    </StyledContainer>
  );
};

export default NestermindBranding;
