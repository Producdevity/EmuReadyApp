import { getErrorMessage } from '@/lib/utils'
import { Platform, Linking } from 'react-native'
import * as IntentLauncher from 'expo-intent-launcher'

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
      await IntentLauncher.startActivityAsync(
        `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`,
        {
          packageName: packageName,
          className: 'org.yuzu.yuzu_emu.activities.EmulationActivity',
          extra: {
            title_id: titleId,
            custom_settings: customSettings,
          },
        },
      )
    } catch (error) {
      console.log('Direct intent method failed:', error)
      throw new Error(`Direct intent failed: ${getErrorMessage(error)}`)
    }
  }

  // Method 2: Check if installed using multiple approaches
  static async checkIfInstalled(
    packageName: string = 'dev.eden.eden_emulator',
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false
    }

    console.log(`Checking installation of package: ${packageName}`)

    // Try multiple intent URI formats
    const intentUris = [
      // Custom action intent
      `intent://launch#Intent;package=${packageName};action=${packageName}.LAUNCH_WITH_CUSTOM_CONFIG;end`,
      // Simple package intent  
      `intent:#Intent;package=${packageName};end`,
      // Market intent (will return false if package is installed)
      `market://details?id=${packageName}`,
    ]

    for (const uri of intentUris) {
      try {
        console.log(`Trying intent URI: ${uri}`)
        const canOpen = await Linking.canOpenURL(uri)
        console.log(`Can open ${uri}: ${canOpen}`)
        
        // For market:// URI, if it can open, the app is NOT installed
        // For intent:// URIs, if it can open, the app IS installed
        if (uri.startsWith('market://')) {
          if (!canOpen) {
            console.log(`Package ${packageName} installed: true (market check failed)`)
            return true
          }
        } else {
          if (canOpen) {
            console.log(`Package ${packageName} installed: true (intent check passed)`)
            return true
          }
        }
      } catch (error) {
        console.log(`Intent URI failed: ${uri}`, error)
      }
    }

    console.log(`Package ${packageName} installation status: false`)
    return false
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
  static async launchAppOnly(
    packageName: string = 'dev.eden.eden_emulator',
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android')
    }

    try {
      // Just open the app without any data using main action
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName,
      })
    } catch (error) {
      console.log('Simple app launch failed:', error)
      throw new Error(
        `Could not launch ${packageName}: ${getErrorMessage(error)}`,
      )
    }
  }

  // Method 5: Try with different package names
  static async tryDifferentPackageNames(
    titleId: string,
    customSettings: string,
  ): Promise<void> {
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

  // Method 6: Log available methods
  static logAvailableMethods(): void {
    console.log('=== Available Launch Methods ===')
    console.log(
      '1. launchWithDirectIntent - Direct intent with expo-intent-launcher',
    )
    console.log('2. checkIfInstalled - Check if package is installed')
    console.log(
      '3. launchWithLinking - Launch using Linking API with intent URIs',
    )
    console.log('4. launchAppOnly - Launch app without custom data')
    console.log('5. tryDifferentPackageNames - Try multiple package names')
  }
}
