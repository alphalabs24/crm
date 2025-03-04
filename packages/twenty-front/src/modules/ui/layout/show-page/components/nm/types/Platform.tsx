import { Trans } from '@lingui/react/macro';

export type PlatformType = 'social_media' | 'real_estate' | 'smart_listing';

// TODO adapt these to the actual values
export enum PlatformId {
  SocialMedia = 'Social Media',
  SwissMarketplaceGroup = 'Swiss Marketplace Group (SMG)',
  Newhome = 'NEWHOME',
  ImmoScout = 'ImmoScout',
  Homegate = 'Homegate',
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  Comparis = 'Comparis',
  Flatfox = 'Flatfox',
  SmartListing = 'Smart Listing',
}

export type Platform = {
  type: PlatformType;
  name: string;
  description: React.ReactNode;
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
    description: <Trans>List your property conveniently to newhome.ch.</Trans>,
    isNew: true,
    logo: '/logos/newhome.png',
  },
  [PlatformId.SocialMedia]: {
    type: 'social_media',
    name: 'Social Media Platforms',
    description: (
      <Trans>
        Maximum reach through social media! Advertise your property directly on
        Facebook and Instagram. Create targeted ads and track performance in
        real-time.
      </Trans>
    ),

    isConnected: true,
    logo: '/logos/socials.png',
    accountName: '@nester.mind',
    isBeta: true,
  },
  [PlatformId.SwissMarketplaceGroup]: {
    type: 'real_estate',
    name: 'Swiss Marketplace Group',
    logo: '/logos/smg.png',
    description: (
      <Trans>
        This includes the following platforms: ImmoScout24, Homegate, and more.
      </Trans>
    ),
    isBeta: true,
  },

  [PlatformId.SmartListing]: {
    type: 'smart_listing',
    name: 'Smart Listing',
    description: (
      <Trans>
        Personalized listing for your property. Get more visibility and better
        reach with a tailored listing.
      </Trans>
    ),
    isBeta: true,
  },
  [PlatformId.ImmoScout]: {
    type: 'real_estate',
    name: 'ImmoScout24',
    description: <Trans>List your property on ImmoScout24.</Trans>,
    isBeta: true,
  },
  [PlatformId.Homegate]: {
    type: 'real_estate',
    name: 'Homegate',
    description: <Trans>List your property on Homegate.</Trans>,
    isBeta: true,
  },
  [PlatformId.Instagram]: {
    type: 'social_media',
    name: 'Instagram',
    description: <Trans>List your property on Instagram.</Trans>,
    isBeta: true,
  },
  [PlatformId.Facebook]: {
    type: 'social_media',
    name: 'Facebook',
    description: <Trans>List your property on Facebook.</Trans>,
    isBeta: true,
  },
  [PlatformId.Comparis]: {
    type: 'real_estate',
    name: 'Comparis',
    description: <Trans>List your property on Comparis.</Trans>,
    isBeta: true,
  },
  [PlatformId.Flatfox]: {
    type: 'real_estate',
    name: 'Flatfox',
    description: <Trans>List your property on Flatfox.</Trans>,
    isBeta: true,
  },
};
