import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import {
  StyledModalContent,
  StyledModalHeader,
  StyledModalHeaderButtons,
  StyledModalTitle,
  StyledModalTitleContainer,
} from '@/ui/layout/show-page/components/nm/modal-components/ModalComponents';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { ReactNode, useMemo, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  AppTooltip,
  Button,
  IconArrowRight,
  IconFileText,
  IconMap,
} from 'twenty-ui';
import { v4 as uuidV4 } from 'uuid';

import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

// Type for the BlockNote content structure
type BlockNoteContent = {
  id: string;
  type: string;
  props: {
    textColor: string;
    backgroundColor: string;
    textAlignment: string;
  };
  content: Array<{
    type: string;
    text: string;
    styles?: {
      bold?: boolean;
    };
  }>;
  children: any[];
};

type ShowPagePropertySummaryCardProps = {
  title: ReactNode;
  description: ReactNode;
  descriptionV2?: {
    blocknote?: string;
    markdown?: string | null;
  } | null;
  address?: ReactNode;
  date: string;
  loading: boolean;
  isMobile?: boolean;
};

export const StyledShowPageSummaryCard = styled.div<{
  isMobile: boolean;
}>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(2) : theme.spacing(3)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  box-sizing: border-box;
`;

const StyledAddressAndDateContainer = styled.div<{ isMobile: boolean }>`
  align-items: flex-start;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
  width: 100%;
`;

const StyledAddressContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledInfoContainer = styled.div<{ isMobile: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledDate = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTitle = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  max-width: 90%;
`;

const StyledDescription = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.secondary};
  word-break: break-word;
  line-height: 22px;
`;

// Styled components for rich text content
const StyledRichTextContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 200px; // Shorter for the card view
  overflow-y: auto;
  line-height: 1.5;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledFullRichTextContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  line-height: 1.5;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledParagraph = styled.p<{ textAlign?: string }>`
  margin: 0;
  padding: 0;
  text-align: ${({ textAlign }) => textAlign || 'left'};
`;

const StyledBold = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledAddress = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  word-break: break-word;
`;

const StyledShowMoreButton = styled(Button)`
  align-self: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledShowPageSummaryCardSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={250} height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs} />
      <Skeleton width={150} height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
      <Skeleton width={300} height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl} />
    </SkeletonTheme>
  );
};

// Maximum number of paragraphs to show in the summary card
const MAX_PARAGRAPHS_IN_SUMMARY = 6;

// Function to render BlockNote content as React components
const renderBlockNoteContent = (blocknoteJSON: string, fullView = false) => {
  try {
    const blocks: BlockNoteContent[] = JSON.parse(blocknoteJSON);

    // For summary view, limit the number of paragraphs
    const displayBlocks = fullView
      ? blocks
      : blocks.slice(0, MAX_PARAGRAPHS_IN_SUMMARY);
    const hasMoreContent =
      !fullView && blocks.length > MAX_PARAGRAPHS_IN_SUMMARY;

    const ContentContainer = fullView
      ? StyledFullRichTextContent
      : StyledRichTextContent;

    return (
      <ContentContainer>
        {displayBlocks.map((block) => {
          if (block.type === 'paragraph') {
            return (
              <StyledParagraph
                key={block.id}
                textAlign={block.props.textAlignment}
              >
                {block.content.map((contentItem, index) => {
                  if (contentItem.styles?.bold) {
                    return (
                      <StyledBold key={index}>{contentItem.text}</StyledBold>
                    );
                  }
                  return contentItem.text;
                })}
              </StyledParagraph>
            );
          }
          return null;
        })}
        {hasMoreContent && <StyledParagraph>...</StyledParagraph>}
      </ContentContainer>
    );
  } catch (error) {
    console.error('Error parsing BlockNote content:', error);
    return null;
  }
};

export const ShowPagePropertySummaryCard = ({
  date,
  title,
  description,
  descriptionV2,
  address,
  loading,
  isMobile = false,
}: ShowPagePropertySummaryCardProps) => {
  const { t } = useLingui();
  const beautifiedCreatedAt =
    date !== '' ? beautifyPastDateRelativeToNow(date) : '';
  const exactCreatedAt = date !== '' ? beautifyExactDateTime(date) : '';
  const dateElementId = `date-id-${uuidV4()}`;
  const theme = useTheme();
  const fullDescriptionModalRef = useRef<ModalRefType>(null);

  // Parse and render BlockNote content if available
  const renderedRichText = useMemo(() => {
    if (descriptionV2?.blocknote) {
      return renderBlockNoteContent(descriptionV2.blocknote);
    }
    return null;
  }, [descriptionV2?.blocknote]);

  // Check if we have content that's been truncated
  const hasMoreContent = useMemo(() => {
    if (descriptionV2?.blocknote) {
      try {
        const blocks: BlockNoteContent[] = JSON.parse(descriptionV2.blocknote);
        return blocks.length > MAX_PARAGRAPHS_IN_SUMMARY;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, [descriptionV2?.blocknote]);

  const handleShowFullDescription = () => {
    fullDescriptionModalRef.current?.open();
  };

  if (loading)
    return (
      <StyledShowPageSummaryCard isMobile={isMobile}>
        <StyledShowPageSummaryCardSkeletonLoader />
      </StyledShowPageSummaryCard>
    );

  return (
    <StyledShowPageSummaryCard isMobile={isMobile}>
      <StyledInfoContainer isMobile={isMobile}>
        <StyledAddressAndDateContainer isMobile={isMobile}>
          {address && (
            <StyledAddressContainer>
              <IconMap size={16} color={theme.font.color.secondary} />
              <StyledAddress isMobile={isMobile}>{address}</StyledAddress>
            </StyledAddressContainer>
          )}
          {beautifiedCreatedAt && (
            <StyledDate isMobile={isMobile} id={dateElementId}>
              Added {beautifiedCreatedAt}
            </StyledDate>
          )}
        </StyledAddressAndDateContainer>

        <StyledTitle isMobile={isMobile}>{title}</StyledTitle>

        {/* Display rich text content if available, otherwise fall back to plain description */}
        {renderedRichText || (
          <StyledDescription isMobile={isMobile}>
            {description}
          </StyledDescription>
        )}

        {/* Show 'See full description' button if we have more content */}
        {hasMoreContent && (
          <StyledShowMoreButton
            title={t`See full description`}
            variant="tertiary"
            onClick={handleShowFullDescription}
            Icon={IconArrowRight}
          />
        )}

        <Modal
          ref={fullDescriptionModalRef}
          size="large"
          portal
          onClose={() => {
            fullDescriptionModalRef.current?.close();
          }}
          isClosable
          closedOnMount
          hotkeyScope={ModalHotkeyScope.Default}
          padding="none"
        >
          <StyledModalHeader>
            <StyledModalTitleContainer>
              <IconFileText size={16} />
              <StyledModalTitle>
                <Trans>Property Description</Trans>
              </StyledModalTitle>
            </StyledModalTitleContainer>
            <StyledModalHeaderButtons>
              <Button
                variant="tertiary"
                title={t`Close`}
                onClick={() => fullDescriptionModalRef.current?.close()}
              />
            </StyledModalHeaderButtons>
          </StyledModalHeader>
          <StyledModalContent
            showScrollbar
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {descriptionV2?.blocknote ? (
              renderBlockNoteContent(descriptionV2.blocknote, true)
            ) : (
              <StyledFullRichTextContent>
                <StyledParagraph>{description}</StyledParagraph>
              </StyledFullRichTextContent>
            )}
          </StyledModalContent>
        </Modal>

        <AppTooltip
          anchorSelect={`#${dateElementId}`}
          content={exactCreatedAt}
          clickable
          noArrow
          place="right"
        />
      </StyledInfoContainer>
    </StyledShowPageSummaryCard>
  );
};
