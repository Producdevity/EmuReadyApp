import { getErrorMessage } from '@/lib/utils'
import * as IntentLauncher from 'expo-intent-launcher'
import { Linking, Platform } from 'react-native'

// Eden emulator package name
const EDEN_PACKAGE = 'dev.eden.eden_emulator'
// Eden emulator custom action
const EDEN_LAUNCH_ACTION = 'dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG'
// Eden emulator activity class
const EMULATION_ACTIVITY = 'org.yuzu.yuzu_emu.activities.EmulationActivity'

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
    name: 'Known Working Config',
    description: 'Exact working configuration from Eden export',
    settings: `[Controls]
vibration_enabled\\use_global=true
enable_accurate_vibrations\\use_global=true
motion_enabled\\use_global=true


[Core]
use_multi_core\\use_global=true
memory_layout_mode\\use_global=true
use_speed_limit\\use_global=true
speed_limit\\use_global=true
sync_core_speed\\use_global=true


[Cpu]
cpu_backend\\use_global=true
cpu_accuracy\\use_global=true
use_fast_cpu_time\\use_global=true
fast_cpu_time\\use_global=true
cpu_debug_mode\\use_global=true
cpuopt_fastmem\\use_global=true
cpuopt_fastmem_exclusives\\use_global=true
cpuopt_unsafe_unfuse_fma\\use_global=true
cpuopt_unsafe_reduce_fp_error\\use_global=true
cpuopt_unsafe_ignore_standard_fpcr\\use_global=true
cpuopt_unsafe_inaccurate_nan\\use_global=true
cpuopt_unsafe_fastmem_check\\use_global=true
cpuopt_unsafe_ignore_global_monitor\\use_global=true


[Linux]
enable_gamemode\\use_global=true


[Renderer]
backend\\use_global=true
shader_backend\\use_global=true
vulkan_device\\use_global=true
frame_interpolation\\use_global=true
frame_skipping\\use_global=true
use_disk_shader_cache\\use_global=true
optimize_spirv_output\\use_global=true
use_asynchronous_gpu_emulation\\use_global=true
accelerate_astc\\use_global=true
use_vsync\\use_global=false
nvdec_emulation\\use_global=true
fullscreen_mode\\use_global=true
aspect_ratio\\use_global=true
resolution_setup\\use_global=true
scaling_filter\\use_global=true
anti_aliasing\\use_global=true
fsr_sharpening_slider\\use_global=true
bg_red\\use_global=true
bg_green\\use_global=true
bg_blue\\use_global=true
gpu_accuracy\\use_global=true
max_anisotropy\\use_global=true
astc_recompression\\use_global=true
vram_usage_mode\\use_global=true
async_presentation\\use_global=true
force_max_clock\\use_global=true
use_reactive_flushing\\use_global=true
use_asynchronous_shaders\\use_global=false
use_fast_gpu_time\\use_global=true
fast_gpu_time\\use_global=true
use_vulkan_driver_pipeline_cache\\use_global=true
enable_compute_pipelines\\use_global=true
use_video_framerate\\use_global=true
barrier_feedback_loops\\use_global=true
dyna_state\\use_global=false
provoking_vertex\\use_global=true
descriptor_indexing\\use_global=true
use_vsync\\default=false
use_vsync=0
use_asynchronous_shaders\\default=false
use_asynchronous_shaders=true
dyna_state\\default=false
dyna_state=1


[Audio]
output_engine\\use_global=true
output_device\\use_global=true
input_device\\use_global=true
volume\\use_global=true


[System]
use_lru_cache\\use_global=true
language_index\\use_global=true
region_index\\use_global=true
time_zone_index\\use_global=true
custom_rtc_enabled\\use_global=true
custom_rtc_offset\\use_global=true
rng_seed_enabled\\use_global=true
rng_seed\\use_global=true
use_docked_mode\\use_global=true
sound_index\\use_global=true


[GpuDriver]
driver_path\\use_global=false
driver_path\\default=false
driver_path=/storage/emulated/0/Android/data/dev.eden.eden_emulator/files/gpu_drivers/turnip_mrpurple-T19-toasted.adpkg.zip`,
  },
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
      throw new Error('Invalid title ID format. Must be 16-digit hexadecimal string.')
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

      console.log('=== Eden Emulator Launch Details ===')
      console.log('Package Name:', packageName)
      console.log('Launch Action:', launchAction)
      console.log('Target Class:', 'org.yuzu.yuzu_emu.activities.EmulationActivity')
      console.log('Title ID:', titleId)
      console.log('Custom Settings Length:', customSettings.length)
      console.log('Extras:', JSON.stringify(extras, null, 2))

      // Try both Linking and IntentLauncher approaches
      try {
        // First try IntentLauncher approach (more direct)
        await IntentLauncher.startActivityAsync(launchAction, {
          packageName,
          className: packageName === EDEN_PACKAGE ? EMULATION_ACTIVITY : undefined,
          extra: extras,
          flags: 268435456, // Intent.FLAG_ACTIVITY_NEW_TASK
        })
        console.log('IntentLauncher approach successful!')
      } catch (intentError) {
        console.log('IntentLauncher failed, trying Linking approach...', intentError)

        // Fallback to Linking with proper intent URI
        const intentUri = `intent://#Intent;package=${packageName};action=${launchAction};component=${packageName}/${EMULATION_ACTIVITY};S.title_id=${titleId};S.custom_settings=${encodeURIComponent(customSettings)};i.flags=268435456;end`

        const canOpen = await Linking.canOpenURL(intentUri)
        if (!canOpen) {
          throw new Error(`Cannot open intent URI for ${packageName}`)
        }

        await Linking.openURL(intentUri)
        console.log('Linking approach successful!')
      }

      console.log('Intent launch successful!')
    } catch (error) {
      console.error('Intent launch failed:', error)
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      })

      const actionUsed =
        packageName === EDEN_PACKAGE
          ? EDEN_LAUNCH_ACTION
          : `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`

      throw new Error(
        `Failed to launch emulator (${packageName}). Please ensure the emulator is installed on your device.
        
        Launch Action: ${actionUsed}
        Package: ${packageName}
        Activity: org.yuzu.yuzu_emu.activities.EmulationActivity
        Error: ${getErrorMessage(error)}`,
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

  static async launchGameWithTitleOnly({
    titleId,
    packageName = EDEN_PACKAGE,
  }: {
    titleId: string
    packageName?: string
  }): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Emulator integration is only available on Android')
    }

    if (!this.validateTitleId(titleId)) {
      throw new Error('Invalid title ID format. Must be 16-digit hexadecimal string.')
    }

    try {
      console.log('=== Eden Emulator Title-Only Launch ===')
      console.log('Package Name:', packageName)
      console.log('Title ID:', titleId)
      console.log('Using game default settings')

      // Launch using the custom action but with only title_id, no custom_settings
      const launchAction =
        packageName === EDEN_PACKAGE
          ? EDEN_LAUNCH_ACTION
          : `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`

      // Pass empty string for custom_settings to indicate no custom config
      const intentExtras = {
        title_id: titleId,
        custom_settings: '', // Empty string instead of null or omitting
      }

      // Explicitly log what we're sending to diagnose the issue
      console.log('Intent extras being sent:', JSON.stringify(intentExtras, null, 2))

      // Try without specifying className to let Android resolve the correct activity
      await IntentLauncher.startActivityAsync(launchAction, {
        packageName,
        // className: packageName === EDEN_PACKAGE ? EMULATION_ACTIVITY : undefined,
        extra: intentExtras,
        flags: 268435456, // Intent.FLAG_ACTIVITY_NEW_TASK
      })

      console.log('Title-only launch successful!')
    } catch (error) {
      console.error('Title-only launch failed:', error)

      throw new Error(
        `Failed to launch emulator (${packageName}) with title only.
        
        Launch Action: ${
          packageName === EDEN_PACKAGE
            ? EDEN_LAUNCH_ACTION
            : `${packageName}.LAUNCH_WITH_CUSTOM_CONFIG`
        }
        Package: ${packageName}
        Title ID: ${titleId}
        Error: ${getErrorMessage(error)}`,
      )
    }
  }
}
