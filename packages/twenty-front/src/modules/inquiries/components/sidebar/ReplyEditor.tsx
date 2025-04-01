import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCreateBlockNote } from '@blocknote/react';
import { useState } from 'react';
import { Button, IconSend } from 'twenty-ui';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { CustomBlockEditor } from './CustomBlockEditor';

// Special hotkey scope for the reply editor
export enum ReplyEditorHotkeyScope {
  ReplyEditorBody = 'reply-editor-body',
}

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(1)};
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

type ReplyEditorProps = {
  onSend?: (content: string) => void;
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
};

export const ReplyEditor = ({
  onSend,
  recipientEmail = '',
  recipientName = '',
  subject = 'Re: Inquiry',
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

      <StyledEditorWrapper key={editorKey}>
        <CustomBlockEditor
          editor={editor}
          onChange={handleEditorChange}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
        />
      </StyledEditorWrapper>

      <StyledButtonContainer>
        <Button
          title="Send"
          Icon={IconSend}
          variant="primary"
          onClick={handleSend}
          disabled={isSending}
        />
      </StyledButtonContainer>
    </StyledReplyEditorContainer>
  );
};
