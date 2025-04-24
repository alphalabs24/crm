import { Section } from '@/ui/layout/property-pdf/components/snippets/layout';
import { H1 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Link, Page, Text, View } from '@react-pdf/renderer';

export type TableOfContentsPageProps =
  Partial<DefaultDocumentationTemplateProps> & {
    hasGallery: boolean;
  };

export const TableOfContentsPage = ({
  property,
  orientation,
  Footer,
  hasGallery,
}: TableOfContentsPageProps) => {
  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Inhaltsverzeichnis"
    >
      <Section height="75%">
        <H1 style={{ marginBottom: 10 }}>Inhaltsverzeichnis</H1>

        <View style={PDF_STYLES.tocContainer}>
          <Link src="#propertyDetails" style={PDF_STYLES.tocLink}>
            <View style={PDF_STYLES.tocItem}>
              <Text style={PDF_STYLES.tocItemText}>Über das Objekt</Text>
              <Text style={PDF_STYLES.tocItemPage}>3</Text>
            </View>
          </Link>

          {hasGallery && (
            <Link src="#gallery" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>Bildergalerie</Text>
                <Text style={PDF_STYLES.tocItemPage}>4</Text>
              </View>
            </Link>
          )}
        </View>
      </Section>

      {Footer && Footer}
    </Page>
  );
};
