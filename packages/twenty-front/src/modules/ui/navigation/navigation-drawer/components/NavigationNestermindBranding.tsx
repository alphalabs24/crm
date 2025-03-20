import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { Theme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledContainer = styled.div<{
  alignment: 'flex-start' | 'center' | 'flex-end';
}>`
  align-items: ${({ alignment }) => alignment};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: { theme: Theme }) => theme.spacing(1)};
  padding: ${({ theme }: { theme: Theme }) => theme.spacing(2)};
`;

const StyledImage = styled.img<{ size: number }>`
  aspect-ratio: 1.5;
  width: ${({ size }) => size}px;
`;

type NestermindBrandingProps = {
  size?: number;
  alignment?: 'flex-start' | 'center' | 'flex-end';
};

const NestermindBranding = ({
  size = 50,
  alignment = 'center',
}: NestermindBrandingProps) => {
  const { colorScheme } = useColorScheme();
  return (
    <StyledContainer alignment={alignment}>
      <StyledImage
        src={`/images/integrations/nestermind-logo${
          colorScheme === 'Dark' ? '-light' : ''
        }.svg`}
        alt="Nestermind logo"
        size={size}
      />
    </StyledContainer>
  );
};

export default NestermindBranding;
