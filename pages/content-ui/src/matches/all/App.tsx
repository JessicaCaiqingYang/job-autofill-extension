import { useEffect, useState } from 'react';
import { AutofillButton } from '@src/components/AutofillButton';
import { FormPreview } from '@src/components/FormPreview';
import { FieldMappingInterface } from '@src/components/FieldMappingInterface';

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [detectedForms, setDetectedForms] = useState([]);

  useEffect(() => {
    console.log('[Job Autofill] Content UI loaded');
    
    // Check if we're on a job site and show the autofill button
    checkForJobForms();
    
    // Listen for form detection updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'FORMS_DETECTED') {
        setDetectedForms(message.forms);
        setIsVisible(message.forms.length > 0);
      }
    });

    // Get user profile
    chrome.runtime.sendMessage({ type: 'GET_USER_PROFILE' }, (response) => {
      if (response.success) {
        setUserProfile(response.profile);
      }
    });
  }, []);

  const checkForJobForms = () => {
    // Send message to content script to detect forms
    chrome.runtime.sendMessage({ type: 'DETECT_FORMS' }, (response) => {
      if (response.success && response.forms.length > 0) {
        setDetectedForms(response.forms);
        setIsVisible(true);
      }
    });
  };

  const handleAutofill = () => {
    if (!userProfile) {
      alert('Please set up your profile first in the extension popup.');
      return;
    }

    // Prepare data for autofill
    const autofillData = {
      firstName: userProfile.personalInfo.firstName,
      lastName: userProfile.personalInfo.lastName,
      email: userProfile.personalInfo.email,
      phone: userProfile.personalInfo.phone,
      address: userProfile.personalInfo.address,
      city: userProfile.personalInfo.city,
      state: userProfile.personalInfo.state,
      zipCode: userProfile.personalInfo.zipCode,
      country: userProfile.personalInfo.country,
      currentTitle: userProfile.workInfo.currentTitle,
      experience: userProfile.workInfo.experience,
      linkedinUrl: userProfile.workInfo.linkedinUrl,
      portfolioUrl: userProfile.workInfo.portfolioUrl,
      githubUrl: userProfile.workInfo.githubUrl,
      desiredSalary: userProfile.preferences.desiredSalary,
      availableStartDate: userProfile.preferences.availableStartDate,
      workAuthorization: userProfile.preferences.workAuthorization,
      willingToRelocate: userProfile.preferences.willingToRelocate,
    };

    // Send autofill request to content script
    chrome.runtime.sendMessage({
      type: 'AUTOFILL_FORM',
      data: autofillData,
    }, (response) => {
      if (response.success) {
        console.log('[Job Autofill] Form filled successfully');
      } else {
        console.error('[Job Autofill] Failed to fill form:', response.error);
      }
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[10000] bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Job Autofill</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      {detectedForms.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Found {detectedForms.length} job application form{detectedForms.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <AutofillButton 
          onClick={handleAutofill}
          disabled={!userProfile}
        />
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          {showPreview ? 'Hide' : 'Preview'} Data
        </button>
        
        <button
          onClick={() => setShowMapping(!showMapping)}
          className="w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          Field Mapping
        </button>
      </div>

      {showPreview && userProfile && (
        <FormPreview profile={userProfile} />
      )}

      {showMapping && detectedForms.length > 0 && (
        <FieldMappingInterface forms={detectedForms} />
      )}
    </div>
  );
}
