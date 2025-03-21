import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  AppTooltip,
  IconFile,
  IconFileText,
  IconMailShare,
  IconUser,
  TooltipDelay,
} from 'twenty-ui';
import { v4 as uuidV4 } from 'uuid';
import { BLOCK_SCHEMA } from '../blocks/constants/Schema';

const StyledButtonBar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: 0 ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(1)};
  min-height: 34px;
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledPlaceholderButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  border: 0;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  transition: background 0.2s ease-in-out;
  width: 32px;

  &:hover {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

type PlaceholderButtonProps = {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  onClick: (placeholder: string) => void;
};

const PLACEHOLDERS = [
  {
    label: 'Insert Buyer Name',
    placeholder: '{{buyer_name}}',
    icon: <IconUser size={16} />,
  },
  {
    label: 'Insert Sender Name',
    placeholder: '{{sender_name}}',
    icon: <IconMailShare size={16} />,
  },
  {
    label: 'Insert Property Flyer',
    placeholder: '{{link_to_flyer}}',
    icon: <IconFile size={16} />,
  },
  {
    label: 'Insert Property Documentation',
    placeholder: '{{link_to_documentation}}',
    icon: <IconFileText size={16} />,
  },
];

const PlaceholderButton = ({
  label,
  placeholder,
  icon,
  onClick,
}: PlaceholderButtonProps) => {
  const buttonId = `placeholder-button-${uuidV4()}`;

  return (
    <>
      <StyledPlaceholderButton
        id={buttonId}
        onClick={() => onClick(placeholder)}
      >
        {icon}
      </StyledPlaceholderButton>
      <AppTooltip
        anchorSelect={`#${buttonId}`}
        content={label}
        clickable
        noArrow
        delay={TooltipDelay.noDelay}
        place="top"
      />
    </>
  );
};

type ActivityRichTextEditorPlaceholderButtonBarProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  readonly?: boolean;
};

export const ActivityRichTextEditorPlaceholderButtonBar = ({
  editor,
  readonly,
}: ActivityRichTextEditorPlaceholderButtonBarProps) => {
  const handlePlaceholderClick = (placeholder: string) => {
    if (!editor) return;

    const currentBlock = editor.getTextCursorPosition().block;
    if (!currentBlock) return;

    editor.insertInlineContent(placeholder);
  };

  if (!editor) return null;

  return (
    <StyledButtonBar>
      <StyledDescription>
        <Trans>Body</Trans>
      </StyledDescription>
      <StyledButtonsContainer>
        {readonly
          ? null
          : PLACEHOLDERS.map(({ label, placeholder, icon }) => (
              <PlaceholderButton
                key={placeholder}
                label={label}
                placeholder={placeholder}
                icon={icon}
                onClick={handlePlaceholderClick}
              />
            ))}
      </StyledButtonsContainer>
    </StyledButtonBar>
  );
};
