export type TouchedFiles = string[]

declare module 'claude-code' {
  interface PluginState {
    'touched-only': { files: TouchedFiles }
  }
}
