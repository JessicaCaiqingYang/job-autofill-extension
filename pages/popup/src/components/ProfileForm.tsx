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

interface ProfileFormProps {
  profile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
}

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

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>(() => {
    if (profile) {
      return {
        personalInfo: { ...defaultProfile.personalInfo, ...profile.personalInfo },
        workInfo: { ...defaultProfile.workInfo, ...profile.workInfo },
        preferences: { ...defaultProfile.preferences, ...profile.preferences },
      };
    }
    return defaultProfile;
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'work' | 'preferences'>('personal');

  // Update form data when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData({
        personalInfo: { ...defaultProfile.personalInfo, ...profile.personalInfo },
        workInfo: { ...defaultProfile.workInfo, ...profile.workInfo },
        preferences: { ...defaultProfile.preferences, ...profile.preferences },
      });
    } else {
      setFormData(defaultProfile);
    }
  }, [profile]);

  const handleInputChange = (
    section: 'personalInfo' | 'workInfo' | 'preferences',
    field: string,
    value: string | boolean,
  ) => {
    setFormData(prev => {
      const next = { ...prev };

      if (section === 'personalInfo') {
        // @ts-expect-error string index write on structured type
        next.personalInfo[field] = value as never;
      } else if (section === 'workInfo') {
        if (field === 'skills' && typeof value === 'string') {
          // handled by handleSkillsChange
        } else {
          // @ts-expect-error string index write on structured type
          next.workInfo[field] = value as never;
        }
      } else {
        // preferences
        // @ts-expect-error string index write on structured type
        next.preferences[field] = value as never;
      }

      return next;
    });
  };

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    setFormData(prev => ({ ...prev, workInfo: { ...prev.workInfo, skills: skillsArray } }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="First Name"
          value={formData.personalInfo.firstName}
          onChange={e => handleInputChange('personalInfo', 'firstName', e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.personalInfo.lastName}
          onChange={e => handleInputChange('personalInfo', 'lastName', e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={formData.personalInfo.email}
        onChange={e => handleInputChange('personalInfo', 'email', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.personalInfo.phone}
        onChange={e => handleInputChange('personalInfo', 'phone', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="text"
        placeholder="Address"
        value={formData.personalInfo.address}
        onChange={e => handleInputChange('personalInfo', 'address', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="City"
          value={formData.personalInfo.city}
          onChange={e => handleInputChange('personalInfo', 'city', e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="State"
          value={formData.personalInfo.state}
          onChange={e => handleInputChange('personalInfo', 'state', e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="ZIP"
          value={formData.personalInfo.zipCode}
          onChange={e => handleInputChange('personalInfo', 'zipCode', e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
      </div>
      <input
        type="text"
        placeholder="Country"
        value={formData.personalInfo.country}
        onChange={e => handleInputChange('personalInfo', 'country', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
    </div>
  );

  const renderWorkInfo = () => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Current Job Title"
        value={formData.workInfo.currentTitle}
        onChange={e => handleInputChange('workInfo', 'currentTitle', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="text"
        placeholder="Years of Experience"
        value={formData.workInfo.experience}
        onChange={e => handleInputChange('workInfo', 'experience', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <textarea
        placeholder="Skills (comma-separated)"
        value={formData.workInfo.skills.join(', ')}
        onChange={e => handleSkillsChange(e.target.value)}
        className="w-full resize-none rounded border px-2 py-1 text-sm"
        rows={3}
      />
      <input
        type="url"
        placeholder="LinkedIn URL"
        value={formData.workInfo.linkedinUrl}
        onChange={e => handleInputChange('workInfo', 'linkedinUrl', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="url"
        placeholder="Portfolio URL"
        value={formData.workInfo.portfolioUrl}
        onChange={e => handleInputChange('workInfo', 'portfolioUrl', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="url"
        placeholder="GitHub URL"
        value={formData.workInfo.githubUrl}
        onChange={e => handleInputChange('workInfo', 'githubUrl', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Desired Salary"
        value={formData.preferences.desiredSalary}
        onChange={e => handleInputChange('preferences', 'desiredSalary', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <input
        type="date"
        placeholder="Available Start Date"
        value={formData.preferences.availableStartDate}
        onChange={e => handleInputChange('preferences', 'availableStartDate', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
      <select
        value={formData.preferences.workAuthorization}
        onChange={e => handleInputChange('preferences', 'workAuthorization', e.target.value)}
        className="w-full rounded border px-2 py-1 text-sm">
        <option value="">Work Authorization</option>
        <option value="US Citizen">US Citizen</option>
        <option value="Green Card">Green Card</option>
        <option value="H1B">H1B</option>
        <option value="F1 OPT">F1 OPT</option>
        <option value="Other">Other</option>
      </select>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.preferences.willingToRelocate}
          onChange={e => handleInputChange('preferences', 'willingToRelocate', e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">Willing to relocate</span>
      </label>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Section Navigation */}
      <div className="mb-4 flex flex-shrink-0 text-xs">
        <button
          onClick={() => setActiveSection('personal')}
          className={`flex-1 rounded-l px-2 py-1 ${activeSection === 'personal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Personal
        </button>
        <button
          onClick={() => setActiveSection('work')}
          className={`flex-1 px-2 py-1 ${activeSection === 'work' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Work
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`flex-1 rounded-r px-2 py-1 ${activeSection === 'preferences' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Preferences
        </button>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="space-y-4 pb-4">
          {activeSection === 'personal' && renderPersonalInfo()}
          {activeSection === 'work' && renderWorkInfo()}
          {activeSection === 'preferences' && renderPreferences()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-shrink-0 space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Save Profile
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 rounded bg-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
