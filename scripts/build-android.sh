#!/bin/bash

# EmuReady Android Build Script
# This script builds the Android APK locally

set -e

echo "🚀 Starting EmuReady Android build (unsigned APK for testing)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found. Creating a basic one...${NC}"
    cat > .env << EOF
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dummy_key_for_build
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_NAME=EmuReady
EXPO_PUBLIC_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
EXPO_PUBLIC_DEVELOPER=EmuReady Team
EXPO_PUBLIC_SUPPORT_EMAIL=support@emuready.com
EXPO_PUBLIC_PRIVACY_URL=https://emuready.com/privacy
EXPO_PUBLIC_TERMS_URL=https://emuready.com/terms
EOF
    echo -e "${GREEN}✅ Created .env file with default values${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}⚠️  Expo CLI not found. Installing...${NC}"
    npm install -g @expo/cli@latest
fi

# Run prebuild
echo -e "${BLUE}🔨 Running Expo prebuild...${NC}"
npx expo prebuild --platform android

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Error: Android directory not found after prebuild.${NC}"
    exit 1
fi

# Make gradlew executable
echo -e "${BLUE}🔧 Setting up Android build...${NC}"
chmod +x ./android/gradlew

# Build the APK
echo -e "${BLUE}🏗️  Building Android APK...${NC}"
cd android
./gradlew assembleRelease --no-daemon

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo -e "${GREEN}✅ Unsigned APK built successfully!${NC}"
    echo -e "${GREEN}📱 APK location: android/$APK_PATH${NC}"
    
    # Get APK size
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${BLUE}📏 APK size: $APK_SIZE${NC}"
    
    # Copy APK to project root for easier access
    cp "$APK_PATH" "../emuready-app-unsigned.apk"
    echo -e "${GREEN}📋 APK copied to project root as 'emuready-app-unsigned.apk'${NC}"
else
    echo -e "${RED}❌ Error: APK not found at expected location.${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Build complete!${NC}"
echo -e "${YELLOW}📝 Note: This is an unsigned APK for testing only${NC}"
echo -e "${BLUE}💡 To install on device: adb install emuready-app-unsigned.apk${NC}"
echo -e "${BLUE}💡 Enable 'Install from unknown sources' on your Android device${NC}"