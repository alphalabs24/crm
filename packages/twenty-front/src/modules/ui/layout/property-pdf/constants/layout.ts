// Layout constants for better maintainability
export const LAYOUT = {
  spacing: {
    unit: 8, // Base spacing unit in points
    get xxs() {
      return this.unit * 0.25;
    },
    get xs() {
      return this.unit * 0.5;
    },
    get sm() {
      return this.unit;
    },
    get md() {
      return this.unit * 1.5;
    },
    get lg() {
      return this.unit * 2;
    },
    get xl() {
      return this.unit * 3;
    },
    get xxl() {
      return this.unit * 4;
    },
  },
  aspectRatios: {
    hero: 2.5, // Hero image aspect ratio
    thumbnail: 1.5, // Thumbnail aspect ratio
    gallery: 1.33, // Gallery image aspect ratio
  },
  columns: {
    gap: 24, // Gap between columns
    count: 2, // Number of columns in grid layouts
  },
};
