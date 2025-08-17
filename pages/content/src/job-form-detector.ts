export class JobFormDetector {
  private jobKeywords = [
    'application', 'apply', 'job', 'career', 'position', 'resume', 'cv',
    'employment', 'hiring', 'candidate', 'applicant', 'work', 'opportunity'
  ];

  private personalInfoFields = [
    'firstName', 'lastname', 'email', 'phone', 'address', 'city', 'state',
    'zip', 'postal', 'country', 'name', 'contact'
  ];

  detectJobForms(): HTMLFormElement[] {
    const forms = Array.from(document.querySelectorAll('form'));
    const jobForms: HTMLFormElement[] = [];

    forms.forEach(form => {
      if (this.isJobApplicationForm(form)) {
        jobForms.push(form);
      }
    });

    return jobForms;
  }

  private isJobApplicationForm(form: HTMLFormElement): boolean {
    // Check form attributes
    const formText = this.getFormText(form).toLowerCase();
    const hasJobKeywords = this.jobKeywords.some(keyword => 
      formText.includes(keyword)
    );

    // Check for personal info fields
    const inputs = form.querySelectorAll('input, select, textarea');
    const fieldNames = Array.from(inputs).map((input: any) => 
      (input.name || input.id || input.placeholder || '').toLowerCase()
    );

    const hasPersonalFields = this.personalInfoFields.some(field =>
      fieldNames.some(name => name.includes(field))
    );

    // Check for file upload (resume/CV)
    const hasFileUpload = form.querySelector('input[type="file"]') !== null;

    // Check URL for job-related paths
    const url = window.location.href.toLowerCase();
    const hasJobUrl = this.jobKeywords.some(keyword => url.includes(keyword));

    // Form is likely a job application if it has job keywords OR personal fields + file upload
    return hasJobKeywords || (hasPersonalFields && hasFileUpload) || hasJobUrl;
  }

  private getFormText(form: HTMLFormElement): string {
    const textElements = form.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6, p, span');
    const texts = Array.from(textElements).map(el => el.textContent || '');
    
    // Also include form action and class names
    const formAction = form.action || '';
    const formClasses = form.className || '';
    const formId = form.id || '';
    
    return [...texts, formAction, formClasses, formId].join(' ');
  }

  getFormData(): any {
    const forms = this.detectJobForms();
    return forms.map(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      const fields = Array.from(inputs).map((input: any) => ({
        name: input.name || input.id || '',
        type: input.type || input.tagName.toLowerCase(),
        value: input.value || '',
        placeholder: input.placeholder || '',
        required: input.required,
        label: this.getFieldLabel(input),
      }));

      return {
        id: form.id || form.className || 'unnamed-form',
        action: form.action,
        method: form.method,
        fields,
      };
    });
  }

  private getFieldLabel(input: HTMLElement): string {
    // Try to find associated label
    const inputId = input.id;
    if (inputId) {
      const label = document.querySelector(`label[for="${inputId}"]`);
      if (label) return label.textContent || '';
    }

    // Look for parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    // Look for nearby text
    const parent = input.parentElement;
    if (parent) {
      const textNodes = Array.from(parent.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(text => text && text.length > 0);
      
      if (textNodes.length > 0) return textNodes[0] || '';
    }

    return '';
  }
}