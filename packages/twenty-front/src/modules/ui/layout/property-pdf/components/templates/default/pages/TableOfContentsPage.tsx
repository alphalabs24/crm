import { Section } from '@/ui/layout/property-pdf/components/snippets/layout';
import { H1 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Link, Page, Text, View } from '@react-pdf/renderer';

export type TableOfContentsPageProps =
  Partial<DefaultDocumentationTemplateProps> & {
    hasGallery: boolean;
    hasDescription?: boolean;
  };

export const TableOfContentsPage = ({
  property,
  orientation,
  Footer,
  hasGallery,
  hasDescription = false,
}: TableOfContentsPageProps) => {
  // Calculate page numbers based on what content is available
  const detailsPageNumber = 3; // First page + TOC page + 1
  const descriptionPageNumber = hasDescription ? detailsPageNumber + 1 : 0;
  const galleryPageNumber = hasGallery
    ? hasDescription
      ? (descriptionPageNumber as number) + 1
      : detailsPageNumber + 1
    : 0;

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
              <Text style={PDF_STYLES.tocItemText}>Liegenschaftsdaten</Text>
              <Text style={PDF_STYLES.tocItemPage}>{detailsPageNumber}</Text>
            </View>
          </Link>

          {hasDescription && (
            <Link src="#propertyDescription" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>
                  Über die Liegenschaft
                </Text>
                <Text style={PDF_STYLES.tocItemPage}>
                  {descriptionPageNumber}
                </Text>
              </View>
            </Link>
          )}

          {hasGallery && (
            <Link src="#gallery" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>Bildergalerie</Text>
                <Text style={PDF_STYLES.tocItemPage}>{galleryPageNumber}</Text>
              </View>
            </Link>
          )}
        </View>
      </Section>

      {Footer && Footer}
    </Page>
  );
};
