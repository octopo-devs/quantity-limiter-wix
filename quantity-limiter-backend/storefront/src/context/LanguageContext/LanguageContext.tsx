import { createContext, useEffect, useMemo } from 'react';
import { ILanguageContext } from './language-context.interface';
import useAppContext from '../AppContext/useAppContext';
import useShopifyContext from '../ShopifyContext/useShopifyContext';
import dayjs from 'dayjs';

const LanguageContext = createContext<ILanguageContext | undefined>(undefined);

const LanguageContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useShopifyContext();
  const { languages, shopGeneral, handleChangeSettingsLanguage } = useAppContext();

  const languageCode = useMemo(() => {
    // Detect language from Wix locale or URL path
    const fromUrl = window.location.pathname.split('/')[1];
    const code = locale || fromUrl;
    window.qlDetectedLanguageCode = code;
    return code;
  }, [locale]);

  const language = useMemo(() => {
    return languages
      .filter((item) => item.active)
      .find((language) => language.codeLanguage.toLowerCase() === languageCode?.toLowerCase());
  }, [languages, languageCode]);

  useEffect(() => {
    const defaultLanguage = shopGeneral?.date_locale;
    if (language) {
      dayjs.locale(language.codeLanguage);
      handleChangeSettingsLanguage(language);
      return;
    }
    if (defaultLanguage) {
      dayjs.locale(defaultLanguage);
    }
  }, [language, handleChangeSettingsLanguage, shopGeneral?.date_locale]);

  return <LanguageContext.Provider value={{ language }}>{children}</LanguageContext.Provider>;
};

export { LanguageContextProvider };

export default LanguageContext;
