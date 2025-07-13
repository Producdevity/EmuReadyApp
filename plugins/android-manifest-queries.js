const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults

    // Add queries to the manifest
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = []
    }

    androidManifest.manifest.queries.push({
      package: [{ $: { 'android:name': 'dev.eden.eden_emulator' } }],
    })

    androidManifest.manifest.queries.push({
      intent: [
        { action: [{ $: { 'android:name': 'dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG' } }] },
      ],
    })

    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'intent' } }],
        },
      ],
    })

    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'market' } }],
        },
      ],
    })

    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
        },
      ],
    })

    return config
  })
}
