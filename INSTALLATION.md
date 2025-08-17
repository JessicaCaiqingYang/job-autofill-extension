# 🚀 Job Autofill Extension - Installation Guide

## ✅ Extension Successfully Built!

Your job application autofill Chrome extension has been successfully built and is ready to install.

## 📦 Installation Steps

### 1. Open Chrome Extensions Page
- Open Google Chrome
- Navigate to `chrome://extensions/`
- Or click the three dots menu → More tools → Extensions

### 2. Enable Developer Mode
- Toggle the "Developer mode" switch in the top-right corner
- This will show additional options for loading unpacked extensions

### 3. Load the Extension
- Click "Load unpacked" button
- Navigate to your project folder
- Select the `dist` folder (this contains all the built extension files)
- Click "Select Folder"

### 4. Verify Installation
- You should see "Job Autofill" extension appear in your extensions list
- The extension icon should appear in your Chrome toolbar
- Make sure the extension is enabled (toggle switch is on)

## 🎯 How to Use

### Setting Up Your Profile
1. **Click the extension icon** in Chrome toolbar
2. **Fill out your information** in the popup:
   - Personal Info: Name, email, phone, address
   - Work Info: Job title, experience, skills, LinkedIn
   - Preferences: Salary, start date, work authorization
3. **Save your profile**

### Using Autofill
1. **Visit a job site** (LinkedIn, Indeed, Glassdoor, etc.)
2. **Open a job application form**
3. **Look for the floating autofill button** that appears
4. **Click "Autofill Form"** to populate fields automatically
5. **Review and submit** your application

## 🔧 Supported Job Sites

The extension works on:
- ✅ LinkedIn Jobs
- ✅ Indeed
- ✅ Glassdoor
- ✅ Monster
- ✅ ZipRecruiter
- ✅ And many more job sites

## 🛠️ Features Available

### ✨ Smart Form Detection
- Automatically detects job application forms
- Works with dynamic React/Vue applications
- Handles multiple form types

### 🎨 User Interface
- **Popup**: Complete profile management
- **Floating UI**: Non-intrusive autofill button on job sites
- **Settings**: Configure site-specific mappings

### 💾 Data Management
- **Local Storage**: All data stays on your computer
- **Export/Import**: Backup your profile as JSON
- **Privacy First**: No data sent to external servers

## 🔍 Troubleshooting

### Extension Not Loading
- Make sure you selected the `dist` folder, not the project root
- Check that Developer mode is enabled
- Try refreshing the extensions page

### Autofill Not Working
- Make sure your profile is completely filled out
- The floating button may take a moment to appear on new sites
- Some sites may require custom field mapping (available in settings)

### Form Not Detected
- The extension works best on major job sites
- Try refreshing the page if forms aren't detected
- Check that the extension is enabled for the current site

## 🔄 Development Mode

If you want to make changes to the extension:

```bash
# Start development mode with hot reload
npx pnpm dev

# Rebuild after changes
npx pnpm build
```

Then reload the extension in Chrome by clicking the refresh icon on the extension card.

## 📞 Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Look at the browser console for error messages
3. Try disabling and re-enabling the extension
4. Reload the extension after making changes

## 🎉 You're Ready!

Your job application autofill extension is now installed and ready to help you apply for jobs more efficiently. Happy job hunting! 🚀