import { storage } from '@extension/storage';

/** ---------------------- Shared Types ---------------------- **/

// Types for job application data
interface UserProfile {
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

interface SiteConfig {
  domain: string;
  fieldMappings: Record<string, string>;
  customSelectors: Record<string, string>;
  enabled: boolean;
}

type FormValue = string | number | boolean;
type FormDataMap = Record<string, FormValue>;

type Success<T = unknown> = { success: true } & T;
type Failure = { success: false; error: string };
type ApiResponse<T = unknown> = Success<T> | Failure;

type Resp<T = unknown> = (response: ApiResponse<T>) => void;

/** Runtime messages */
type RuntimeMessage =
  | { type: 'GET_USER_PROFILE' }
  | { type: 'UPDATE_USER_PROFILE'; profile: UserProfile }
  | { type: 'GET_SITE_CONFIG'; domain: string }
  | { type: 'UPDATE_SITE_CONFIG'; config: SiteConfig }
  | { type: 'AUTOFILL_FORM'; data: FormDataMap }
  | { type: 'DETECT_FORMS' };

/** ---------------------- Install Init ---------------------- **/

chrome.runtime.onInstalled.addListener(async details => {
  console.log('Job Application Autofill Extension installed:', details.reason);

  // Initialize default user profile if not exists
  const existingProfile = await storage.userProfile.get();
  if (!existingProfile) {
    const defaultProfile: UserProfile = {
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
    };
    await storage.userProfile.set(defaultProfile);
  }

  // Initialize default site configurations
  const existingConfigs = await storage.siteConfigs.get();
  if (!existingConfigs || Object.keys(existingConfigs).length === 0) {
    const defaultConfigs: Record<string, SiteConfig> = {
      'linkedin.com': {
        domain: 'linkedin.com',
        fieldMappings: {
          firstName: 'input[name="firstName"], input[id*="firstName"]',
          lastName: 'input[name="lastName"], input[id*="lastName"]',
          email: 'input[type="email"], input[name="email"]',
          phone: 'input[type="tel"], input[name="phone"]',
        },
        customSelectors: {},
        enabled: true,
      },
      'indeed.com': {
        domain: 'indeed.com',
        fieldMappings: {
          firstName: 'input[name="firstName"]',
          lastName: 'input[name="lastName"]',
          email: 'input[name="email"]',
          phone: 'input[name="phone"]',
        },
        customSelectors: {},
        enabled: true,
      },
      'glassdoor.com': {
        domain: 'glassdoor.com',
        fieldMappings: {
          firstName: 'input[name="firstName"]',
          lastName: 'input[name="lastName"]',
          email: 'input[name="email"]',
          phone: 'input[name="phoneNumber"]',
        },
        customSelectors: {},
        enabled: true,
      },
    };
    await storage.siteConfigs.set(defaultConfigs);
  }
});

/** ---------------------- Message Handlers ---------------------- **/

const handleGetUserProfile = async (sendResponse: Resp<{ profile: UserProfile | null }>): Promise<void> => {
  try {
    const profile = await storage.userProfile.get();
    sendResponse({ success: true, profile: profile ?? null });
  } catch (err) {
    console.error('Error getting user profile:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

const handleUpdateUserProfile = async (profile: UserProfile, sendResponse: Resp): Promise<void> => {
  try {
    await storage.userProfile.set(profile);
    sendResponse({ success: true });
  } catch (err) {
    console.error('Error updating user profile:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

const handleGetSiteConfig = async (
  domain: string,
  sendResponse: Resp<{ config: SiteConfig | undefined }>,
): Promise<void> => {
  try {
    const configs = await storage.siteConfigs.get();
    const config = configs?.[domain];
    sendResponse({ success: true, config });
  } catch (err) {
    console.error('Error getting site config:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

const handleUpdateSiteConfig = async (config: SiteConfig, sendResponse: Resp): Promise<void> => {
  try {
    const configs = (await storage.siteConfigs.get()) || {};
    configs[config.domain] = config;
    await storage.siteConfigs.set(configs);
    sendResponse({ success: true });
  } catch (err) {
    console.error('Error updating site config:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

const handleAutofillForm = async (tabId: number | undefined, data: FormDataMap, sendResponse: Resp): Promise<void> => {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab ID provided' });
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      // This function runs in the page context
      func: (formData: FormDataMap) => {
        const isTruthyValue = (value: FormValue): boolean => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value !== 0;
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'on';
          }
          return Boolean(value);
        };

        const fillField = (selector: string, value: FormValue): void => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const element = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const type = (element as HTMLInputElement).type;

            if (type === 'checkbox' || type === 'radio') {
              (element as HTMLInputElement).checked = isTruthyValue(value);
            } else {
              element.value = String(value);
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        };

        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            fillField(`[name="${key}"], [id="${key}"], [data-field="${key}"]`, value);
          }
        });
      },
      args: [data],
    });

    sendResponse({ success: true });
  } catch (err) {
    console.error('Error autofilling form:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

const handleDetectForms = async (
  tabId: number | undefined,
  sendResponse: Resp<{ forms: unknown[] }>,
): Promise<void> => {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab ID provided' });
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      // This function runs in the page context
      func: () => {
        const forms = Array.from(document.querySelectorAll('form')) as HTMLFormElement[];
        const formData = forms.map((form, index) => {
          const inputs = Array.from(form.querySelectorAll('input, select, textarea')) as Array<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >;
          const fields = inputs.map(input => ({
            name: input.name || input.id || `field_${index}`,
            type: (input as HTMLInputElement).type || input.tagName.toLowerCase(),
            placeholder: (input as HTMLInputElement).placeholder || '',
            label: input.labels?.[0]?.textContent || '',
            required: (input as HTMLInputElement).required ?? false,
          }));

          return {
            index,
            action: form.action,
            method: form.method,
            fields,
          };
        });

        return formData;
      },
    });

    const forms = results[0]?.result ?? [];
    sendResponse({ success: true, forms });
  } catch (err) {
    console.error('Error detecting forms:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    sendResponse({ success: false, error: msg });
  }
};

/** ---------------------- Message Router ---------------------- **/

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, sender: chrome.runtime.MessageSender, sendResponse: Resp): boolean | void => {
    switch (message.type) {
      case 'GET_USER_PROFILE':
        void handleGetUserProfile(sendResponse);
        return true;

      case 'UPDATE_USER_PROFILE':
        void handleUpdateUserProfile(message.profile, sendResponse);
        return true;

      case 'GET_SITE_CONFIG':
        void handleGetSiteConfig(message.domain, sendResponse);
        return true;

      case 'UPDATE_SITE_CONFIG':
        void handleUpdateSiteConfig(message.config, sendResponse);
        return true;

      case 'AUTOFILL_FORM':
        void handleAutofillForm(sender.tab?.id, message.data, sendResponse);
        return true;

      case 'DETECT_FORMS':
        void handleDetectForms(sender.tab?.id, sendResponse);
        return true;

      default:
        console.warn('Unknown message type:', (message as { type?: unknown })?.type);
        return false;
    }
  },
);

/** ---------------------- Tab Updates ---------------------- **/

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;

    const configs = await storage.siteConfigs.get();
    const isJobSite =
      !!configs &&
      Object.keys(configs).some(configDomain => domain.includes(configDomain) && configs[configDomain].enabled);

    if (isJobSite) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'JOB_SITE_DETECTED',
          domain,
        });
      } catch {
        // Content script might not be ready yet; that's okay
        console.log('Content script not ready for job site detection');
      }
    }
  }
});

console.log('Job Application Autofill Background Script loaded');
