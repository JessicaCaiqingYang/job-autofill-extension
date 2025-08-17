import '@src/Popup.css';
import { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { ProfileForm } from '@src/components/ProfileForm';
import { ProfileView } from '@src/components/ProfileView';
import { SettingsView } from '@src/components/SettingsView';

const Popup = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_USER_PROFILE' });
      if (response.success) {
        setUserProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (profile: any) => {
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'UPDATE_USER_PROFILE', 
        profile 
      });
      if (response.success) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const exportProfile = () => {
    if (!userProfile) return;
    
    const dataStr = JSON.stringify(userProfile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job-autofill-profile.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const profile = JSON.parse(e.target?.result as string);
        handleProfileUpdate(profile);
      } catch (error) {
        alert('Invalid profile file');
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-96 h-96 bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-lg font-semibold">Job Autofill</h1>
        <p className="text-sm opacity-90">Manage your application data</p>
      </div>

      {/* Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="p-4 h-64 overflow-y-auto">
        {activeTab === 'profile' && (
          <div>
            {userProfile && Object.values(userProfile.personalInfo).some(v => v) ? (
              <ProfileView 
                profile={userProfile} 
                onEdit={() => setActiveTab('profile')}
                onExport={exportProfile}
              />
            ) : (
              <ProfileForm 
                profile={userProfile}
                onSave={handleProfileUpdate}
              />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsView onImport={importProfile} />
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-2 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>v0.5.0</span>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-blue-600 hover:underline"
          >
            Advanced Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
