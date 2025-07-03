import { Platform } from 'react-native'
import SendIntentAndroid from 'react-native-send-intent'

// Eden emulator package name
const EDEN_PACKAGE = 'dev.eden.eden_emulator'
// Eden emulator custom action
const EDEN_LAUNCH_ACTION = 'dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG'

export interface EmulatorConfig {
  titleId: string
  customSettings: string
  packageName?: string
}

export interface EmulatorPreset {
  name: string
  description: string
  settings: string
}

export const EMULATOR_PRESETS: EmulatorPreset[] = [
  {
    name: 'High Performance',
    description: 'Optimized for maximum performance and frame rate',
    settings: `[Core]
use_multi_core\\\\use_global=false
use_multi_core=1

[Cpu]
cpu_accuracy\\\\use_global=false
cpu_accuracy=0

[Renderer]
use_vsync\\\\use_global=false
use_vsync=0
use_asynchronous_shaders\\\\use_global=false
use_asynchronous_shaders=1
gpu_accuracy\\\\use_global=false
gpu_accuracy=0

[System]
use_docked_mode\\\\use_global=false
use_docked_mode=1`,
  },
  {
    name: 'Battery Optimized',
    description: 'Balanced settings for extended battery life',
    settings: `[Core]
use_speed_limit\\\\use_global=false
use_speed_limit=1
speed_limit\\\\use_global=false
speed_limit=50

[Renderer]
use_vsync\\\\use_global=false
use_vsync=1
resolution_setup\\\\use_global=false
resolution_setup=2

[System]
use_docked_mode\\\\use_global=false
use_docked_mode=0`,
  },
  {
    name: 'Balanced',
    description: 'Default optimized settings for most games',
    settings: `[Controls]
vibration_enabled\\\\use_global=true
enable_accurate_vibrations\\\\use_global=true
motion_enabled\\\\use_global=true

[Core]
use_multi_core\\\\use_global=true
memory_layout_mode\\\\use_global=true
use_speed_limit\\\\use_global=true

[Renderer]
backend\\\\use_global=true
shader_backend\\\\use_global=true
use_vsync\\\\use_global=false
use_vsync\\\\default=false
use_vsync=0
use_asynchronous_shaders\\\\use_global=false
use_asynchronous_shaders\\\\default=false
use_asynchronous_shaders=true

[Audio]
output_engine\\\\use_global=true
volume\\\\use_global=true

[System]
use_docked_mode\\\\use_global=true
language_index\\\\use_global=true`,
  },
]

export class EmulatorService {
  static validateTitleId(titleId: string): boolean {
    const regex = /^[0-9A-Fa-f]{16}$/
    return regex.test(titleId)
  }

  static async launchGameWithCustomSettings({
    titleId,
    customSettings,
    packageName = EDEN_PACKAGE,
  }: EmulatorConfig): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Emulator integration is only available on Android')
    }

    if (!this.validateTitleId(titleId)) {
      throw new Error(
        'Invalid title ID format. Must be 16-digit hexadecimal string.',
      )
    }

    // Note: We'll attempt to launch regardless of installation check
    // since Eden emulator may not be on Play Store but could be sideloaded

    try {
      const extras = {
        title_id: titleId,
        custom_settings: customSettings,
      }

      // For Eden emulator, use the exact action from the source code
      // For other emulators, we assume they follow the same pattern
      const launchAction =
        packageName === EDEN_PACKAGE
          ? EDEN_LAUNCH_ACTION
          : `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`

      console.log('Attempting to launch emulator with:', {
        packageName,
        launchAction,
        titleId,
        customSettingsLength: customSettings.length,
      })

      await SendIntentAndroid.openAppWithData(extras, launchAction, packageName)
    } catch (error) {
      console.error('Failed to launch emulator:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        packageName,
        action: packageName === EDEN_PACKAGE ? EDEN_LAUNCH_ACTION : `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`,
      })
      throw new Error(
        `Failed to launch emulator (${packageName}). Please ensure the emulator is installed on your device.`,
      )
    }
  }

  static async launchGameWithPreset(
    titleId: string,
    presetName: string,
    packageName?: string,
  ): Promise<void> {
    const preset = EMULATOR_PRESETS.find((p) => p.name === presetName)
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`)
    }

    await this.launchGameWithCustomSettings({
      titleId,
      customSettings: preset.settings,
      packageName,
    })
  }
}
