import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import { H2 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { PROPERTY_DETAILS_STYLES } from '@/ui/layout/property-pdf/components/templates/default/pages/property-details-styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type PropertyDescriptionPageProps = DefaultDocumentationTemplateProps;

interface BlockContent {
  type: string;
  text: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

interface BlockNode {
  id: string;
  type: string;
  props: {
    textColor: string;
    backgroundColor: string;
    textAlignment: string;
  };
  content: BlockContent[];
  children: any[];
}

export const PropertyDescriptionPage = ({
  property,
  orientation,
  Footer,
  Header,
}: PropertyDescriptionPageProps) => {
  // Process rich text content
  const descriptionBlocks = useMemo(() => {
    if (!property.descriptionv2?.blocknote) {
      return [];
    }

    try {
      // Parse the blocknote JSON string
      const blocks = JSON.parse(
        property.descriptionv2.blocknote,
      ) as BlockNode[];
      return blocks;
    } catch (error) {
      console.error('Error parsing rich text:', error);
      return [];
    }
  }, [property.descriptionv2?.blocknote]);

  // Render a block based on its type and content
  const renderBlock = (
    block: BlockNode,
    index: number,
    totalBlocks: number,
  ) => {
    // Style for the last paragraph (no margin bottom)
    const isLastBlock = index === totalBlocks - 1;
    const paragraphStyle = isLastBlock
      ? PROPERTY_DETAILS_STYLES.descriptionParagraphLast
      : PROPERTY_DETAILS_STYLES.descriptionParagraph;

    // Handle different block types
    switch (block.type) {
      case 'paragraph':
        return (
          <Text key={block.id} style={paragraphStyle}>
            {block.content.map((contentItem, contentIndex) => {
              // Apply text styles
              const textStyle = {
                ...(contentItem.styles?.bold && {
                  fontWeight: 'bold' as const,
                }),
              };

              return (
                <Text key={`${block.id}-${contentIndex}`} style={textStyle}>
                  {contentItem.text}
                </Text>
              );
            })}
          </Text>
        );

      case 'bulletListItem':
        return (
          <Text key={block.id} style={paragraphStyle}>
            •{' '}
            {block.content.map((contentItem, contentIndex) => {
              // Apply text styles for list items
              const textStyle = {
                ...(contentItem.styles?.bold && {
                  fontWeight: 'bold' as const,
                }),
              };

              return (
                <Text key={`${block.id}-${contentIndex}`} style={textStyle}>
                  {contentItem.text}
                </Text>
              );
            })}
          </Text>
        );

      default:
        return null;
    }
  };

  // If no description, show a default message
  const hasDescription = descriptionBlocks.length > 0;

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Beschreibung"
      id="propertyDescription"
    >
      {Header && Header}
      <Section height="85%">
        <Row>
          <Col width="100%">
            <H2 style={{ marginBottom: 10 }}>Über die Liegenschaft</H2>

            <View style={PROPERTY_DETAILS_STYLES.detailsSection}>
              {/* Property description with blocks */}
              <View style={PROPERTY_DETAILS_STYLES.descriptionContainer}>
                {hasDescription ? (
                  descriptionBlocks.map((block, index) =>
                    renderBlock(block, index, descriptionBlocks.length),
                  )
                ) : (
                  <Text style={PROPERTY_DETAILS_STYLES.descriptionParagraph}>
                    Keine detaillierte Beschreibung verfügbar.
                  </Text>
                )}
              </View>
            </View>
          </Col>
        </Row>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
