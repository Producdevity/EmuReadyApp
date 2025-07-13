# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated building and testing of the EmuReady Android app.

## Workflows

### 1. `ci.yml` - Continuous Integration

**Triggers:** Push/PR to main, master, or develop branches

- Runs ESLint and TypeScript checks
- Performs security audits
- Validates that the project builds correctly

### 2. `build-android.yml` - Basic Android Build

**Triggers:** Push to main/master, PRs, manual dispatch

- Builds unsigned Android APK
- Uses fallback environment variables for missing secrets
- Uploads APK as GitHub artifact
- Automatically attaches APK to releases when tags are pushed

### 3. `build-signed-android.yml` - Production Android Build

**Triggers:** Version tags (v\*), manual dispatch

- Builds signed Android APK (if keystore secrets are configured)
- Uses production environment variables
- Creates GitHub releases with attached APK
- Includes version numbering and build metadata

## Setup Instructions

### Required Secrets (for signed builds)

Add these secrets in to GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Environment Variables

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_DEVELOPER=Your Company Name
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourcompany.com
EXPO_PUBLIC_PRIVACY_URL=https://yourcompany.com/privacy
EXPO_PUBLIC_TERMS_URL=https://yourcompany.com/terms
```

#### Android Signing (Optional)

```
ANDROID_KEYSTORE_BASE64=<base64 encoded keystore file>
ANDROID_KEY_ALIAS=your_key_alias
ANDROID_STORE_PASSWORD=your_store_password
ANDROID_KEY_PASSWORD=your_key_password
```

### Creating Android Keystore

1. Generate a keystore file:

```bash
keytool -genkey -v -keystore release.keystore -alias your_key_alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Convert to base64:

```bash
base64 -w 0 release.keystore > keystore_base64.txt
```

3. Copy the contents of `keystore_base64.txt` to the `ANDROID_KEYSTORE_BASE64` secret.

## Usage

### Automatic Builds

- **Development:** Push to main/master triggers unsigned APK build
- **Production:** Create a git tag starting with 'v' (e.g., `v1.0.0`) to trigger signed APK build and release

### Manual Builds

- Go to Actions tab in your GitHub repository
- Select "Build Android APK" or "Build Signed Android APK"
- Click "Run workflow"
- For signed builds, optionally specify a version number

### Downloading APKs

- **From Actions:** Go to the completed workflow run and download the artifact
- **From Releases:** Tagged builds automatically create releases with attached APKs

## Workflow Features

### Build Artifacts

- APK files are uploaded as GitHub artifacts
- Artifacts are retained for 30 days (basic) or 90 days (signed)
- Filenames include version and build number for easy identification

### Error Handling

- Workflows continue even if optional steps fail
- Unsigned builds work even without signing secrets
- Fallback environment variables prevent build failures

### Version Management

- Build numbers automatically increment with each run
- Version numbers can be specified manually or derived from git tags
- APK filenames include version metadata

## Troubleshooting

### Common Issues

1. **Build fails due to missing environment variables**

   - Add required secrets to repository settings
   - Check that secret names match exactly

2. **Signing fails**

   - Verify keystore base64 encoding is correct
   - Ensure key alias and passwords match keystore
   - Check that keystore is valid and not corrupted

3. **Prebuild fails**

   - Ensure all dependencies are properly specified in package.json
   - Check that app.json/app.config.js is valid
   - Verify that Expo SDK version is compatible

4. **APK not generated**
   - Check Android build logs in the workflow
   - Ensure gradlew has execute permissions
   - Verify that Android SDK setup completed successfully

### Debug Tips

- Enable "Re-run all jobs" with debug logging enabled
- Check the "Set up job" step for environment issues
- Review the full build logs for specific error messages
