1. API → EmuReady (JSON)

API Response:
{
"titleId": "0100000000001000",
"configuration": {
"sections": {
"Controls": {
"vibration_enabled\\use_global": "true",
"enable_accurate_vibrations\\use_global": "true"
},
"Renderer": {
"use_vsync\\use_global": "false",
"use_vsync\\default": "false",
"use_vsync": "0"
},
"GpuDriver": {
"driver_path\\use_global": "false",
"driver_path\\default": "false",
"driver_path": "/storage/emulated/0/Android/data/dev.eden.eden_emulator/files/gpu_drivers/
turnip_mrpurple-T19-toasted.adpkg.zip"
}
}
}
}

2. EmuReady Processing

Convert JSON to INI string:
data class EmulatorConfiguration(
val sections: Map<String, Map<String, String>>
) {
fun toINIFormat(): String {
return sections.entries.joinToString("\n\n") { (sectionName, properties) ->
"[$sectionName]\n" + properties.entries.joinToString("\n") { (key, value) ->
"$key=$value"
}
}
}
}

3. EmuReady → Eden (Intent with String)

Your existing code is perfect:
val intent = Intent().apply {
action = EDEN_LAUNCH_ACTION
putExtra("title_id", titleId)
putExtra("custom_settings", configuration.toINIFormat()) // Just a plain string!
addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

4. Why This Works

- No encoding needed: Android Intent extras handle UTF-8 strings automatically
- No escaping needed: The INI format doesn't contain special characters that break Intent strings
- Size limit: Intent extras can handle ~500KB, your INI is maybe 2-3KB
- Eden expects it: CustomSettingsHandler.kt already expects a plain string and writes it directly
  to file

Example Full Flow

API sends:
{"sections": {"Renderer": {"use_vsync": "0"}}}

EmuReady converts to:
[Renderer]
use_vsync=0

Eden receives and writes to:
/config/custom/0100000000001000.ini
