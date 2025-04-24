import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import { H2 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { PROPERTY_DETAILS_STYLES } from '@/ui/layout/property-pdf/components/templates/default/pages/property-details-styles';
import { DEFAULT_THEME } from '@/ui/layout/property-pdf/constants/defaultTheme';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View } from '@react-pdf/renderer';

export type PropertyDescriptionPageProps = DefaultDocumentationTemplateProps;

export const PropertyDescriptionPage = ({
  property,
  orientation,
  Footer,
}: PropertyDescriptionPageProps) => {
  // Default text if no description is available
  const description = property.description || 'Keine Beschreibung verfügbar';
  const paragraphs = description
    .split('\n')
    .filter((p: string) => p.trim().length > 0);

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Beschreibung"
      id="propertyDescription"
    >
      <Section height="85%">
        <Row>
          <Col width="100%">
            <H2 style={{ marginBottom: 20 }}>Über die Liegenschaft</H2>

            <View style={PROPERTY_DETAILS_STYLES.detailsSection}>
              {/* Property description with paragraphs */}
              <View style={PROPERTY_DETAILS_STYLES.descriptionContainer}>
                {paragraphs.map((paragraph: string, index: number) => (
                  <Text
                    key={index}
                    style={
                      index < paragraphs.length - 1
                        ? PROPERTY_DETAILS_STYLES.descriptionParagraph
                        : PROPERTY_DETAILS_STYLES.descriptionParagraphLast
                    }
                  >
                    {paragraph}
                  </Text>
                ))}

                {/* If no paragraphs, show a default message */}
                {paragraphs.length === 0 && (
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
