# Background Script

This is the background script for the Job Application Autofill Chrome extension. It handles:

## Features

- **Data Storage**: Manages user profile and site configuration data
- **Cross-tab Communication**: Handles messages between content scripts and popup
- **Form Autofill**: Coordinates autofilling of job application forms
- **Site Detection**: Detects when users visit supported job sites
- **Configuration Management**: Manages site-specific field mappings

## Key Functions

### User Profile Management
- `GET_USER_PROFILE`: Retrieves stored user profile data
- `UPDATE_USER_PROFILE`: Updates user profile information

### Site Configuration
- `GET_SITE_CONFIG`: Gets configuration for specific domains
- `UPDATE_SITE_CONFIG`: Updates site-specific settings

### Form Handling
- `AUTOFILL_FORM`: Fills form fields with user data
- `DETECT_FORMS`: Scans page for job application forms

## Supported Job Sites

The extension comes pre-configured for:
- LinkedIn
- Indeed
- Glassdoor

Additional sites can be configured through the options page.