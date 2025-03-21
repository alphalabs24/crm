import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePublishers } from '@/publishers/contexts/PublisherContext';
import {
    PLATFORMS,
    PUBLISHABLE_PLATFORMS,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
    Button,
    IconChevronRight,
    IconPlus,
    IconTrash,
    MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(3)};
    display: flex;
    justify-content: space-between;
    scroll-behavior: smooth;
  }
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 150px auto 28px 28px;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    grid-template-columns: 8fr 12fr 1fr 1fr;
  }
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-left: 0;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledPublisherInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPublisherName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPublisherEmail = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPlatformBadges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledDeleteButton = styled(IconTrash)`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.red};
  }
`;

type PublishersListCardProps = {
  publishers: ObjectRecord[];
  loading?: boolean;
  onDeleteClick?: (publisherId: string) => void;
};

export const PublishersListCard = ({
  publishers,
  loading,
  onDeleteClick,
}: PublishersListCardProps) => {
  const { t } = useLingui();
  const { openModalForPublisher } = usePublishers();
  const theme = useTheme();

  const handleAddPublisher = () => {
    openModalForPublisher();
  };

  const getConnectedPlatforms = (publisher: ObjectRecord) => {
    return PUBLISHABLE_PLATFORMS.filter((platformId) => {
      const platform = PLATFORMS[platformId];
      if (!platform.fieldsOnAgency) return false;

      return platform.fieldsOnAgency.some((field) => publisher[field.name]);
    });
  };

  return (
    <>
      <Table>
        <StyledTableRow>
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Platforms</Trans>
          </TableHeader>
          <TableHeader></TableHeader>
          <TableHeader></TableHeader>
        </StyledTableRow>
        {loading ? (
          <StyledEmptyState>{t`Loading...`}</StyledEmptyState>
        ) : !publishers.length ? (
          <StyledEmptyState>{t`No publishers configured yet`}</StyledEmptyState>
        ) : (
          <StyledTableBody>
            {publishers.map((publisher) => (
              <StyledTableRow
                key={publisher.id}
                onClick={() => openModalForPublisher(publisher.id)}
              >
                <StyledNameTableCell>
                  <StyledPublisherInfo>
                    <StyledPublisherName>{publisher.name}</StyledPublisherName>
                    {publisher.emailPrimaryEmail && (
                      <StyledPublisherEmail>
                        {publisher.emailPrimaryEmail}
                      </StyledPublisherEmail>
                    )}
                  </StyledPublisherInfo>
                </StyledNameTableCell>
                <TableCell>
                  <StyledPlatformBadges>
                    {getConnectedPlatforms(publisher).map((platformId) => (
                      <PlatformBadge
                        key={platformId}
                        platformId={platformId}
                        variant="small"
                      />
                    ))}
                  </StyledPlatformBadges>
                </TableCell>
                <StyledIconTableCell
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick?.(publisher.id);
                  }}
                >
                  <StyledDeleteButton
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </StyledIconTableCell>
                <StyledIconTableCell>
                  <StyledIconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </StyledIconTableCell>
              </StyledTableRow>
            ))}
          </StyledTableBody>
        )}
      </Table>
      <StyledButtonContainer>
        <Button
          Icon={IconPlus}
          title={t`Add Publisher`}
          size="small"
          variant="secondary"
          onClick={handleAddPublisher}
        />
      </StyledButtonContainer>
    </>
  );
};
