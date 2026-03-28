import { createContext, useEffect, useMemo } from 'react';
import { ILanguageContext } from './language-context.interface';
import useAppContext from '../AppContext/useAppContext';
import { DetectionMethod } from '@nest/nest-types/modules/shop/types/shop.enum';
import useShopifyContext from '../ShopifyContext/useShopifyContext';
import dayjs from 'dayjs';

const LanguageContext = createContext<ILanguageContext | undefined>(undefined);

const LanguageContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useShopifyContext();
  const { languages, shopGeneral, handleChangeSettingsLanguage, locationInfo } = useAppContext();
  const languageCode = useMemo(() => {
    let languageCode = undefined;
    switch (shopGeneral?.detectionMethod) {
      case DetectionMethod.Url:
        languageCode = window.location.pathname.split('/')[1];
        break;
      case DetectionMethod.ShopLocale:
        languageCode = locale;
        break;
      case DetectionMethod.BrowserLanguage:
        languageCode = window.navigator.language;
        break;
      case DetectionMethod.IpAddress:
        languageCode = locationInfo?.language_code;
        break;
      default:
        break;
    }
    window.estimatedDetectedLanguageCode = languageCode;
    return languageCode;
  }, [locale, locationInfo?.language_code, shopGeneral?.detectionMethod]);

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
