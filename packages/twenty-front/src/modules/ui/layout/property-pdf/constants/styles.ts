import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { LAYOUT } from '@/ui/layout/property-pdf/constants/layout';
import { StyleSheet } from '@react-pdf/renderer';
import { DEFAULT_THEME } from './defaultTheme';

// Create styles with improved layout system
export const PDF_STYLES = StyleSheet.create({
  // Document & Page Layout
  page: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.text.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    backgroundColor: DEFAULT_THEME.colors.background.main,
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.md,
  },

  // Full-width page with no padding (for flyers)
  flyerPage: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.text.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    backgroundColor: DEFAULT_THEME.colors.background.main,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    paddingBottom: FOOTER_HEIGHT + 10,
  },

  // Typography System
  heading1: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.xxl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
    color: DEFAULT_THEME.colors.textDark,
  },

  heading2: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.xl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
    color: DEFAULT_THEME.colors.textDark,
  },

  heading3: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.lg,
    color: DEFAULT_THEME.colors.textDark,
  },

  bodyText: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    lineHeight: 1.2,
    color: DEFAULT_THEME.colors.textLight,
    textAlign: 'justify',
    textOverflow: 'ellipsis',
  },

  heading1White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.xxl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
  },

  heading2White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.xl,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
  },

  heading3White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.lg,
  },

  // Flex Containers
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  spacer: {
    height: LAYOUT.spacing.sm,
  },

  spacerHorizontal: {
    paddingHorizontal: LAYOUT.spacing.xs,
  },

  // Grid System
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
    width: '100%',
  },

  gridItem: {
    flexBasis: `calc(50% - ${LAYOUT.spacing.sm}px)`,
    flexGrow: 0,
    flexShrink: 0,
  },

  // Section Layouts
  section: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    gap: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.md,
  },

  sectionFiller: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    width: '100%',
    height: '30%',
  },

  flyerHeroSection: {
    position: 'relative',
    width: '100%',
    height: '25%',
    display: 'flex',
    flexDirection: 'column',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: LAYOUT.spacing.sm,
    backgroundColor: DEFAULT_THEME.colors.overlayBackground,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.xxs,
  },

  // Feature Tags
  tagContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.xxs,
  },

  tag: {
    fontSize: DEFAULT_THEME.fonts.sizes.xs,
    padding: `${LAYOUT.spacing.xxs}px ${LAYOUT.spacing.xs}px`,
    backgroundColor: DEFAULT_THEME.colors.background.light,
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    color: DEFAULT_THEME.colors.text.secondary,
  },

  // Gallery
  gallery: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.xs,
  },

  galleryItem: {
    flexBasis: `calc(25% - ${(LAYOUT.spacing.xs * 3) / 4}px)`,
    aspectRatio: 4 / 3,
  },

  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  // Flyer-specific gallery
  flyerGallery: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    gap: LAYOUT.spacing.xs * 2,
    width: '100%',
  },

  flyerGalleryItem: {
    height: '100%',
    width: `calc(33% - ${LAYOUT.spacing.xs}px)`,
    marginBottom: LAYOUT.spacing.xs,
  },

  // Footer
  footer: {
    borderTop: `1pt solid ${DEFAULT_THEME.colors.divider}`,
    marginTop: 'auto',
    paddingTop: LAYOUT.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.xs,
    alignItems: 'center',
  },

  flyerFooter: {
    borderTop: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: LAYOUT.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.xxs,
    height: FOOTER_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  PropertyLabel: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
    color: DEFAULT_THEME.colors.textMedium,
    marginBottom: 2,
  },

  PropertyValue: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textDark,
  },

  // Flyer Specific Styles
  flyerLayout: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100%',
  },

  flyerContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.sm,
    flexGrow: 1,
    height: '65%',
  },

  flyerMainContent: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },

  flyerSidebar: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.xs,
    padding: LAYOUT.spacing.sm,
    backgroundColor: DEFAULT_THEME.colors.background.light,
    borderRadius: DEFAULT_THEME.borders.radius.md,
    maxWidth: '40%',
    justifyContent: 'space-between',
  },

  flyerImageContainer: {
    height: '60%',
    marginTop: LAYOUT.spacing.sm,
  },

  flyerContactInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.xs,
    marginTop: 'auto',
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    backgroundColor: DEFAULT_THEME.colors.background.light,
  },

  flyerContactColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: LAYOUT.spacing.xxs,
  },

  // Utility Classes
  textCenter: { textAlign: 'center' },
  textBold: { fontWeight: DEFAULT_THEME.fonts.weights.bold },
  mt: { marginTop: 'auto' },
  mb: { marginBottom: 'auto' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flexGrow: { flexGrow: 1 },
  contentPadding: { padding: LAYOUT.spacing.sm },
});
