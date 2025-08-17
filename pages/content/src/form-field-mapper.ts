export class FormFieldMapper {
  private fieldMappings: Record<string, string[]> = {
    firstName: [
      'firstName', 'first_name', 'fname', 'givenName', 'given_name',
      'first-name', 'firstname', 'name_first'
    ],
    lastName: [
      'lastName', 'last_name', 'lname', 'surname', 'familyName', 'family_name',
      'last-name', 'lastname', 'name_last'
    ],
    email: [
      'email', 'emailAddress', 'email_address', 'e_mail', 'e-mail',
      'mail', 'email-address', 'user_email'
    ],
    phone: [
      'phone', 'phoneNumber', 'phone_number', 'telephone', 'tel',
      'mobile', 'cell', 'phone-number', 'contact_phone'
    ],
    address: [
      'address', 'street', 'streetAddress', 'street_address', 'address1',
      'address_1', 'street-address', 'home_address'
    ],
    city: [
      'city', 'town', 'locality', 'address_city', 'address-city'
    ],
    state: [
      'state', 'province', 'region', 'stateProvince', 'state_province',
      'address_state', 'address-state'
    ],
    zipCode: [
      'zip', 'zipCode', 'zip_code', 'postal', 'postalCode', 'postal_code',
      'postcode', 'zip-code', 'postal-code'
    ],
    country: [
      'country', 'nation', 'address_country', 'address-country'
    ],
    currentTitle: [
      'title', 'jobTitle', 'job_title', 'position', 'currentPosition',
      'current_position', 'job-title', 'current_title'
    ],
    experience: [
      'experience', 'years_experience', 'yearsExperience', 'work_experience',
      'workExperience', 'years-experience', 'experience_years'
    ],
    linkedinUrl: [
      'linkedin', 'linkedinUrl', 'linkedin_url', 'linkedin_profile',
      'linkedinProfile', 'linkedin-url', 'linkedin-profile'
    ],
    portfolioUrl: [
      'portfolio', 'portfolioUrl', 'portfolio_url', 'website', 'personal_website',
      'personalWebsite', 'portfolio-url', 'portfolio_website'
    ],
    githubUrl: [
      'github', 'githubUrl', 'github_url', 'github_profile', 'githubProfile',
      'github-url', 'github-profile'
    ],
    desiredSalary: [
      'salary', 'expectedSalary', 'expected_salary', 'desired_salary',
      'desiredSalary', 'salary_expectation', 'salaryExpectation'
    ],
    availableStartDate: [
      'startDate', 'start_date', 'availableDate', 'available_date',
      'availability', 'start-date', 'available-date'
    ],
    workAuthorization: [
      'workAuthorization', 'work_authorization', 'visa', 'visaStatus',
      'visa_status', 'authorization', 'work-authorization'
    ],
    willingToRelocate: [
      'relocate', 'relocation', 'willing_to_relocate', 'willingToRelocate',
      'can_relocate', 'canRelocate', 'willing-to-relocate'
    ]
  };

  mapFormFields(form: HTMLFormElement): Record<string, string> {
    const mappedFields: Record<string, string> = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    // Create a map of all form fields
    const formFields = Array.from(inputs).map((input: any) => ({
      element: input,
      name: input.name || input.id || '',
      placeholder: input.placeholder || '',
      label: this.getFieldLabel(input),
      type: input.type || input.tagName.toLowerCase(),
    }));

    // Map each field type to selectors
    Object.entries(this.fieldMappings).forEach(([fieldType, variations]) => {
      const matchingField = formFields.find(field => {
        const searchText = `${field.name} ${field.placeholder} ${field.label}`.toLowerCase();
        return variations.some(variation => 
          searchText.includes(variation.toLowerCase()) ||
          field.name.toLowerCase() === variation.toLowerCase()
        );
      });

      if (matchingField) {
        // Create a selector for this field
        const selectors = [];
        if (matchingField.name) {
          selectors.push(`[name="${matchingField.name}"]`);
          selectors.push(`[id="${matchingField.name}"]`);
        }
        if (matchingField.element.id) {
          selectors.push(`#${matchingField.element.id}`);
        }
        
        mappedFields[fieldType] = selectors.join(', ');
      }
    });

    return mappedFields;
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

  // Get field mapping suggestions for manual configuration
  getSuggestedMappings(form: HTMLFormElement): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    Array.from(inputs).forEach((input: any) => {
      const fieldInfo = {
        name: input.name || input.id || '',
        placeholder: input.placeholder || '',
        label: this.getFieldLabel(input),
        type: input.type || input.tagName.toLowerCase(),
      };

      const searchText = `${fieldInfo.name} ${fieldInfo.placeholder} ${fieldInfo.label}`.toLowerCase();
      
      // Find potential matches
      Object.entries(this.fieldMappings).forEach(([fieldType, variations]) => {
        const confidence = variations.reduce((score, variation) => {
          if (searchText.includes(variation.toLowerCase())) {
            return score + 1;
          }
          return score;
        }, 0);

        if (confidence > 0) {
          if (!suggestions[fieldType]) {
            suggestions[fieldType] = [];
          }
          suggestions[fieldType].push(`${fieldInfo.name} (${confidence} matches)`);
        }
      });
    });

    return suggestions;
  }
}