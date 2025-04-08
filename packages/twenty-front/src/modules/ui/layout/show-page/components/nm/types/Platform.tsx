import { AgencyCredential } from '@/publishers/components/modals/EditPublisherModal';
import { Trans } from '@lingui/react/macro';
import { ColorScheme } from 'twenty-ui';

export type PlatformType = 'social_media' | 'real_estate' | 'smart_listing';

// TODO adapt these to the actual values
export enum PlatformId {
  SocialMedia = 'SOCIAL MEDIA',
  SwissMarketplaceGroup = 'SMG',
  Newhome = 'NEWHOME',
  ImmoScout = 'IMMOSCOUT',
  Homegate = 'HOMEGATE',
  Instagram = 'INSTAGRAM',
  Facebook = 'FACEBOOK',
  Comparis = 'COMPARIS',
  Flatfox = 'FLATFOX',
  SmartListing = 'SMART LISTING',
}

export type PublishablePlatforms =
  | PlatformId.SwissMarketplaceGroup
  | PlatformId.Newhome
  | PlatformId.Comparis;

export const PUBLISHABLE_PLATFORMS = [
  PlatformId.SwissMarketplaceGroup,
  PlatformId.Newhome,
  PlatformId.Comparis,
];

export type PlatformField = {
  name: string;
  helpText?: React.ReactNode;
  action?: () => void;
  type?: 'text' | 'password';
};

export type PlatformLocaleKey = 'en' | 'de-DE' | 'fr-FR' | 'it-IT';
export type PlatformLogo = {
  [key in PlatformLocaleKey]?: {
    [key in ColorScheme]?: string;
  };
};

export type Platform = {
  type: PlatformType;
  name: string;
  description: React.ReactNode;
  logo?: PlatformLogo;
  isConnected?: boolean;
  accountName?: string;
  isNew?: boolean;
  isBeta?: boolean;
  backgroundColor?: string;
  fieldsOnAgency?: PlatformField[];
  getOfferListLink?: (credential: AgencyCredential) => string | null;
};

export const PLATFORMS: { [key in PlatformId]: Platform } = {
  [PlatformId.Newhome]: {
    type: 'real_estate',
    name: 'Newhome',
    description: <Trans>List your property conveniently to newhome.ch.</Trans>,
    isNew: true,
    // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
    backgroundColor: '#97DDD2',
    logo: {
      en: {
        Dark: '/logos/newhome/newhome_dark_EN.png',
        Light: '/logos/newhome/newhome_EN.png',
      },
      'de-DE': {
        Dark: '/logos/newhome/newhome_dark_DE.png',
        Light: '/logos/newhome/newhome_DE.png',
      },
      'fr-FR': {
        Dark: '/logos/newhome/newhome_dark_FR.png',
        Light: '/logos/newhome/newhome_FR.png',
      },
      'it-IT': {
        Dark: '/logos/newhome/newhome_dark_IT.png',
        Light: '/logos/newhome/newhome_IT.png',
      },
    },
    fieldsOnAgency: [
      {
        name: 'username',
        helpText: (
          <Trans>
            Your FTP username can be found under "Import interfaces" on
            MyNewhome.
          </Trans>
        ),
      },
      {
        name: 'password',
        helpText: (
          <Trans>
            Your FTP password can be found under "Import interfaces" on
            MyNewhome.
          </Trans>
        ),
        type: 'password',
      },
      {
        name: 'partnerId',
        helpText: (
          <Trans>
            Your Partner ID is displayed in your MyNewhome dashboard under
            "Integration of ads on your own website" under Short name.
          </Trans>
        ),
      },
    ],
    getOfferListLink: (credential: AgencyCredential) =>
      credential.partnerId
        ? `https://test.newhome.ch/partner/${credential.partnerId}.aspx`
        : null,
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
    logo: {
      en: {
        Dark: '/logos/socials.png',
        Light: '/logos/socials.png',
      },
    },
    accountName: '@nester.mind',
    isBeta: true,
  },
  [PlatformId.SwissMarketplaceGroup]: {
    type: 'real_estate',
    name: 'Swiss Marketplace Group',
    logo: {
      en: {
        Dark: '/logos/smg.png',
        Light: '/logos/smg.png',
      },
    },
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
    isNew: true,
    logo: {
      en: {
        Dark: '/logos/comparis.png',
        Light: '/logos/comparis.png',
      },
    },
    fieldsOnAgency: [
      {
        name: 'username',
        helpText: (
          <Trans>
            Your FTP username can be found under "Import interfaces" on
            Comparis.
          </Trans>
        ),
      },
      {
        name: 'password',
        helpText: (
          <Trans>
            Your FTP password can be found under "Import interfaces" on
            Comparis.
          </Trans>
        ),
        type: 'password',
      },
      {
        name: 'platformAgencyId',
        helpText: <Trans>Your Agencie's ID on Comparis.</Trans>,
      },
    ],
  },
  [PlatformId.Flatfox]: {
    type: 'real_estate',
    name: 'Flatfox',
    description: <Trans>List your property on Flatfox.</Trans>,
    isBeta: true,
  },
};
