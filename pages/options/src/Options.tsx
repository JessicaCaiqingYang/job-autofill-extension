import '@src/Options.css';
import { useState, useEffect } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

interface SiteConfig {
  domain: string;
  fieldMappings: Record<string, string>;
  customSelectors: Record<string, string>;
  enabled: boolean;
}

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

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'mappings' | 'profile' | 'help'>('overview');
  const [siteConfigs, setSiteConfigs] = useState<Record<string, SiteConfig>>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load site configurations
      const siteResponse = await chrome.runtime.sendMessage({ type: 'GET_SITE_CONFIG', domain: 'all' });
      if (siteResponse.success) {
        setSiteConfigs(siteResponse.config || {});
      }

      // Load user profile
      const profileResponse = await chrome.runtime.sendMessage({ type: 'GET_USER_PROFILE' });
      if (profileResponse.success) {
        setUserProfile(profileResponse.profile);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSiteConfig = async (domain: string, enabled: boolean) => {
    const config = siteConfigs[domain];
    if (config) {
      const updatedConfig = { ...config, enabled };
      try {
        await chrome.runtime.sendMessage({
          type: 'UPDATE_SITE_CONFIG',
          config: updatedConfig
        });
        setSiteConfigs(prev => ({
          ...prev,
          [domain]: updatedConfig,
        }));
      } catch (error) {
        console.error('Failed to update site config:', error);
      }
    }
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      siteConfigs: siteConfigs,
      exportDate: new Date().toISOString(),
      version: '0.5.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `job-autofill-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          🚀 Job Application Autofill Extension
        </h2>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          Streamline your job applications with intelligent form filling across major job sites.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Profile Status</h3>
            <p className="text-sm">
              {userProfile && Object.values(userProfile.personalInfo || {}).some(v => v)
                ? 'Profile configured and ready'
                : 'Profile needs setup'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🌐 Supported Sites</h3>
            <p className="text-sm">
              {Object.values(siteConfigs).filter(config => config.enabled).length} sites enabled
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">🎯 Smart Detection</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Automatically detects job application forms using advanced pattern recognition and keyword analysis.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">⚡ One-Click Fill</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Fill entire job applications instantly with your saved profile information across all supported sites.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">🔒 Privacy First</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All data stored locally on your device. No information is sent to external servers.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSites = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Supported Job Sites</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Enable or disable autofill functionality for specific job sites. The extension works best on major job platforms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(siteConfigs).map(([domain, config]) => (
            <div key={domain} className="border dark:border-gray-600 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{domain.replace('.com', '')}</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => toggleSiteConfig(domain, e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Enabled</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Object.keys(config.fieldMappings).length} field mappings configured
              </p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded ${config.enabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                  {config.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMappings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Field Mappings</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          View how form fields are mapped to your profile data across different job sites.
        </p>

        {Object.entries(siteConfigs).map(([domain, config]) => (
          <div key={domain} className="mb-6 border dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 capitalize">
              {domain.replace('.com', '')} Field Mappings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(config.fieldMappings).map(([field, selector]) => (
                <div key={field} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
                    {field}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {selector}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Profile Overview</h2>
        {userProfile ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {userProfile.personalInfo.firstName} {userProfile.personalInfo.lastName}</div>
                <div><strong>Email:</strong> {userProfile.personalInfo.email}</div>
                <div><strong>Phone:</strong> {userProfile.personalInfo.phone}</div>
                <div><strong>Location:</strong> {userProfile.personalInfo.city}, {userProfile.personalInfo.state}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Work Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Title:</strong> {userProfile.workInfo.currentTitle}</div>
                <div><strong>Experience:</strong> {userProfile.workInfo.experience}</div>
                <div><strong>Skills:</strong> {userProfile.workInfo.skills.join(', ')}</div>
                <div><strong>LinkedIn:</strong> {userProfile.workInfo.linkedinUrl ? 'Configured' : 'Not set'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Preferences</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Salary:</strong> {userProfile.preferences.desiredSalary || 'Not specified'}</div>
                <div><strong>Start Date:</strong> {userProfile.preferences.availableStartDate || 'Not specified'}</div>
                <div><strong>Authorization:</strong> {userProfile.preferences.workAuthorization || 'Not specified'}</div>
                <div><strong>Relocate:</strong> {userProfile.preferences.willingToRelocate ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No profile configured yet.</p>
            <button
              onClick={() => chrome.action.openPopup()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Set Up Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Help & Support</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">🚀 Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Set up your profile by clicking the extension icon</li>
              <li>Fill out your personal information, work experience, and preferences</li>
              <li>Visit a supported job site (LinkedIn, Indeed, Glassdoor, etc.)</li>
              <li>Look for the floating autofill button on job application forms</li>
              <li>Click "Autofill Form" to populate fields automatically</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">🔧 Troubleshooting</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Forms not detected:</strong>
                <p className="text-gray-600 dark:text-gray-300">Try refreshing the page or check if the site is enabled in the Sites tab.</p>
              </div>
              <div>
                <strong>Autofill not working:</strong>
                <p className="text-gray-600 dark:text-gray-300">Ensure your profile is complete and the extension has permission to access the site.</p>
              </div>
              <div>
                <strong>Missing fields:</strong>
                <p className="text-gray-600 dark:text-gray-300">Some sites may require custom field mapping. Contact support for assistance.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">📊 Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(siteConfigs).length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Supported Sites</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.values(siteConfigs).filter(c => c.enabled).length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Active Sites</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.values(siteConfigs).reduce((acc, config) => acc + Object.keys(config.fieldMappings).length, 0)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Field Mappings</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userProfile ? '✓' : '✗'}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Profile Setup</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={cn('min-h-screen', isLight ? 'bg-gray-50 text-gray-900' : 'bg-gray-900 text-gray-100')}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Job Autofill Extension
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">v0.5.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Export Data
              </button>
              <ToggleButton onClick={exampleThemeStorage.toggle}>
                {isLight ? '🌙' : '☀️'}
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'sites', label: 'Supported Sites', icon: '🌐' },
              { id: 'mappings', label: 'Field Mappings', icon: '🔗' },
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'help', label: 'Help', icon: '❓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'sites' && renderSites()}
        {activeTab === 'mappings' && renderMappings()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'help' && renderHelp()}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
