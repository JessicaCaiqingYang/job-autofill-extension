import { createStorage, StorageEnum } from '../base/index.js';
import type { UserProfile, SiteConfig, UserProfileStorageType, SiteConfigsStorageType } from '../types.js';

// User Profile Storage
const userProfileStorage = createStorage<UserProfile>(
  'job-autofill-user-profile',
  {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    workInfo: {
      currentTitle: '',
      experience: '',
      skills: [],
      linkedinUrl: '',
      portfolioUrl: '',
      githubUrl: '',
    },
    preferences: {
      desiredSalary: '',
      availableStartDate: '',
      workAuthorization: '',
      willingToRelocate: false,
    },
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// Site Configurations Storage
const siteConfigsStorage = createStorage<Record<string, SiteConfig>>(
  'job-autofill-site-configs',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const userProfile: UserProfileStorageType = userProfileStorage;
export const siteConfigs: SiteConfigsStorageType = siteConfigsStorage;