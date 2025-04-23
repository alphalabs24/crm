import { PublicationStage } from '@/object-record/record-show/constants/PublicationStage';
import styled from '@emotion/styled';

const StyledBadge = styled.div<{ status: string; size: 'small' | 'medium' }>`
  align-items: center;
  background: ${({ theme, status }) => {
    switch (status) {
      case PublicationStage.Draft:
        return theme.tag.background.gray;
      case PublicationStage.Published:
        return theme.tag.background.green;
      case PublicationStage.Scheduled:
        return theme.tag.background.blue;
      case PublicationStage.Archived:
        return theme.tag.background.gray;
      case PublicationStage.Rejected:
        return theme.tag.background.red;
      default:
        return theme.tag.background.gray;
    }
  }};
  border-radius: ${({ theme, size }) =>
    size === 'small' ? theme.border.radius.xs : theme.border.radius.sm};
  color: ${({ theme, status }) => {
    switch (status) {
      case PublicationStage.Draft:
        return theme.tag.text.gray;
      case PublicationStage.Published:
        return theme.tag.text.green;
      case PublicationStage.Scheduled:
        return theme.tag.text.blue;
      case PublicationStage.Archived:
        return theme.tag.text.gray;
      case PublicationStage.Rejected:
        return theme.tag.text.red;
      default:
        return theme.tag.text.gray;
    }
  }};
  width: fit-content;
  font-size: ${({ theme, size }) =>
    size === 'small' ? theme.font.size.xs : theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme, size }) =>
    size === 'small'
      ? `${theme.spacing(0.75)} ${theme.spacing(1.5)}`
      : `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type StatusBadgeProps = {
  status?: PublicationStage | null | string;
  size?: 'small' | 'medium';
};

export const StatusBadge = ({
  status = PublicationStage.Draft,
  size = 'medium',
}: StatusBadgeProps) => {
  if (!status) {
    return null;
  }

  return (
    <StyledBadge status={status} size={size}>
      {status.toUpperCase()}
    </StyledBadge>
  );
};
