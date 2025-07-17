import { getErrorMessage } from '@/lib/utils'
import * as IntentLauncher from 'expo-intent-launcher'
import { Linking, Platform } from 'react-native'

// Alternative launch methods for Eden emulator using expo-intent-launcher
export class EmulatorAltService {
  // Method 1: Try using direct intent launch
  static async launchWithDirectIntent(
    titleId: string,
    customSettings: string,
    packageName: string = 'dev.eden.eden_emulator',
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    try {
      await IntentLauncher.startActivityAsync(`${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`, {
        packageName: packageName,
        className: 'org.yuzu.yuzu_emu.activities.EmulationActivity',
        extra: {
          title_id: titleId,
          custom_settings: customSettings,
        },
      })
    } catch (error) {
      console.log('Direct intent method failed:', error)
      throw new Error(`Direct intent failed: ${getErrorMessage(error)}`)
    }
  }

  // Method 2: Check if installed using expo-intent-launcher (non-intrusive)
  static async checkIfInstalled(packageName: string = 'dev.eden.eden_emulator'): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false
    }

    console.log(`Checking installation of package: ${packageName}`)

    // Use expo-intent-launcher to check if app is installed without launching it
    try {
      console.log('Trying expo-intent-launcher getApplicationIconAsync...')
      // This method will throw an error if the app is not installed
      const icon = await IntentLauncher.getApplicationIconAsync(packageName)
      console.log(`Package ${packageName} installed: true (icon retrieved successfully)`)
      console.log(`Icon length: ${icon.length} characters`)
      return true
    } catch (error) {
      console.log('getApplicationIconAsync failed:', error)
      console.log(`Package ${packageName} installation status: false`)
      return false
    }
  }

  // Method 3: Try opening with Linking API using intent URIs
  static async launchWithLinking(
    titleId: string,
    customSettings: string,
    packageName: string = 'dev.eden.eden_emulator',
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
      `intent://launch#Intent;scheme=eden;package=${packageName};action=${packageName}.LAUNCH_WITH_CUSTOM_CONFIG;S.title_id=${encodedTitleId};S.custom_settings=${encodedSettings};end`,
      // Simple package launch
      `intent:#Intent;package=${packageName};action=${packageName}.LAUNCH_WITH_CUSTOM_CONFIG;S.title_id=${encodedTitleId};S.custom_settings=${encodedSettings};end`,
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
      // Just open the app without any data using main action
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName,
        // className: 'org.yuzu.yuzu_emu.activities.EmulationActivity',
        className: 'org.yuzu.yuzu_emu.ui.main.MainActivity',
        category: 'android.intent.category.LAUNCHER',
        flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
      })
    } catch (error) {
      console.log('Simple app launch failed:', error)
      throw new Error(`Could not launch ${packageName}: ${getErrorMessage(error)}`)
    }
  }

  // Method 5: Try with different package names
  static async tryDifferentPackageNames(titleId: string, customSettings: string): Promise<void> {
    const possiblePackages = [
      'dev.eden.eden_emulator',
      'com.eden.eden_emulator',
      'com.eden.emulator',
      'org.yuzu.yuzu_emu',
    ]

    for (const pkg of possiblePackages) {
      try {
        console.log(`Trying package: ${pkg}`)
        const isInstalled = await this.checkIfInstalled(pkg)
        if (isInstalled) {
          console.log(`Found installed package: ${pkg}`)
          await this.launchWithDirectIntent(titleId, customSettings, pkg)
          return
        }
      } catch (error) {
        console.log(`Failed with package ${pkg}:`, error)
      }
    }

    throw new Error('Could not find any compatible emulator package')
  }

  // Method 6: Launch with title ID only (no custom settings)
  static async launchWithTitleOnly(
    titleId: string,
    packageName: string = 'dev.eden.eden_emulator',
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    try {
      console.log('=== Eden Emulator Title-Only Launch ===')
      console.log('Package Name:', packageName)
      console.log('Title ID:', titleId)
      console.log('Custom Settings: NONE (using game defaults)')

      // Only pass title_id, omit custom_settings entirely
      // This allows Eden's getStringExtra to return null as expected
      const intentExtras = {
        title_id: titleId,
        // custom_settings is omitted entirely
      }

      // Explicitly log what we're sending to diagnose the issue
      console.log('Intent extras being sent:', JSON.stringify(intentExtras, null, 2))

      // Try without specifying className to let Android resolve the correct activity
      await IntentLauncher.startActivityAsync(`${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`, {
        packageName: packageName,
        // className: 'org.yuzu.yuzu_emu.activities.EmulationActivity',
        extra: intentExtras,
      })

      console.log('Title-only launch successful!')
    } catch (error) {
      console.log('Title-only launch failed:', error)
      throw new Error(`Failed to launch with title only: ${getErrorMessage(error)}`)
    }
  }

  // Method 7: Log available methods
  static logAvailableMethods(): void {
    console.log('=== Available Launch Methods ===')
    console.log('1. launchWithDirectIntent - Direct intent with expo-intent-launcher')
    console.log('2. checkIfInstalled - Check if package is installed')
    console.log('3. launchWithLinking - Launch using Linking API with intent URIs')
    console.log('4. launchAppOnly - Launch app without custom data')
    console.log('5. tryDifferentPackageNames - Try multiple package names')
    console.log('6. launchWithTitleOnly - Launch with title ID only (no custom settings)')
  }
}
