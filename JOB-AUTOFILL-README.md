# Job Application Autofill Chrome Extension

A powerful Chrome extension built with React, Vite, and TypeScript that automatically fills job application forms with your personal information.

## 🚀 Features

### Core Functionality
- **Smart Form Detection**: Automatically detects job application forms on major job sites
- **One-Click Autofill**: Fill entire forms with a single click
- **Profile Management**: Store and manage your personal, work, and preference information
- **Site-Specific Configuration**: Customize field mappings for different job sites
- **Export/Import Profiles**: Backup and share your profile data

### Supported Components

#### A. Content Script (`pages/content/`)
- **Purpose**: Detect and interact with job application forms
- **Key Functions**:
  - Scan pages for form fields
  - Map fields to your data schema
  - Inject user data into forms
  - Handle dynamic forms (React/Vue apps)

#### B. Content UI (`pages/content-ui/`)
- **Purpose**: Floating UI overlay on job sites
- **Features**:
  - Autofill trigger button
  - Quick preview of data to be filled
  - Field mapping interface
  - Real-time form detection

#### C. Popup (`pages/popup/`)
- **Purpose**: Main extension interface
- **Features**:
  - User profile management
  - Data entry forms
  - Settings and preferences
  - Export/import profiles

#### D. Background Script (`pages/background/`)
- **Purpose**: Handle cross-tab communication and storage
- **Features**:
  - Data synchronization
  - Site-specific configurations
  - Update management
  - Form detection coordination

## 🛠️ Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with Turborepo
- **Styling**: Tailwind CSS
- **Extension**: Chrome Manifest V3
- **Storage**: Chrome Extension Storage API
- **Architecture**: Modular monorepo structure

## 📦 Installation

### Prerequisites
- Node.js >= 22.15.1
- pnpm package manager

### Setup
1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
```

### Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## 🎯 Usage

### Setting Up Your Profile
1. Click the extension icon in Chrome toolbar
2. Fill out your personal information in the popup
3. Add work experience and preferences
4. Save your profile

### Using Autofill
1. Navigate to a job site (LinkedIn, Indeed, Glassdoor, etc.)
2. Open a job application form
3. Look for the floating autofill button
4. Click "Autofill Form" to populate fields
5. Review and submit your application

### Customizing Field Mappings
1. Open the extension popup
2. Go to Settings tab
3. Configure site-specific field mappings
4. Enable/disable sites as needed

## 🏗️ Project Structure

```
├── pages/
│   ├── background/          # Background script
│   ├── content/            # Content script for form detection
│   ├── content-ui/         # Floating UI overlay
│   ├── popup/              # Extension popup interface
│   └── options/            # Options page
├── packages/
│   ├── storage/            # Data storage utilities
│   ├── shared/             # Shared utilities
│   └── ui/                 # UI components
└── chrome-extension/       # Extension manifest and assets
```

## 🔧 Configuration

### Supported Job Sites
- LinkedIn Jobs
- Indeed
- Glassdoor
- Monster
- ZipRecruiter
- And more...

### Custom Site Configuration
Add new job sites by configuring field mappings in the options page or by modifying the site configurations in the background script.

## 📊 Data Schema

### User Profile Structure
```typescript
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
```

## 🔒 Privacy & Security

- All data is stored locally in Chrome's extension storage
- No data is sent to external servers
- Profile information is only used for form filling
- Export/import functionality for data portability

## 🚀 Development Commands

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Clean build artifacts
pnpm clean

# Create extension package
pnpm zip
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built on top of the excellent [Chrome Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) by Jonghakseo.

## 🔧 Troubleshooting

### Node.js Version Issues
This project requires Node.js >= 22.15.1. If you're getting version errors:

1. Install Node Version Manager (nvm):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Install and use the required Node version:
   ```bash
   nvm install 22.15.1
   nvm use 22.15.1
   ```

3. Install pnpm:
   ```bash
   npm install -g pnpm
   ```

### Extension Loading Issues
- Make sure to build the extension first with `pnpm build`
- Check that the `dist` folder exists and contains the built files
- Verify that Chrome Developer Mode is enabled
- Try reloading the extension if changes aren't reflected

### Form Detection Issues
- The extension works best on major job sites
- Some sites may require custom field mapping configuration
- Dynamic forms (React/Vue) are supported but may need a moment to load

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Look through existing GitHub issues
3. Create a new issue with detailed information about your problem