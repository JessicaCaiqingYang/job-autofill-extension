import React, { useState } from 'react';

interface ProfileFormProps {
  profile: any;
  onSave: (profile: any) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState(profile || {
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
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'work' | 'preferences'>('personal');

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    handleInputChange('workInfo', 'skills', skillsArray);
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
          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.personalInfo.lastName}
          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={formData.personalInfo.email}
        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.personalInfo.phone}
        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="text"
        placeholder="Address"
        value={formData.personalInfo.address}
        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="City"
          value={formData.personalInfo.city}
          onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
        <input
          type="text"
          placeholder="State"
          value={formData.personalInfo.state}
          onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
        <input
          type="text"
          placeholder="ZIP"
          value={formData.personalInfo.zipCode}
          onChange={(e) => handleInputChange('personalInfo', 'zipCode', e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
      </div>
    </div>
  );

  const renderWorkInfo = () => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Current Job Title"
        value={formData.workInfo.currentTitle}
        onChange={(e) => handleInputChange('workInfo', 'currentTitle', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="text"
        placeholder="Years of Experience"
        value={formData.workInfo.experience}
        onChange={(e) => handleInputChange('workInfo', 'experience', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="text"
        placeholder="Skills (comma separated)"
        value={formData.workInfo.skills.join(', ')}
        onChange={(e) => handleSkillsChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="url"
        placeholder="LinkedIn URL"
        value={formData.workInfo.linkedinUrl}
        onChange={(e) => handleInputChange('workInfo', 'linkedinUrl', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="url"
        placeholder="Portfolio URL"
        value={formData.workInfo.portfolioUrl}
        onChange={(e) => handleInputChange('workInfo', 'portfolioUrl', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="url"
        placeholder="GitHub URL"
        value={formData.workInfo.githubUrl}
        onChange={(e) => handleInputChange('workInfo', 'githubUrl', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Desired Salary"
        value={formData.preferences.desiredSalary}
        onChange={(e) => handleInputChange('preferences', 'desiredSalary', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <input
        type="date"
        placeholder="Available Start Date"
        value={formData.preferences.availableStartDate}
        onChange={(e) => handleInputChange('preferences', 'availableStartDate', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      />
      <select
        value={formData.preferences.workAuthorization}
        onChange={(e) => handleInputChange('preferences', 'workAuthorization', e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
      >
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
          onChange={(e) => handleInputChange('preferences', 'willingToRelocate', e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">Willing to relocate</span>
      </label>
    </div>
  );

  return (
    <div>
      {/* Section Navigation */}
      <div className="flex mb-4 text-xs">
        <button
          onClick={() => setActiveSection('personal')}
          className={`flex-1 py-1 px-2 rounded-l ${
            activeSection === 'personal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveSection('work')}
          className={`flex-1 py-1 px-2 ${
            activeSection === 'work' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`flex-1 py-1 px-2 rounded-r ${
            activeSection === 'preferences' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Form Content */}
      <div className="mb-4">
        {activeSection === 'personal' && renderPersonalInfo()}
        {activeSection === 'work' && renderWorkInfo()}
        {activeSection === 'preferences' && renderPreferences()}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </div>
  );
};