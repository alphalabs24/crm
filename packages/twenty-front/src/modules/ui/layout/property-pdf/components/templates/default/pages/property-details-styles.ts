import { DEFAULT_THEME } from '@/ui/layout/property-pdf/constants/defaultTheme';
import { StyleSheet } from '@react-pdf/renderer';

export const PROPERTY_DETAILS_STYLES = StyleSheet.create({
  // Section containers
  detailsSection: {
    marginBottom: DEFAULT_THEME.spacing.md,
  },

  sectionTitle: {
    fontSize: DEFAULT_THEME.fonts.sizes.md,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
    color: DEFAULT_THEME.colors.textDark,
    paddingBottom: DEFAULT_THEME.spacing.xs,
    marginBottom: DEFAULT_THEME.spacing.sm,
    borderBottom: `1pt solid ${DEFAULT_THEME.colors.divider}`,
  },

  // Tables
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: DEFAULT_THEME.spacing.md,
  },

  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: DEFAULT_THEME.spacing.xs,
    borderBottom: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
  },

  tableRowAlternate: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: DEFAULT_THEME.spacing.xs,
    borderBottom: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
    backgroundColor: DEFAULT_THEME.colors.background.light,
  },

  tableLabel: {
    width: '40%',
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textMedium,
    paddingRight: DEFAULT_THEME.spacing.sm,
  },

  tableValue: {
    width: '60%',
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textDark,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
  },

  // Features grid
  featuresContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DEFAULT_THEME.spacing.sm,
    marginTop: DEFAULT_THEME.spacing.sm,
  },

  featureItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: DEFAULT_THEME.spacing.xs,
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    backgroundColor: DEFAULT_THEME.colors.background.light,
    width: 'auto',
    marginBottom: DEFAULT_THEME.spacing.xs,
  },

  featureText: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textDark,
  },

  // Financial highlights
  financialContainer: {
    backgroundColor: DEFAULT_THEME.colors.background.light,
    padding: DEFAULT_THEME.spacing.md,
    marginBottom: DEFAULT_THEME.spacing.md,
  },

  financialRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DEFAULT_THEME.spacing.xs,
    borderBottom: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
  },

  financialLabel: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textMedium,
  },

  financialValue: {
    fontSize: DEFAULT_THEME.fonts.sizes.md,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
    color: DEFAULT_THEME.colors.primary,
  },

  // Two-column layout
  columns: {
    display: 'flex',
    flexDirection: 'row',
    gap: DEFAULT_THEME.spacing.md,
  },

  column: {
    flex: 1,
  },

  // Description styles
  descriptionContainer: {
    backgroundColor: DEFAULT_THEME.colors.background.light,
    padding: DEFAULT_THEME.spacing.md,
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    marginTop: DEFAULT_THEME.spacing.sm,
  },

  descriptionParagraph: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    lineHeight: 1.5,
    marginBottom: DEFAULT_THEME.spacing.sm,
  },

  descriptionParagraphLast: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    lineHeight: 1.5,
    marginBottom: 0,
  },

  // Map styles
  mapContainer: {
    width: '100%',
    height: 200,
    marginTop: DEFAULT_THEME.spacing.sm,
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    overflow: 'hidden',
  },

  mapImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});
