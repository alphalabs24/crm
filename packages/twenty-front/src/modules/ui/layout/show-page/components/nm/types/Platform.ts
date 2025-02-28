export type PlatformType = 'social_media' | 'real_estate' | 'smart_listing';

// TODO adapt these to the actual values
export enum PlatformId {
  SocialMedia = 'Social Media',
  SwissMarketplaceGroup = 'Swiss Marketplace Group (SMG)',
  Newhome = 'NEWHOME',
  SmartListing = 'Smart Listing',
}

export type Platform = {
  type: PlatformType;
  name: string;
  description: string;
  logo?: string;
  isConnected?: boolean;
  accountName?: string;
  isNew?: boolean;
  isBeta?: boolean;
};

export const PLATFORMS: { [key in PlatformId]: Platform } = {
  [PlatformId.Newhome]: {
    type: 'real_estate',
    name: 'Newhome',
    description: 'List your property conveniently to newhome.ch.',
    isNew: true,
    logo: '/logos/newhome.png',
  },
  [PlatformId.SocialMedia]: {
    type: 'social_media',
    name: 'Social Media Platforms',
    description:
      'Maximum reach through social media! Advertise your property directly on Facebook and Instagram. Create targeted ads and track performance in real-time.',

    isConnected: true,
    logo: '/logos/socials.png',
    accountName: '@nester.mind',
    isBeta: true,
  },
  [PlatformId.SwissMarketplaceGroup]: {
    type: 'real_estate',
    name: 'Swiss Marketplace Group',
    logo: '/logos/smg.png',
    description:
      'This includes the following platforms: ImmoScout24, Homegate, and more.',
    isBeta: true,
  },

  [PlatformId.SmartListing]: {
    type: 'smart_listing',
    name: 'Smart Listing',
    description:
      'Compare and publish: Send your property to Comparis to gain greater visibility. Use market analysis to optimize your pricing strategy.',
    isBeta: true,
  },
};
