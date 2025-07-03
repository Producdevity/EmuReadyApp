import { Platform, Linking } from 'react-native'
import SendIntentAndroid from 'react-native-send-intent'

// Alternative launch methods for Eden emulator using REAL react-native-send-intent methods
export class EmulatorAltService {
  // Method 1: Try using the real openApp method (this exists!)
  static async launchWithOpenApp(
    titleId: string,
    customSettings: string,
    packageName: string = 'dev.eden.eden_emulator'
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    try {
      // openApp(packageName, extras) - this method actually exists
      await SendIntentAndroid.openApp(packageName, {
        title_id: titleId,
        custom_settings: customSettings,
      })
    } catch (error) {
      console.log('openApp method failed:', error)
      throw new Error(`openApp failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Method 2: Check if installed using the real isAppInstalled method
  static async checkIfInstalled(packageName: string = 'dev.eden.eden_emulator'): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false
    }

    try {
      // isAppInstalled(packageName) - this method actually exists
      const installed = await SendIntentAndroid.isAppInstalled(packageName)
      console.log(`Package ${packageName} installed:`, installed)
      return installed
    } catch (error) {
      console.log('isAppInstalled check failed:', error)
      return false
    }
  }

  // Method 3: Try opening with Linking API using intent URIs
  static async launchWithLinking(
    titleId: string,
    customSettings: string,
    packageName: string = 'dev.eden.eden_emulator'
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    // Build Android intent URIs
    const encodedSettings = encodeURIComponent(customSettings)
    const encodedTitleId = encodeURIComponent(titleId)
    
    // Try different URI formats that Android supports
    const uris = [
      // Standard intent URI format
      `intent://launch#Intent;scheme=eden;package=${packageName};action=dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG;S.title_id=${encodedTitleId};S.custom_settings=${encodedSettings};end`,
      // Simple package launch
      `intent:#Intent;package=${packageName};action=dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG;S.title_id=${encodedTitleId};S.custom_settings=${encodedSettings};end`,
      // Try to launch main activity with extras
      `intent:#Intent;package=${packageName};component=${packageName}/.MainActivity;S.title_id=${encodedTitleId};S.custom_settings=${encodedSettings};end`,
    ]

    for (const uri of uris) {
      try {
        console.log('Trying intent URI:', uri)
        const canOpen = await Linking.canOpenURL(uri)
        console.log('Can open URI?', canOpen)
        if (canOpen) {
          await Linking.openURL(uri)
          return
        }
      } catch (error) {
        console.log('Intent URI failed:', uri, error)
      }
    }

    throw new Error('Could not open Eden emulator with any intent URI')
  }

  // Method 4: Just launch the app normally (without custom data)
  static async launchAppOnly(packageName: string = 'dev.eden.eden_emulator'): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    try {
      // Just open the app without any data
      await SendIntentAndroid.openApp(packageName, {})
    } catch (error) {
      console.log('Simple app launch failed:', error)
      throw new Error(`Could not launch ${packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Method 5: Try with different package names
  static async tryDifferentPackageNames(
    titleId: string,
    customSettings: string
  ): Promise<void> {
    const possiblePackages = [
      'dev.eden.eden_emulator',
      'org.yuzu.yuzu_emu',
      'dev.eden.edenemu',
      'com.eden.emulator',
    ]

    for (const pkg of possiblePackages) {
      try {
        console.log(`Trying package: ${pkg}`)
        const isInstalled = await this.checkIfInstalled(pkg)
        if (isInstalled) {
          console.log(`Found installed package: ${pkg}`)
          await this.launchWithOpenApp(titleId, customSettings, pkg)
          return
        }
      } catch (error) {
        console.log(`Failed with package ${pkg}:`, error)
      }
    }

    throw new Error('Could not find any compatible emulator package')
  }

  // Method 6: Log all REAL available methods for debugging
  static logAvailableMethods(): void {
    console.log('=== REAL SendIntentAndroid Methods ===')
    console.log('Available methods:', Object.keys(SendIntentAndroid))
    
    // Check the actual documented methods
    const realMethods = [
      'sendText',
      'sendMail', 
      'sendSms',
      'sendPhoneCall',
      'sendPhoneDial',
      'addCalendarEvent',
      'isAppInstalled',
      'installRemoteApp',
      'openApp',
      'openAppWithData',
      'openChromeIntent',
      'openCalendar',
      'openCamera',
      'openEmailApp',
      'openAllEmailApp',
      'openDownloadManager',
      'openChooserWithOptions',
      'openChooserWithMultipleOptions',
      'openMaps',
      'openMapsWithRoute',
      'shareTextToLine',
      'shareImageToInstagram',
      'openSettings'
    ]

    realMethods.forEach(method => {
      console.log(`- ${method}:`, typeof (SendIntentAndroid as any)[method])
    })
  }
}