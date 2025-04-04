import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { useState } from 'react';
import { Avatar, IconButton, IconDots, IconTrash, MenuItem } from 'twenty-ui';
import { useInquiryPage } from '../contexts/InquiryPageContext';
import { useInquiryReadState } from '../hooks/useInquiryReadState';

const StyledInquiryItem = styled.div<{
  isLast: boolean;
  isUnread: boolean;
  isSelected: boolean;
}>`
  background-color: ${({ theme, isUnread, isSelected }) =>
    isSelected
      ? theme.background.transparent.medium
      : isUnread
        ? theme.background.transparent.lighter
        : theme.background.primary};
  border-bottom: ${({ isLast, theme }) =>
    isLast ? 'none' : `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  position: relative;
  transition: all 0.2s ease-in-out;
  width: 100%;

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected
        ? theme.background.transparent.medium
        : theme.background.transparent.light};
    border-color: ${({ theme }) => theme.border.color.medium};
  }

  ${({ isUnread, theme }) =>
    isUnread &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${theme.color.blue};
      border-top-left-radius: ${theme.border.radius.sm};
      border-bottom-left-radius: ${theme.border.radius.sm};
    }
  `}

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${theme.background.transparent.strong};
      border-top-right-radius: ${theme.border.radius.sm};
      border-bottom-right-radius: ${theme.border.radius.sm};
    }
  `}
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  min-width: 0;
`;

const StyledProfileSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  min-width: 0;
`;

const StyledContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledPreviewRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  min-width: 0;
  width: 100%;
`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  min-width: 0;
  flex: 1;
`;

const StyledName = styled.div<{ isUnread: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ isUnread, theme }) =>
    isUnread ? theme.font.weight.semiBold : theme.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMessagePreview = styled.div<{ isUnread: boolean }>`
  color: ${({ theme, isUnread }) =>
    isUnread ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isUnread, theme }) =>
    isUnread ? theme.font.weight.medium : theme.font.weight.regular};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  flex-shrink: 0;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledRelationshipSection = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledActionsSection = styled.div`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconButton = styled(IconButton)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

type InquiryItemProps = {
  inquiry: ObjectRecord;
  isLast?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

// Format message body
const formatMessageBody = (body: string) => {
  const isHTML = /<[a-z][\s\S]*>/i.test(body);
  if (isHTML) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;
    return tempDiv.textContent || body;
  }
  return body;
};

export const InquiryItem = ({
  onClick,
  inquiry,
  isLast = false,
  onDelete,
}: InquiryItemProps) => {
  const { t } = useLingui();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { createdAt, person, publication } = inquiry;
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  const fullName = `${person.name.firstName} ${person.name.lastName}`;
  const dropdownId = `inquiry-actions-${inquiry.id}`;
  const { closeDropdown } = useDropdown(dropdownId);
  const { isUnread, markAsRead } = useInquiryReadState();
  const { selectedInquiryId } = useInquiryPage();

  const handleClick = (event: React.MouseEvent) => {
    // Prevent opening the inquiry when clicking the dropdown
    if (
      event.target instanceof Element &&
      event.target.closest('.actions-dropdown')
    ) {
      event.stopPropagation();
      return;
    }
    markAsRead(inquiry.id);
    onClick?.();
  };

  const handleDelete = () => {
    onDelete?.();
    setIsDeleteModalOpen(false);
  };

  const isInquiryUnread = isUnread(inquiry);
  const isSelected = selectedInquiryId === inquiry.id;

  return (
    <>
      <StyledInquiryItem
        onClick={handleClick}
        isLast={isLast}
        isUnread={isInquiryUnread}
        isSelected={isSelected}
      >
        <StyledHeader>
          <StyledProfileSection>
            <Avatar
              avatarUrl={person.avatarUrl}
              placeholder={fullName}
              size="xl"
              type="rounded"
            />
            <StyledContentSection>
              <StyledPreviewRow>
                <StyledNameContainer>
                  <StyledName isUnread={isInquiryUnread}>{fullName}</StyledName>
                </StyledNameContainer>
                <StyledDate>{formattedDate}</StyledDate>
              </StyledPreviewRow>
              <StyledPreviewRow>
                {inquiry.messageThreads && (
                  <StyledMessagePreview isUnread={isInquiryUnread}>
                    {formatMessageBody(
                      inquiry.messageThreads[0]?.lastMessageBody,
                    )}
                  </StyledMessagePreview>
                )}
                <StyledRelationshipSection>
                  <PlatformBadge
                    platformId={publication.platform}
                    size="small"
                  />
                </StyledRelationshipSection>
              </StyledPreviewRow>
            </StyledContentSection>
          </StyledProfileSection>
          {onDelete && (
            <StyledActionsSection className="actions-dropdown">
              <Dropdown
                dropdownId={dropdownId}
                clickableComponent={
                  <StyledIconButton
                    Icon={IconDots}
                    variant="tertiary"
                    size="small"
                  />
                }
                dropdownComponents={
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text={t`Delete`}
                      LeftIcon={IconTrash}
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        closeDropdown();
                      }}
                      accent="danger"
                    />
                  </DropdownMenuItemsContainer>
                }
                dropdownHotkeyScope={{
                  scope: dropdownId,
                }}
              />
            </StyledActionsSection>
          )}
        </StyledHeader>
      </StyledInquiryItem>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={t`Delete inquiry`}
        subtitle={
          <Trans>
            Are you sure you want to delete this inquiry? This cannot be undone.
          </Trans>
        }
        setIsOpen={setIsDeleteModalOpen}
        onConfirmClick={handleDelete}
        deleteButtonText={t`Delete`}
      />
    </>
  );
};
