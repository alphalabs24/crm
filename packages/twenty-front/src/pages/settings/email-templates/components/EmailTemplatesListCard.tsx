import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    IconChevronRight,
    IconPlus,
    IconTrash,
    MOBILE_VIEWPORT,
} from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
  cursor: pointer;
  grid-template-columns: 150px 1fr 28px 28px;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    grid-template-columns: 8fr 12fr 28px 28px;
  }
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPreviewTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledDeleteButton = styled(IconTrash)`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.red};
  }
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

type EmailTemplatesListCardProps = {
  emailTemplates: any[];
  loading?: boolean;
  onDeleteClick: (id: string) => void;
};

export const EmailTemplatesListCard = ({
  emailTemplates,
  loading,
  onDeleteClick,
}: EmailTemplatesListCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const handleCreateTemplate = async () => {
    const newTemplate = await createOneRecord({
      title: t`New Template`,
      isTemplate: true,
      body: '',
    });

    if (newTemplate?.id) {
      navigate(
        getSettingsPath(SettingsPath.EmailTemplateEdit, {
          emailTemplateId: newTemplate.id,
        }),
      );
    }
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(
      getSettingsPath(SettingsPath.EmailTemplateEdit, {
        emailTemplateId: templateId,
      }),
    );
  };

  return (
    <>
      <Table>
        <StyledTableRow>
          <TableHeader>
            <Trans>Subject</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Preview</Trans>
          </TableHeader>
          <TableHeader></TableHeader>
          <TableHeader></TableHeader>
        </StyledTableRow>
        {loading ? (
          <StyledEmptyState>{t`Loading...`}</StyledEmptyState>
        ) : !emailTemplates.length ? (
          <StyledEmptyState>{t`No email templates configured yet`}</StyledEmptyState>
        ) : (
          <StyledTableBody>
            {emailTemplates.map((template) => (
              <StyledTableRow
                key={template.id}
                onClick={() => handleEditTemplate(template.id)}
              >
                <StyledNameTableCell>{template.title}</StyledNameTableCell>
                <StyledPreviewTableCell>
                  {template.body || template.bodyV2?.markdown || t`No content`}
                </StyledPreviewTableCell>
                <StyledIconTableCell
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(template.id);
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
          title={t`Create Template`}
          size="small"
          variant="secondary"
          onClick={handleCreateTemplate}
        />
      </StyledButtonContainer>
    </>
  );
};
