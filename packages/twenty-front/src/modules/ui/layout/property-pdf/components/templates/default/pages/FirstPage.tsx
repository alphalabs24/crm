import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  H1,
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Image, Page, View } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type FirstPageProps = DefaultDocumentationTemplateProps;

export const FirstPage = ({
  property,
  propertyPrice,
  propertyAddress,
  orientation,
  propertyImages,
  showAddressMap,
  Footer,
}: FirstPageProps) => {
  const firstImage = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return null;
    return propertyImages[0];
  }, [propertyImages]);

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark={{ title: property.name, fit: true }}
    >
      <Section height="70%">
        <Image src={firstImage?.fullPath} style={PDF_STYLES.heroImage} />
      </Section>
      {/* Header Section with Property Title and Price */}
      <Section height="15%">
        <Row>
          <Col gap={0.5}>
            <H1>{property.name}</H1>
            <H2>{propertyPrice}</H2>
            {showAddressMap && <H3>{propertyAddress}</H3>}
          </Col>
        </Row>
      </Section>
      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
