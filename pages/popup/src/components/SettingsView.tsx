import { useEffect, useState } from 'react';
import type React from 'react';

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

type Success<T = unknown> = { success: true } & T;
type Failure = { success: false; error: string };
type ApiResponse<T = unknown> = Success<T> | Failure;

interface SettingsViewProps {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onImport }) => {
  const [siteConfigs, setSiteConfigs] = useState<Record<string, SiteConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showTextParser, setShowTextParser] = useState(false);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    void loadSiteConfigs();
  }, []);

  const loadSiteConfigs = async (): Promise<void> => {
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'GET_SITE_CONFIG',
        domain: 'all',
      } as const)) as ApiResponse<{ config: Record<string, SiteConfig> | undefined }>;

      if (response.success) {
        setSiteConfigs(response.config ?? {});
      }
    } catch (error) {
      console.error('Failed to load site configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSiteConfig = async (domain: string, enabled: boolean): Promise<void> => {
    const config = siteConfigs[domain];
    if (!config) return;

    const updatedConfig: SiteConfig = { ...config, enabled };
    try {
      const res = (await chrome.runtime.sendMessage({
        type: 'UPDATE_SITE_CONFIG',
        config: updatedConfig,
      } as const)) as ApiResponse;

      if (res.success) {
        setSiteConfigs(prev => ({ ...prev, [domain]: updatedConfig }));
      } else {
        console.error('Failed to update site config:', (res as Failure).error);
      }
    } catch (error) {
      console.error('Failed to update site config:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const fileContent = (e.target?.result ?? '') as string;

        // Try JSON first
        try {
          JSON.parse(fileContent);
          onImport(event); // forward original event to upstream importer
          return;
        } catch {
          // Plain text fallback
          const profile = parseTextFormat(fileContent);
          if (profile) {
            handleProfileImport(profile);
            return;
          }
        }

        alert(
          'Unsupported file format. Please use JSON files exported from this extension or plain text with the documented format.',
        );
      } catch {
        alert('Failed to read the file. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleProfileImport = (profile: UserProfile): void => {
    // Create a minimal synthetic event with just the files property
    const file = new File([JSON.stringify(profile)], 'imported-profile.json', { type: 'application/json' });
    const syntheticEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onImport(syntheticEvent);
  };

  const parseTextFormat = (content: string): UserProfile => {
    const profile: UserProfile = {
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

    const lines = content.split('\n');
    lines.forEach(line => {
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey?.trim();
      const value = rest.join(':').trim();
      if (!key || !value) return;

      switch (key.toLowerCase()) {
        case 'name': {
          const [firstName, lastName] = value.split(' ');
          profile.personalInfo.firstName = firstName || '';
          profile.personalInfo.lastName = lastName || '';
          break;
        }
        case 'email': {
          profile.personalInfo.email = value;
          break;
        }
        case 'phone': {
          profile.personalInfo.phone = value;
          break;
        }
        case 'address': {
          profile.personalInfo.address = value;
          break;
        }
        case 'city': {
          profile.personalInfo.city = value;
          break;
        }
        case 'state': {
          profile.personalInfo.state = value;
          break;
        }
        case 'zip':
        case 'zipcode': {
          profile.personalInfo.zipCode = value;
          break;
        }
        case 'country': {
          profile.personalInfo.country = value;
          break;
        }
        case 'title':
        case 'job title': {
          profile.workInfo.currentTitle = value;
          break;
        }
        case 'experience': {
          profile.workInfo.experience = value;
          break;
        }
        case 'skills': {
          profile.workInfo.skills = value.split(',').map(s => s.trim());
          break;
        }
        case 'linkedin': {
          profile.workInfo.linkedinUrl = value;
          break;
        }
        case 'portfolio': {
          profile.workInfo.portfolioUrl = value;
          break;
        }
        case 'github': {
          profile.workInfo.githubUrl = value;
          break;
        }
        case 'salary': {
          profile.preferences.desiredSalary = value;
          break;
        }
        case 'start date': {
          profile.preferences.availableStartDate = value;
          break;
        }
        case 'work authorization': {
          profile.preferences.workAuthorization = value;
          break;
        }
        case 'relocate': {
          const v = value.toLowerCase();
          profile.preferences.willingToRelocate = v === 'yes' || v === 'true';
          break;
        }
        default:
          break;
      }
    });

    return profile;
  };

  const handleTextParse = (): void => {
    try {
      const profile = parseTextFormat(textInput);
      handleProfileImport(profile);
      setShowTextParser(false);
      setTextInput('');
    } catch {
      alert('Failed to parse the text. Please check the format.');
    }
  };

  if (isLoading) {
    return <div className="text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Profile Management */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Profile Management</h3>
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs text-gray-600">Import Profile:</span>
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleImport}
              className="block w-full text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              JSON files from this extension or text files like: Name: John Doe, Email: john@example.com, …
            </p>
          </label>

          <button
            onClick={() => setShowTextParser(true)}
            className="w-full rounded bg-green-100 py-2 text-sm text-green-700 transition-colors hover:bg-green-200">
            Paste from Document
          </button>

          {showTextParser && (
            <div className="rounded border bg-gray-50 p-3">
              <div className="mb-2">
                <h4 className="mb-1 text-xs font-medium text-gray-700">Paste your information here:</h4>
                <p className="mb-2 text-xs text-gray-500">
                  Example: Name: John Doe, Email: john.doe@example.com, Phone: 123-456-7890, …
                </p>
              </div>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Name: John Doe&#10;Email: john.doe@example.com&#10;Phone: 123-456-7890&#10;Address: 123 Main St&#10;City: New York&#10;State: NY&#10;Zip: 10001&#10;Country: USA&#10;Title: Software Engineer&#10;Experience: 5 years&#10;Skills: JavaScript, React, Node.js&#10;LinkedIn: https://linkedin.com/in/johndoe&#10;Salary: $80,000&#10;Start Date: 2024-01-15&#10;Work Authorization: US Citizen&#10;Relocate: Yes"
                className="h-32 w-full resize-none rounded border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleTextParse}
                  className="flex-1 rounded bg-blue-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                  Parse & Import
                </button>
                <button
                  onClick={() => {
                    setShowTextParser(false);
                    setTextInput('');
                  }}
                  className="flex-1 rounded bg-gray-300 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Site Configurations */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Supported Sites</h3>
        <div className="space-y-2">
          {Object.entries(siteConfigs).map(([domain, config]: [string, SiteConfig]) => (
            <div key={domain} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{domain}</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!config.enabled}
                  onChange={e => toggleSiteConfig(domain, e.target.checked)}
                  className="rounded"
                />
                <span className="ml-1 text-xs">Enabled</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="w-full rounded bg-gray-100 py-2 text-sm text-gray-700 hover:bg-gray-200">
            Advanced Settings
          </button>
          <button
            onClick={() => chrome.tabs.create({ url: 'https://linkedin.com/jobs' })}
            className="w-full rounded bg-blue-100 py-2 text-sm text-blue-700 hover:bg-blue-200">
            Open LinkedIn Jobs
          </button>
        </div>
      </div>

      {/* Help */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Help</h3>
        <div className="space-y-1 text-xs text-gray-600">
          <p>• Fill out your profile completely for best results</p>
          <p>• The extension works on major job sites</p>
          <p>• Use field mapping for custom sites</p>
          <p>• Export your profile to back up your data</p>
          <p>• Use "Paste from Document" to import from Word/PDF files</p>
          <p>• Supported format: Name: John Doe, Email: john@example.com</p>
        </div>
      </div>
    </div>
  );
};
