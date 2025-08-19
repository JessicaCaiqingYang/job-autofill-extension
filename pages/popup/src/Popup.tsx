import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { ProfileForm } from '@src/components/ProfileForm';
import { ProfileView } from '@src/components/ProfileView';
import { SettingsView } from '@src/components/SettingsView';
import { useEffect, useState } from 'react';

/** ---- Shared types (keep in sync with background) ---- */
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

type Success<T = unknown> = { success: true } & T;
type Failure = { success: false; error: string };
type ApiResponse<T = unknown> = Success<T> | Failure;

const Popup = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    void loadUserProfile();
  }, []);

  const loadUserProfile = async (): Promise<void> => {
    try {
      const response = (await chrome.runtime.sendMessage({ type: 'GET_USER_PROFILE' } as const)) as ApiResponse<{
        profile: UserProfile | null;
      }>;
      if (response.success) {
        setUserProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (profile: UserProfile): Promise<void> => {
    setSaveStatus('saving');
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'UPDATE_USER_PROFILE',
        profile,
      } as const)) as ApiResponse;

      if (response && response.success) {
        setUserProfile(profile);
        setShowEditForm(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('Failed to update profile:', (response as Failure)?.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const exportProfile = (): void => {
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

  const importProfile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const fileContent = e.target?.result as string;

        let profile: UserProfile | null = null;

        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(fileContent) as unknown;
          // basic shape check
          if (parsed && typeof parsed === 'object' && 'personalInfo' in (parsed as Record<string, unknown>)) {
            profile = parsed as UserProfile;
          }
        } catch {
          // If not JSON, try to parse as text format
          profile = parseTextFormat(fileContent);
        }

        if (profile) {
          void handleProfileUpdate(profile);
          // Clear the file input
          event.target.value = '';
        } else {
          alert(
            'Invalid file format. Please use JSON files exported from this extension or plain text files with the correct format.',
          );
        }
      } catch (error) {
        console.error('Popup: Import error:', error);
        alert(
          "Invalid profile file. Please make sure it's a valid JSON file exported from this extension or a properly formatted text file.",
        );
      }
    };
    reader.onerror = error => {
      console.error('Popup: File read error:', error);
      alert('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const parseTextFormat = (content: string): UserProfile => {
    const lines = content.split('\n');
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

    lines.forEach(line => {
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey?.trim();
      const value = rest.join(':').trim(); // keep values that contain ":" intact
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-[600px] w-96 flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-blue-600 p-3 text-white">
        <h1 className="text-lg font-semibold">Job Autofill</h1>
        <p className="text-sm opacity-90">Manage your application data</p>
      </div>

      {/* Save Status */}
      {saveStatus === 'saving' && (
        <div className="flex-shrink-0 bg-blue-100 p-2 text-center text-sm text-blue-800">Saving profile...</div>
      )}
      {saveStatus === 'success' && (
        <div className="flex-shrink-0 bg-green-100 p-2 text-center text-sm text-green-800">
          Profile saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex-shrink-0 bg-red-100 p-2 text-center text-sm text-red-800">
          Failed to save profile. Please try again.
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-shrink-0 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}>
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}>
          Settings
        </button>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'profile' && (
            <div>
              {userProfile &&
              userProfile.personalInfo &&
              Object.values(userProfile.personalInfo).some(v => v) &&
              !showEditForm ? (
                <ProfileView profile={userProfile} onEdit={() => setShowEditForm(true)} onExport={exportProfile} />
              ) : (
                <ProfileForm
                  profile={userProfile}
                  onSave={handleProfileUpdate}
                  onCancel={() => setShowEditForm(false)}
                />
              )}
            </div>
          )}

          {activeTab === 'settings' && <SettingsView onImport={importProfile} />}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t bg-gray-50 p-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>v0.5.0</span>
          <button onClick={() => chrome.runtime.openOptionsPage()} className="text-blue-600 hover:underline">
            Advanced Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
