import { storage } from '@extension/storage';

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

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
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

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_USER_PROFILE':
      handleGetUserProfile(sendResponse);
      return true;
    
    case 'UPDATE_USER_PROFILE':
      handleUpdateUserProfile(message.profile, sendResponse);
      return true;
    
    case 'GET_SITE_CONFIG':
      handleGetSiteConfig(message.domain, sendResponse);
      return true;
    
    case 'UPDATE_SITE_CONFIG':
      handleUpdateSiteConfig(message.config, sendResponse);
      return true;
    
    case 'AUTOFILL_FORM':
      handleAutofillForm(sender.tab?.id, message.data, sendResponse);
      return true;
    
    case 'DETECT_FORMS':
      handleDetectForms(sender.tab?.id, sendResponse);
      return true;
    
    default:
      console.warn('Unknown message type:', message.type);
  }
});

async function handleGetUserProfile(sendResponse: (response: any) => void) {
  try {
    const profile = await storage.userProfile.get();
    sendResponse({ success: true, profile });
  } catch (error) {
    console.error('Error getting user profile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUpdateUserProfile(profile: UserProfile, sendResponse: (response: any) => void) {
  try {
    await storage.userProfile.set(profile);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetSiteConfig(domain: string, sendResponse: (response: any) => void) {
  try {
    const configs = await storage.siteConfigs.get();
    const config = configs?.[domain];
    sendResponse({ success: true, config });
  } catch (error) {
    console.error('Error getting site config:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUpdateSiteConfig(config: SiteConfig, sendResponse: (response: any) => void) {
  try {
    const configs = await storage.siteConfigs.get() || {};
    configs[config.domain] = config;
    await storage.siteConfigs.set(configs);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating site config:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAutofillForm(tabId: number | undefined, data: any, sendResponse: (response: any) => void) {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab ID provided' });
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (formData) => {
        // This function runs in the content script context
        const fillField = (selector: string, value: string) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element: any) => {
            if (element.type === 'checkbox' || element.type === 'radio') {
              element.checked = value === 'true' || value === true;
            } else {
              element.value = value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        };

        // Fill form fields based on the data provided
        Object.entries(formData).forEach(([key, value]) => {
          if (value) {
            fillField(`[name="${key}"], [id="${key}"], [data-field="${key}"]`, String(value));
          }
        });
      },
      args: [data],
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error('Error autofilling form:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDetectForms(tabId: number | undefined, sendResponse: (response: any) => void) {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab ID provided' });
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // This function runs in the content script context
        const forms = Array.from(document.querySelectorAll('form'));
        const formData = forms.map((form, index) => {
          const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
          const fields = inputs.map((input: any) => ({
            name: input.name || input.id || `field_${index}`,
            type: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder || '',
            label: input.labels?.[0]?.textContent || '',
            required: input.required,
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

    sendResponse({ success: true, forms: results[0]?.result || [] });
  } catch (error) {
    console.error('Error detecting forms:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle tab updates to inject content scripts on job sites
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    // Check if this is a job site we support
    const configs = await storage.siteConfigs.get();
    const isJobSite = configs && Object.keys(configs).some(configDomain => 
      domain.includes(configDomain) && configs[configDomain].enabled
    );
    
    if (isJobSite) {
      // Notify content script that this is a supported job site
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'JOB_SITE_DETECTED',
          domain,
        });
      } catch (error) {
        // Content script might not be ready yet, that's okay
        console.log('Content script not ready for job site detection');
      }
    }
  }
});

console.log('Job Application Autofill Background Script loaded');