import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  Body,
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Image, View } from '@react-pdf/renderer';

export type FooterProps = Partial<DefaultDocumentationTemplateProps>;

export const Footer = ({
  property,
  showPublisherBranding,
  showPublisherEmail,
  showPublisherPhone,
}: FooterProps) => {
  return (
    // fixed will repeat the footer on each page if the page wraps
    <Section height={FOOTER_HEIGHT} style={PDF_STYLES.footer} fixed>
      <Row gap={2}>
        {showPublisherBranding && (
          <Col width="33%">
            <Row style={{ alignItems: 'center' }}>
              <View style={{ aspectRatio: 1, height: '100%' }}>
                <Image
                  src={'/logos/nestermind-logo.png'}
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
            showPublisherBranding && showPublisherEmail
              ? '30%'
              : showPublisherBranding || showPublisherEmail
                ? '67%'
                : '100%'
          }
          style={{ justifyContent: 'center' }}
        >
          {showPublisherPhone && property?.agency?.phone?.primaryPhone && (
            <H2 align="center">{property?.agency?.phone?.primaryPhone}</H2>
          )}
        </Col>

        <Col
          style={{ justifyContent: 'center' }}
          width={
            showPublisherBranding && showPublisherPhone
              ? '30%'
              : showPublisherBranding || showPublisherPhone
                ? '67%'
                : '100%'
          }
        >
          {showPublisherEmail && property?.agency?.email?.primaryEmail && (
            <Body align="right">{property?.agency?.email?.primaryEmail}</Body>
          )}
        </Col>

        <Col
          style={{ justifyContent: 'center' }}
          width="3%"
          render={(props) => <Body>{props.pageNumber}</Body>}
        />
      </Row>
    </Section>
  );
};
