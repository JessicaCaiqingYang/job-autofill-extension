import type { ValueOrUpdateType } from './base/index.js';

export type BaseStorageType<D> = {
  get: () => Promise<D>;
  set: (value: ValueOrUpdateType<D>) => Promise<void>;
  getSnapshot: () => D | null;
  subscribe: (listener: () => void) => () => void;
};

// Job Application Types
export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  workInfo: {
    currentTitle: string;
    experience: string;
    skills: string[];
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
  };
  preferences: {
    desiredSalary: string;
    availableStartDate: string;
    workAuthorization: string;
    willingToRelocate: boolean;
  };
}

export interface SiteConfig {
  domain: string;
  fieldMappings: Record<string, string>;
  customSelectors: Record<string, string>;
  enabled: boolean;
}

export type UserProfileStorageType = BaseStorageType<UserProfile>;
export type SiteConfigsStorageType = BaseStorageType<Record<string, SiteConfig>>;
