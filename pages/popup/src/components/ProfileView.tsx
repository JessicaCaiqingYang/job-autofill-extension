import React from 'react';

interface ProfileViewProps {
  profile: any;
  onEdit: () => void;
  onExport: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit, onExport }) => {
  const personalInfo = profile.personalInfo;
  const workInfo = profile.workInfo;
  const preferences = profile.preferences;

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h3>
        <div className="space-y-1 text-xs">
          <div><strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}</div>
          <div><strong>Email:</strong> {personalInfo.email}</div>
          <div><strong>Phone:</strong> {personalInfo.phone}</div>
          <div><strong>Location:</strong> {personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</div>
        </div>
      </div>

      {/* Work Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Work Information</h3>
        <div className="space-y-1 text-xs">
          <div><strong>Title:</strong> {workInfo.currentTitle}</div>
          <div><strong>Experience:</strong> {workInfo.experience}</div>
          {workInfo.skills.length > 0 && (
            <div><strong>Skills:</strong> {workInfo.skills.join(', ')}</div>
          )}
          {workInfo.linkedinUrl && (
            <div><strong>LinkedIn:</strong> <a href={workInfo.linkedinUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Profile</a></div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preferences</h3>
        <div className="space-y-1 text-xs">
          {preferences.desiredSalary && (
            <div><strong>Salary:</strong> {preferences.desiredSalary}</div>
          )}
          {preferences.availableStartDate && (
            <div><strong>Start Date:</strong> {preferences.availableStartDate}</div>
          )}
          {preferences.workAuthorization && (
            <div><strong>Authorization:</strong> {preferences.workAuthorization}</div>
          )}
          <div><strong>Relocate:</strong> {preferences.willingToRelocate ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
        <button
          onClick={onExport}
          className="flex-1 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700"
        >
          Export
        </button>
      </div>
    </div>
  );
};