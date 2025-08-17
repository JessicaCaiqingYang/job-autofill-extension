import React, { useState } from 'react';

interface FieldMappingInterfaceProps {
  forms: any[];
}

export const FieldMappingInterface: React.FC<FieldMappingInterfaceProps> = ({ forms }) => {
  const [selectedForm, setSelectedForm] = useState(0);

  if (!forms || forms.length === 0) {
    return null;
  }

  const currentForm = forms[selectedForm];

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded border">
      <h4 className="text-xs font-medium text-gray-700 mb-2">Field Mapping</h4>
      
      {forms.length > 1 && (
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(Number(e.target.value))}
          className="w-full mb-2 px-2 py-1 text-xs border rounded"
        >
          {forms.map((form, index) => (
            <option key={index} value={index}>
              Form {index + 1} ({form.fields.length} fields)
            </option>
          ))}
        </select>
      )}

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {currentForm.fields.slice(0, 5).map((field: any, index: number) => (
          <div key={index} className="text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 truncate">
                {field.label || field.name || field.placeholder || 'Unnamed field'}
              </span>
              <span className="text-gray-400 ml-2">{field.type}</span>
            </div>
          </div>
        ))}
        {currentForm.fields.length > 5 && (
          <div className="text-xs text-gray-500">
            ... and {currentForm.fields.length - 5} more fields
          </div>
        )}
      </div>
      
      <button
        onClick={() => {
          chrome.runtime.openOptionsPage();
        }}
        className="w-full mt-2 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
      >
        Configure Mappings
      </button>
    </div>
  );
};