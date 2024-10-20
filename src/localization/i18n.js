import React, { useCallback, useEffect, useState } from 'react'
import { I18nManager } from 'react-native'
import Storage from '@react-native-async-storage/async-storage'
import i18n from 'i18n-js'
import { getLocales } from 'expo-localization'

export const TranslationContext = React.createContext({})

export const TranslationProvider = ({ children, translations }) => {
  const locales = getLocales()

  const [locale, setLocale] = useState(locales[0])

  console.log('setting up translations')
  console.log(`local locale: ${locale} `)
  console.log(`default locale: ${locales[0]} `)

  i18n.locale = locale
  i18n.translations = translations
  i18n.fallbacks = true
  // update layout direction
  I18nManager.forceRTL(locale.textDirection === 'rtl')

  const localized = useCallback(
    (key, config) =>
      i18n.t(key, { ...config, locale }).includes('missing')
        ? key
        : i18n.t(key, { ...config, locale }),
    [locale],
  )

  const getLocale = useCallback(async () => {
    const localeJSON = await Storage.getItem('locale')
    console.log(
      `getting locale from storage and writing it to memory ${localeJSON}`,
    )

    // If we have a locale stored in local storage, that is high priority (it overrides the current device locale)
    setLocale(localeJSON !== null ? JSON.parse(localeJSON) : locale)
  }, [setLocale, locale])

  useEffect(() => {
    getLocale().catch(e => {
      console.log('error getting locale', e)
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
