const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults

    // Add queries to the manifest
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = []
    }

    // Query for specific package by name
    androidManifest.manifest.queries.push({
      package: [{ $: { 'android:name': 'dev.eden.eden_emulator' } }],
    })

    // Query for custom emulator action with DEFAULT category as declared by Eden
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'dev.eden.eden_emulator.LAUNCH_WITH_CUSTOM_CONFIG' } }],
          category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        },
      ],
    })

    // Query for VIEW action with intent scheme (for intent:// URLs)
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'intent' } }],
        },
      ],
    })

    // Query for VIEW action with market scheme (for market:// URLs)
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'market' } }],
        },
      ],
    })

    // Query for MAIN action with LAUNCHER category (for app detection)
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
        },
      ],
    })

    // Query for SEND action (for sharing functionality)
    androidManifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
          data: [{ $: { 'android:mimeType': 'text/plain' } }],
        },
      ],
    })

    console.log('Android manifest queries configured for package visibility')
    return config
  })
}
