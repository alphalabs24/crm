import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { Button, IconRocket, IconSend } from 'twenty-ui';
import { CustomBlockEditor } from './CustomBlockEditor';

// Special hotkey scope for the reply editor
export enum ReplyEditorHotkeyScope {
  ReplyEditorBody = 'reply-editor-body',
}

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledComingSoonTag = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
`;

const StyledComposeHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledEditorWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  position: relative;
`;

const StyledReplyEditorContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSubject = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledPlaceholderWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  height: 120px;
  justify-content: center;
  width: 100%;
`;

type ReplyEditorProps = {
  onSend?: (content: string) => void;
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  disabled?: boolean;
  comingSoon?: boolean;
};

export const ReplyEditor = ({
  onSend,
  disabled = false,
  recipientEmail = '',
  recipientName = '',
  subject = 'Re: Inquiry',
  comingSoon = false,
}: ReplyEditorProps) => {
  const theme = useTheme();
  const [isSending, setIsSending] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  // Create editor instance
  const editor = useCreateBlockNote({
    domAttributes: {
      editor: { class: 'editor' },
    },
    schema: BLOCK_SCHEMA,
  });

  const handleEditorChange = () => {
    // You could implement validation or preview logic here
  };

  const handleSend = async () => {
    if (!editor) return;

    setIsSending(true);

    try {
      // Get content as JSON for sending
      const content = JSON.stringify(editor.document);

      // Call the onSend callback with the content
      await onSend?.(content);

      // Reset the editor by forcing a re-render with a new key
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditorFocus = () => {
    // Set the custom hotkey scope when the editor is focused
    setHotkeyScopeAndMemorizePreviousScope(
      ReplyEditorHotkeyScope.ReplyEditorBody,
    );
  };

  const handleEditorBlur = () => {
    // Restore the previous hotkey scope when editor loses focus
    goBackToPreviousHotkeyScope();
  };

  return (
    <StyledReplyEditorContainer>
      <StyledComposeHeader>
        <StyledSubject>{subject}</StyledSubject>
      </StyledComposeHeader>

      {comingSoon ? (
        <StyledPlaceholderWrapper>
          <StyledComingSoonTag>
            <IconRocket size={14} />
            <Trans>Reply functionality coming soon</Trans>
          </StyledComingSoonTag>
        </StyledPlaceholderWrapper>
      ) : (
        <StyledEditorWrapper key={editorKey}>
          <CustomBlockEditor
            editor={editor}
            readonly={disabled}
            onChange={handleEditorChange}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
          />
        </StyledEditorWrapper>
      )}

      <StyledButtonContainer>
        <Button
          title="Send"
          Icon={IconSend}
          variant="primary"
          onClick={handleSend}
          disabled={comingSoon || disabled || isSending}
        />
      </StyledButtonContainer>
    </StyledReplyEditorContainer>
  );
};
