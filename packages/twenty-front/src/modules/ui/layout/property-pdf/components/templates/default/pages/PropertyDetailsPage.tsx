import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import { H2 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View } from '@react-pdf/renderer';

export type PropertyDetailsPageProps = DefaultDocumentationTemplateProps;

export const PropertyDetailsPage = ({
  property,
  orientation,
  fields,
  Footer,
  propertyFeatures,
}: PropertyDetailsPageProps) => {
  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Über das Objekt"
      id="propertyDetails"
    >
      {/* Main Content Section */}
      <Section height="75%">
        <Row>
          <Col width="100%">
            <H2 uppercase>Property Details</H2>
            {fields.map(
              (field) =>
                field.label &&
                field.value && (
                  <View key={field.key} style={{ marginBottom: 8 }}>
                    <Text style={PDF_STYLES.PropertyLabel}>{field.label}</Text>
                    <Text style={PDF_STYLES.PropertyValue}>{field.value}</Text>
                  </View>
                ),
            )}
          </Col>
        </Row>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
