import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';

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

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const bg = '#fffbeb';
// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const border = '#fee685';
const StyledBoosterTag = styled.div`
  background: ${bg};
  border: 1px solid ${border};
  border-radius: ${({ theme }: { theme: Theme }) => theme.border.radius.sm};
  padding: 2px 5px;
  font-size: ${({ theme }: { theme: Theme }) => theme.font.size.sm};
  font-weight: ${({ theme }: { theme: Theme }) => theme.font.weight.semiBold};
`;

type NestermindBrandingProps = {
  size?: number;
  alignment?: 'flex-start' | 'center' | 'flex-end';
  showBooster?: boolean;
};

const NestermindBranding = ({
  size = 50,
  alignment = 'center',
  showBooster = true,
}: NestermindBrandingProps) => {
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const colorSchemeToUse =
    colorScheme === 'System' ? systemColorScheme : colorScheme;
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

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
      {showBooster && <StyledBoosterTag>Booster</StyledBoosterTag>}
    </StyledContainer>
  );
};

export default NestermindBranding;
