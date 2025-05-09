import styled from '@emotion/styled';
import { WorkspaceTier } from '../../types/WorkspaceTierType';
import { TIER_LABELS } from '../../constants/TierLabels';

const StyledBoosterTag = styled.div<{ tier: WorkspaceTier }>`
  background: ${({ theme, tier }) => theme.workspaceTier[tier]};
  border: 1px solid ${({ theme, tier }) => theme.workspaceTier[tier]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 2px 5px;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

type NestermindWorkspaceTierProps = {
  tier: WorkspaceTier;
};

export const NestermindWorkspaceTier = ({
  tier = WorkspaceTier.Booster,
}: NestermindWorkspaceTierProps) => {
  return <StyledBoosterTag tier={tier}>{TIER_LABELS[tier]}</StyledBoosterTag>;
};
