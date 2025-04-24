import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { PROPERTY_DETAILS_STYLES } from '@/ui/layout/property-pdf/components/templates/default/pages/property-details-styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type PropertyDetailsPageProps = DefaultDocumentationTemplateProps;

// Define field types
type PropertyField = {
  key: string;
  label: string;
  value: string;
};

export const PropertyDetailsPage = ({
  property,
  propertyPrice,
  propertyAddress,
  orientation,
  fields,
  propertyFeatures = [],
  Footer,
}: PropertyDetailsPageProps) => {
  // Group fields into categories
  const groupedFields = useMemo(() => {
    // Define categories
    const groups: {
      primaryDetails: PropertyField[];
      financial: PropertyField[];
      measurements: PropertyField[];
      other: PropertyField[];
    } = {
      primaryDetails: [],
      financial: [],
      measurements: [],
      other: [],
    };

    // Primary details fields
    const primaryFields = [
      'category',
      'rooms',
      'floor',
      'constructionYear',
      'renovationYear',
      'offerType',
    ];

    // Financial fields
    const financialFields = ['sellingPrice', 'rentNet', 'rentExtra'];

    // Measurement fields
    const measurementFields = [
      'livingSurface',
      'usableSurface',
      'surface',
      'volume',
    ];

    // Categorize each field
    fields.forEach((field) => {
      if (field?.value && field?.label && field?.key) {
        const formattedField: PropertyField = {
          key: field.key,
          label: field.label,
          value: field.value,
        };

        if (
          typeof field.key === 'string' &&
          primaryFields.includes(field.key)
        ) {
          groups.primaryDetails.push(formattedField);
        } else if (
          typeof field.key === 'string' &&
          financialFields.includes(field.key)
        ) {
          groups.financial.push(formattedField);
        } else if (
          typeof field.key === 'string' &&
          measurementFields.includes(field.key)
        ) {
          groups.measurements.push(formattedField);
        } else {
          groups.other.push(formattedField);
        }
      }
    });

    return groups;
  }, [fields]);

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Über das Objekt"
      id="propertyDetails"
    >
      <Section height="85%">
        <Row>
          <Col width="100%">
            <H2 style={{ marginBottom: 12 }}>Liegenschaftsdaten</H2>

            {/* Primary Details Section */}
            <View style={PROPERTY_DETAILS_STYLES.detailsSection}>
              <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                Objektinformationen
              </H3>

              <View style={PROPERTY_DETAILS_STYLES.table}>
                {groupedFields.primaryDetails.map((field, index) => (
                  <View
                    key={field.key}
                    style={
                      index % 2 === 0
                        ? PROPERTY_DETAILS_STYLES.tableRow
                        : PROPERTY_DETAILS_STYLES.tableRowAlternate
                    }
                  >
                    <Text style={PROPERTY_DETAILS_STYLES.tableLabel}>
                      {field.label}
                    </Text>
                    <Text style={PROPERTY_DETAILS_STYLES.tableValue}>
                      {field.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Financial Details Section */}
            {groupedFields.financial.length > 0 && (
              <View style={PROPERTY_DETAILS_STYLES.detailsSection}>
                <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                  Preisangaben
                </H3>

                <View style={PROPERTY_DETAILS_STYLES.financialContainer}>
                  {groupedFields.financial.map((field) => (
                    <View
                      key={field.key}
                      style={PROPERTY_DETAILS_STYLES.financialRow}
                    >
                      <Text style={PROPERTY_DETAILS_STYLES.financialLabel}>
                        {field.label}
                      </Text>
                      <Text style={PROPERTY_DETAILS_STYLES.financialValue}>
                        {field.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Features Section */}
            {propertyFeatures.length > 0 && (
              <View style={PROPERTY_DETAILS_STYLES.detailsSection}>
                <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                  Ausstattung & Eigenschaften
                </H3>

                <View style={PROPERTY_DETAILS_STYLES.featuresContainer}>
                  {propertyFeatures.map((feature) => (
                    <View
                      key={feature.key}
                      style={PROPERTY_DETAILS_STYLES.featureItem}
                    >
                      <Text style={PROPERTY_DETAILS_STYLES.featureText}>
                        {feature.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Two-column layout for measurements and other details */}
            <View style={PROPERTY_DETAILS_STYLES.columns}>
              {/* Measurements Section */}
              {groupedFields.measurements.length > 0 && (
                <View style={PROPERTY_DETAILS_STYLES.column}>
                  <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                    Flächen & Masse
                  </H3>

                  <View style={PROPERTY_DETAILS_STYLES.table}>
                    {groupedFields.measurements.map((field, index) => (
                      <View
                        key={field.key}
                        style={
                          index % 2 === 0
                            ? PROPERTY_DETAILS_STYLES.tableRow
                            : PROPERTY_DETAILS_STYLES.tableRowAlternate
                        }
                      >
                        <Text style={PROPERTY_DETAILS_STYLES.tableLabel}>
                          {field.label}
                        </Text>
                        <Text style={PROPERTY_DETAILS_STYLES.tableValue}>
                          {field.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Other Details Section */}
              {groupedFields.other.length > 0 && (
                <View style={PROPERTY_DETAILS_STYLES.column}>
                  <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                    Weitere Informationen
                  </H3>

                  <View style={PROPERTY_DETAILS_STYLES.table}>
                    {groupedFields.other.map((field, index) => (
                      <View
                        key={field.key}
                        style={
                          index % 2 === 0
                            ? PROPERTY_DETAILS_STYLES.tableRow
                            : PROPERTY_DETAILS_STYLES.tableRowAlternate
                        }
                      >
                        <Text style={PROPERTY_DETAILS_STYLES.tableLabel}>
                          {field.label}
                        </Text>
                        <Text style={PROPERTY_DETAILS_STYLES.tableValue}>
                          {field.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Col>
        </Row>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
