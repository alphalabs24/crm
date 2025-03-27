import styled from '@emotion/styled';

const StyledBadge = styled.div<{ status: string; size: 'small' | 'medium' }>`
  align-items: center;
  background: ${({ theme, status }) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return theme.tag.background.gray;
      case 'published':
        return theme.tag.background.green;
      case 'scheduled':
        return theme.tag.background.blue;
      case 'archived':
        return theme.tag.background.gray;
      case 'rejected':
        return theme.tag.background.red;
      default:
        return theme.tag.background.gray;
    }
  }};
  border-radius: ${({ theme, size }) =>
    size === 'small' ? theme.border.radius.xs : theme.border.radius.sm};
  color: ${({ theme, status }) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return theme.tag.text.gray;
      case 'published':
        return theme.tag.text.green;
      case 'scheduled':
        return theme.tag.text.blue;
      case 'archived':
        return theme.tag.text.gray;
      case 'rejected':
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

enum Status {
  Draft = 'Draft',
  Published = 'Published',
  Scheduled = 'Scheduled',
  Archived = 'Archived',
  Rejected = 'Rejected',
}

type StatusBadgeProps = {
  status?: Status | null | string;
  size?: 'small' | 'medium';
};

export const StatusBadge = ({
  status = Status.Draft,
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
