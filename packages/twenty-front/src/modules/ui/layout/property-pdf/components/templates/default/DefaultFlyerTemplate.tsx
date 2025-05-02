import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  Body,
  H1,
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { PropertyPdfProps } from '@/ui/layout/property-pdf/types/types';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type DefaultFlyerTemplateProps = PropertyPdfProps & {
  // Add publisher configuration options
  showPublisherBranding?: boolean;
  showPublisherEmail?: boolean;
  showPublisherPhone?: boolean;
};

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
  truncated?: boolean;
  truncateAt?: number;
}

export const DefaultFlyerTemplate = ({
  property,
  propertyPrice,
  propertyAddress,
  propertyImages,
  agencyLogo,
  orientation,
  fields,
  propertyFeatures,
  configuration,
  localizedStaticTexts,
}: DefaultFlyerTemplateProps) => {
  const firstImage = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return null;
    return propertyImages[0];
  }, [propertyImages]);

  const additionalImages = useMemo(() => {
    if (!configuration?.showAllImages) return [];
    if (!propertyImages || propertyImages.length === 0) return [];
    return propertyImages.slice(1, 5);
  }, [configuration?.showAllImages, propertyImages]);

  const featuresForDisplay = useMemo(() => {
    if (!propertyFeatures || propertyFeatures.length === 0) return [];
    return propertyFeatures.slice(0, 6);
  }, [propertyFeatures]);

  const extraFeaturesCount = useMemo(() => {
    if (!propertyFeatures || propertyFeatures.length <= 6) return 0;
    return propertyFeatures.length - 6;
  }, [propertyFeatures]);

  // Process rich text content
  const descriptionBlocks = useMemo(() => {
    if (!property.descriptionV2?.blocknote) {
      return [];
    }

    try {
      // Parse the blocknote JSON string
      const blocks = JSON.parse(
        property.descriptionV2.blocknote,
      ) as BlockNode[];
      return blocks;
    } catch (error) {
      console.error('Error parsing rich text:', error);
      return [];
    }
  }, [property.descriptionV2?.blocknote]);

  // Extract blocks to display based on total character count limit
  const visibleBlocks = useMemo(() => {
    const MAX_CHARS = 750;
    let totalChars = 0;
    const blocksToShow = [];

    for (const block of descriptionBlocks) {
      // For empty paragraphs, add them as line breaks but count them as 1 character
      if (
        block.type === 'paragraph' &&
        (!block.content || block.content.length === 0)
      ) {
        // If adding this empty paragraph would exceed the limit, stop
        if (totalChars + 1 > MAX_CHARS) {
          break;
        }

        // Add the empty paragraph and count it as 1 character
        blocksToShow.push(block);
        totalChars += 1;
        continue;
      }

      // For non-empty blocks, calculate text length including prefix
      const prefix = block.type === 'bulletListItem' ? '• ' : '';
      const blockText =
        prefix + (block.content?.map((item) => item.text).join('') || '');
      const blockLength = blockText.length;

      // If this block would exceed the limit, stop adding blocks
      if (totalChars + blockLength > MAX_CHARS) {
        // If we're close to the limit and this is the first block, include a truncated version
        if (blocksToShow.length === 0) {
          const remainingChars = MAX_CHARS - totalChars;
          if (remainingChars > 20) {
            // Only if we can show a meaningful amount
            blocksToShow.push({
              ...block,
              truncated: true,
              truncateAt: remainingChars - 3, // Account for ellipsis
            });
          }
        }
        break;
      }

      // Otherwise add the block and update character count
      blocksToShow.push(block);
      totalChars += blockLength;

      // Add newline character count for each block except the first
      if (blocksToShow.length > 1) {
        totalChars += 1; // Count for the newline between blocks
      }
    }

    return blocksToShow;
  }, [descriptionBlocks]);

  // Check if we need to show ellipsis (if there are more blocks than we're showing)
  const showEllipsis =
    visibleBlocks.length <
    descriptionBlocks.filter(
      (block) => block.content && block.content.length > 0,
    ).length;

  // Determine if we need to show the footer based on publisher settings
  const shouldShowFooter =
    configuration?.showPublisherBranding ||
    configuration?.showPublisherEmail ||
    configuration?.showPublisherPhone;

  // Adjust content height based on footer visibility
  const contentHeight = shouldShowFooter ? '30%' : '36%';

  return (
    <Page style={PDF_STYLES.flyerPage} orientation={orientation}>
      <Section height="14%">
        <Row>
          <Col width="90%" gap={0.5}>
            <H1>{property.name}</H1>
            <H2>{propertyPrice}</H2>
            <H3>{propertyAddress}</H3>
          </Col>
          {configuration?.showPublisherBranding && agencyLogo && (
            <Col width="10%">
              <View style={PDF_STYLES.agencyLogoContainer}>
                <Image src={agencyLogo} style={PDF_STYLES.agencyLogo} />
              </View>
            </Col>
          )}
        </Row>
      </Section>

      <Section height="50%">
        <Image src={firstImage?.fullPath} style={PDF_STYLES.heroImage} />
        <Row height="auto" style={PDF_STYLES.flyerGallery}>
          {additionalImages.map((image, index) => (
            <Col key={index} width="33%" style={PDF_STYLES.flyerGalleryItem}>
              <Image src={image?.fullPath} style={PDF_STYLES.galleryImage} />
            </Col>
          ))}
        </Row>
      </Section>

      <Section height={contentHeight}>
        <Row gap={4}>
          <Col width="66%">
            <H1 uppercase>
              {localizedStaticTexts?.descriptionTitle || 'Über das Objekt'}
            </H1>
            {visibleBlocks.length > 0 && (
              <View>
                {visibleBlocks.map((block, blockIndex) => {
                  // Handle empty paragraph blocks (line breaks)
                  if (
                    block.type === 'paragraph' &&
                    (!block.content || block.content.length === 0)
                  ) {
                    return <Body key={blockIndex}>&nbsp;</Body>;
                  }

                  // For bullet lists, add a bullet point
                  const prefix = block.type === 'bulletListItem' ? '• ' : '';

                  return (
                    <Body key={blockIndex}>
                      {prefix}
                      {block.truncated
                        ? block.content.map((contentItem, contentIndex) => {
                            // Truncate the last content item if needed
                            if (contentIndex === block.content.length - 1) {
                              const truncateAt = block.truncateAt || 0;
                              const truncatedText =
                                contentItem.text.substring(
                                  0,
                                  truncateAt -
                                    (prefix.length +
                                      block.content
                                        .slice(0, contentIndex)
                                        .reduce(
                                          (sum, item) => sum + item.text.length,
                                          0,
                                        )),
                                ) + '...';

                              return (
                                <Text
                                  key={`content-${contentIndex}`}
                                  style={{
                                    ...(contentItem.styles?.bold && {
                                      fontWeight: 'bold' as const,
                                    }),
                                  }}
                                >
                                  {truncatedText}
                                </Text>
                              );
                            }

                            // Non-truncated content items
                            return (
                              <Text
                                key={`content-${contentIndex}`}
                                style={{
                                  ...(contentItem.styles?.bold && {
                                    fontWeight: 'bold' as const,
                                  }),
                                }}
                              >
                                {contentItem.text}
                              </Text>
                            );
                          })
                        : block.content.map((contentItem, contentIndex) => (
                            <Text
                              key={`content-${contentIndex}`}
                              style={{
                                ...(contentItem.styles?.bold && {
                                  fontWeight: 'bold' as const,
                                }),
                              }}
                            >
                              {contentItem.text}
                            </Text>
                          ))}
                    </Body>
                  );
                })}
                {showEllipsis &&
                  !visibleBlocks[visibleBlocks.length - 1]?.truncated && (
                    <Body>...</Body>
                  )}
              </View>
            )}
            <View style={PDF_STYLES.tagContainer}>
              {featuresForDisplay.map((feature, index) => (
                <Text key={index} style={PDF_STYLES.tag}>
                  {feature.label}
                </Text>
              ))}
              {extraFeaturesCount > 0 && (
                <Text style={PDF_STYLES.tag}>+{extraFeaturesCount}</Text>
              )}
            </View>
          </Col>
          <Col width="33%">
            <H2 uppercase>
              {localizedStaticTexts?.fieldsTitle || 'Eigenschaften'}
            </H2>
            {fields.map(
              (field) =>
                field.label &&
                field.value && (
                  <View key={field.label}>
                    <Text style={PDF_STYLES.PropertyLabel}>{field.label}</Text>
                    <Text style={PDF_STYLES.PropertyValue}>{field.value}</Text>
                  </View>
                ),
            )}
          </Col>
        </Row>
      </Section>

      {shouldShowFooter && (
        <Section height={FOOTER_HEIGHT} style={PDF_STYLES.flyerFooter}>
          <Row gap={2}>
            {configuration?.showPublisherBranding && agencyLogo && (
              <Col width="33%">
                <Row style={{ alignItems: 'center' }}>
                  <View style={{ aspectRatio: 1, height: '100%' }}>
                    <Image
                      src={agencyLogo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </View>
                  <H3>{property?.agency?.name}</H3>
                </Row>
              </Col>
            )}

            <Col
              width={
                configuration?.showPublisherBranding &&
                configuration?.showPublisherEmail
                  ? '33%'
                  : configuration?.showPublisherBranding ||
                      configuration?.showPublisherEmail
                    ? '67%'
                    : '100%'
              }
              style={{ justifyContent: 'center' }}
            >
              {configuration?.showPublisherPhone &&
                property?.agency?.phone?.primaryPhone && (
                  <H2 align="center">
                    {property?.agency?.phone?.primaryPhone}
                  </H2>
                )}
            </Col>

            {configuration?.showPublisherEmail &&
              property?.agency?.email?.primaryEmail && (
                <Col
                  width={
                    configuration?.showPublisherBranding &&
                    configuration?.showPublisherPhone
                      ? '33%'
                      : configuration?.showPublisherBranding ||
                          configuration?.showPublisherPhone
                        ? '67%'
                        : '100%'
                  }
                  style={{ justifyContent: 'center' }}
                >
                  <Body align="right">
                    {property?.agency?.email?.primaryEmail}
                  </Body>
                </Col>
              )}
          </Row>
        </Section>
      )}
    </Page>
  );
};
