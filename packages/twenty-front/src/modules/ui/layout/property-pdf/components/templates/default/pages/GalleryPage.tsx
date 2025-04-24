import { Attachment } from '@/activities/files/types/Attachment';
import { Section } from '@/ui/layout/property-pdf/components/snippets/layout';
import { H2 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Image, Page, Text, View } from '@react-pdf/renderer';

export type GalleryPageProps = Partial<DefaultDocumentationTemplateProps> & {
  pageIndex: number;
  imagesSubset: Array<Attachment>;
};

export const GalleryPage = ({
  orientation,
  imagesSubset,
  pageIndex,
  Footer,
}: GalleryPageProps) => {
  const galleryTitle = `Foto Gallerie ${pageIndex > 0 ? `(${pageIndex + 1})` : ''}`;

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark={pageIndex === 0 ? 'Bildergalerie' : galleryTitle}
      id={pageIndex === 0 ? 'gallery' : undefined}
    >
      {/* Gallery Title Section */}
      <Section height="10%">
        <H2 style={PDF_STYLES.galleryPageTitle}>{galleryTitle}</H2>
      </Section>

      {/* Gallery Grid Section */}
      <Section height="75%">
        <View style={PDF_STYLES.imageGalleryGrid}>
          {imagesSubset.map((image, index) => (
            <View key={index} style={PDF_STYLES.imageGalleryItem}>
              <Image
                src={image.fullPath}
                style={PDF_STYLES.imageGalleryImage}
                cache={true}
              />
              {image.name && (
                <Text style={PDF_STYLES.imageGalleryCaption}>
                  {image.description?.slice(0, 30) || image.name}
                </Text>
              )}
            </View>
          ))}
        </View>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
