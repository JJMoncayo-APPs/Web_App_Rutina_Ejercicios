// src/services/appSettingsService.js

const SETTINGS_STORAGE_KEY = 'freeletics-app-settings'

const DEFAULT_SETTINGS = {
  soundsEnabled: true,
  vibrationEnabled: true,
  preparationSeconds: 5,
  physicalWarningsEnabled: true,
}

const VALID_PREPARATION_SECONDS = [3, 5, 10]

const normalizeSettings = (settings = {}) => {
  const preparationSeconds = VALID_PREPARATION_SECONDS.includes(
    Number(settings.preparationSeconds)
  )
    ? Number(settings.preparationSeconds)
    : DEFAULT_SETTINGS.preparationSeconds

  return {
    soundsEnabled:
      settings.soundsEnabled === undefined
        ? DEFAULT_SETTINGS.soundsEnabled
        : settings.soundsEnabled === true,
    vibrationEnabled:
      settings.vibrationEnabled === undefined
        ? DEFAULT_SETTINGS.vibrationEnabled
        : settings.vibrationEnabled === true,
    preparationSeconds,
    physicalWarningsEnabled:
      settings.physicalWarningsEnabled === undefined
        ? DEFAULT_SETTINGS.physicalWarningsEnabled
        : settings.physicalWarningsEnabled === true,
  }
}

export const getAppSettings = () => {
  try {
    const storedValue = localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!storedValue) {
      return { ...DEFAULT_SETTINGS }
    }

    return normalizeSettings(JSON.parse(storedValue))
  } catch (error) {
    console.error('No se pudieron cargar los ajustes:', error)
    return { ...DEFAULT_SETTINGS }
  }
}

export const saveAppSettings = (settings) => {
  try {
    const normalizedSettings = normalizeSettings(settings)

    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings)
    )

    return normalizedSettings
  } catch (error) {
    console.error('No se pudieron guardar los ajustes:', error)
    return null
  }
}

export const updateAppSetting = (settingName, value) => {
  const currentSettings = getAppSettings()

  return saveAppSettings({
    ...currentSettings,
    [settingName]: value,
  })
}

export const resetAppSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    return { ...DEFAULT_SETTINGS }
  } catch (error) {
    console.error('No se pudieron restablecer los ajustes:', error)
    return null
  }
}

export const getDefaultSettings = () => {
  return { ...DEFAULT_SETTINGS }
}

export default {
  getAppSettings,
  saveAppSettings,
  updateAppSetting,
  resetAppSettings,
  getDefaultSettings,
}
