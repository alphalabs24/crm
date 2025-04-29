import styled from '@emotion/styled';

type DocumentTypeIconProps = {
  type: 'expose' | 'flyer';
  className?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1)};
  width: 24px;
  height: 32px;
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledRectangle = styled.div<{ $isHighlight?: boolean }>`
  background-color: ${({ theme, $isHighlight }) =>
    $isHighlight ? theme.accent.accent4060 : theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 4px;
  flex: 1;
`;

const StyledLongRectangle = styled(StyledRectangle)`
  flex: 2;
`;

const StyledImageBox = styled.div<{ $type: 'expose' | 'flyer' }>`
  background-color: ${({ theme }) => theme.accent.accent4060};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: ${({ $type }) => ($type === 'expose' ? '10px' : '12px')};
  width: 100%;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTitle = styled.div<{ $isHighlight?: boolean }>`
  background-color: ${({ theme, $isHighlight }) =>
    $isHighlight ? theme.accent.accent4060 : theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 5px;
  width: 70%;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledExposeTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

export const DocumentTypeIcon = ({
  type,
  className,
}: DocumentTypeIconProps) => {
  if (type === 'expose') {
    return (
      <StyledContainer className={className}>
        {/* Image at the top */}
        <StyledImageBox $type="expose" />

        {/* Detailed content layout for documentation */}
        <StyledExposeTextBlock>
          <StyledRow>
            <StyledRectangle $isHighlight />
            <StyledLongRectangle $isHighlight />
          </StyledRow>
          <StyledRow>
            <StyledLongRectangle $isHighlight />
            <StyledRectangle $isHighlight />
          </StyledRow>
          <StyledRow>
            <StyledRectangle $isHighlight />
            <StyledRectangle $isHighlight />
          </StyledRow>
        </StyledExposeTextBlock>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer className={className}>
      {/* Larger image for flyer */}
      <StyledImageBox $type="flyer" />

      {/* Minimal content layout for flyer */}
      <StyledRow>
        <StyledLongRectangle $isHighlight />
      </StyledRow>
      <StyledRow>
        <StyledRectangle $isHighlight />
        <StyledRectangle $isHighlight />
      </StyledRow>
    </StyledContainer>
  );
};
