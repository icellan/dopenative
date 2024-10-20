import React, { useCallback, useEffect, useState } from 'react'
import { I18nManager } from 'react-native'
import Storage from '@react-native-async-storage/async-storage'
import { I18n } from "i18n-js";
import { getLocales } from 'expo-localization'

export const TranslationContext = React.createContext({})

export const TranslationProvider = ({ children, translations }) => {
  const locales = getLocales()
  console.log('locales', locales)

  const [locale, setLocale] = useState(locales[0])

  const regionCode = locale?.regionCode

  console.log('setting up translations')
  console.log(`local locale: ${JSON.stringify(locale)} `)
  console.log(`default locale: ${JSON.stringify(locales[0])} `)

  const i18n = new I18n(translations);

  i18n.locale = regionCode
  i18n.translations = translations
  i18n.fallbacks = true
  // update layout direction
  I18nManager.forceRTL(locale.textDirection === 'rtl')

  const localized = useCallback(
    (key, config) =>
      i18n.t(key, { ...config, locale: regionCode }).includes('missing')
        ? key
        : i18n.t(key, { ...config, locale: regionCode }),
    [i18n, regionCode],
  )

  const getLocale = useCallback(async () => {
    const localeJSON = await Storage.getItem('locale')
    console.log(`getting locale from storage and writing it to memory ${localeJSON}`)

    const localeFromJSON = JSON.parse(localeJSON)
    if (localeFromJSON?.regionCode !== locale.regionCode) {
      // If we have a locale stored in local storage, that is high priority (it overrides the current device locale)
      setLocale(localeJSON !== null ? localeFromJSON : locale)
    }
  }, [setLocale, locale])

  useEffect(() => {
    getLocale().catch(e => {
      console.log('error getting locale', e);
    })
  }, [getLocale])

  useEffect(() => {
    console.log(`write to storage locale: ${locale.regionCode}`)
    Storage.setItem('locale', JSON.stringify(locale)).catch(e => {
      console.log('error setting locale in storage', e)
    });
  }, [locale])

  const value = {
    localized,
    setAppLocale: setLocale,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}
