import React from 'react';

interface FormPreviewProps {
  profile: any;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ profile }) => {
  const previewData = [
    { label: 'Name', value: `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` },
    { label: 'Email', value: profile.personalInfo.email },
    { label: 'Phone', value: profile.personalInfo.phone },
    { label: 'Location', value: `${profile.personalInfo.city}, ${profile.personalInfo.state}` },
    { label: 'Title', value: profile.workInfo.currentTitle },
    { label: 'Experience', value: profile.workInfo.experience },
  ].filter(item => item.value);

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded border">
      <h4 className="text-xs font-medium text-gray-700 mb-2">Data Preview</h4>
      <div className="space-y-1">
        {previewData.map((item, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span className="text-gray-600">{item.label}:</span>
            <span className="text-gray-800 truncate ml-2 max-w-32">{item.value}</span>
          </div>
        ))}
      </div>
      {previewData.length === 0 && (
        <p className="text-xs text-gray-500">No profile data available</p>
      )}
    </div>
  );
};