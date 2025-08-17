import React, { useState, useEffect } from 'react';

interface SettingsViewProps {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onImport }) => {
  const [siteConfigs, setSiteConfigs] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSiteConfigs();
  }, []);

  const loadSiteConfigs = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SITE_CONFIG', domain: 'all' });
      if (response.success) {
        setSiteConfigs(response.config || {});
      }
    } catch (error) {
      console.error('Failed to load site configs:', error);
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
        setSiteConfigs((prev: any) => ({
          ...prev,
          [domain]: updatedConfig,
        }));
      } catch (error) {
        console.error('Failed to update site config:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Import/Export */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Profile Management</h3>
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs text-gray-600">Import Profile:</span>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>
      </div>

      {/* Site Configurations */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Supported Sites</h3>
        <div className="space-y-2">
          {Object.entries(siteConfigs).map(([domain, config]: [string, any]) => (
            <div key={domain} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{domain}</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => toggleSiteConfig(domain, e.target.checked)}
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
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
          >
            Advanced Settings
          </button>
          <button
            onClick={() => chrome.tabs.create({ url: 'https://linkedin.com/jobs' })}
            className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
          >
            Open LinkedIn Jobs
          </button>
        </div>
      </div>

      {/* Help */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Help</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Fill out your profile completely for best results</p>
          <p>• The extension works on major job sites</p>
          <p>• Use field mapping for custom sites</p>
        </div>
      </div>
    </div>
  );
};