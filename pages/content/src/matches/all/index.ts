import { JobFormDetector } from '@src/job-form-detector';
import { FormFieldMapper } from '@src/form-field-mapper';

console.log('[CEB] Job Autofill Content Script loaded');

// Initialize job form detection
const formDetector = new JobFormDetector();
const fieldMapper = new FormFieldMapper();

// Start detecting forms when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeJobAutofill);
} else {
  initializeJobAutofill();
}

function initializeJobAutofill() {
  // Detect job application forms
  const forms = formDetector.detectJobForms();
  
  if (forms.length > 0) {
    console.log(`[Job Autofill] Found ${forms.length} potential job application forms`);
    
    // Notify background script about detected forms
    chrome.runtime.sendMessage({
      type: 'FORMS_DETECTED',
      forms: forms.map(form => ({
        id: form.id || form.className || 'unnamed-form',
        fields: fieldMapper.mapFormFields(form),
        action: form.action,
        method: form.method,
      })),
    });
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'JOB_SITE_DETECTED':
      console.log('[Job Autofill] Job site detected:', message.domain);
      // Re-scan for forms when job site is detected
      initializeJobAutofill();
      break;
    
    case 'AUTOFILL_FORM':
      handleAutofillRequest(message.data);
      sendResponse({ success: true });
      break;
    
    case 'GET_FORM_DATA':
      const formData = formDetector.getFormData();
      sendResponse({ success: true, data: formData });
      break;
  }
});

function handleAutofillRequest(data: any) {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const mappedFields = fieldMapper.mapFormFields(form);
    
    Object.entries(data).forEach(([key, value]) => {
      const fieldSelector = mappedFields[key];
      if (fieldSelector && value) {
        const elements = form.querySelectorAll(fieldSelector);
        elements.forEach((element: any) => {
          if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = value === 'true' || value === true;
          } else {
            element.value = String(value);
            // Trigger events to ensure React/Vue apps detect the change
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
          }
        });
      }
    });
  });
}

// Watch for dynamically added forms
const observer = new MutationObserver((mutations) => {
  let shouldRescan = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === 'FORM' || element.querySelector('form')) {
            shouldRescan = true;
          }
        }
      });
    }
  });
  
  if (shouldRescan) {
    setTimeout(initializeJobAutofill, 500); // Debounce rescanning
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
