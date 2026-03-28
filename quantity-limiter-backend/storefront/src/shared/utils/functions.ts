import { ClassEnum, CountdownClassEnum, CountryRuleClassEnum } from '@nest/class.enum';
import {
  SHOP_CUSTOM_CHECK_INCLUDES_STATE_NAME,
  SHOP_CUSTOM_SPAIN_PROVINCE_NAME,
  SHOP_ONLY_ADD_PROPERTIES_ON_PRODUCT_PAGE,
  SHOP_USE_BOTH_STATIC_AND_DYNAMIC_TEXT_IN_CART,
} from '@nest/custom-shops.constant';
import { IRule } from '@nest/nest-types/modules/rule/types/rule.entity';
import { ShopGeneral, SortOptionsEnum } from '@nest/nest-types/modules/shop/entities/shop-general.entity';
import {
  CartPageDateDisplayType,
  DateCalculationMethod,
  DateDisplayMode,
  TimeCountDownFormat,
} from '@nest/nest-types/modules/shop/types/shop.enum';
import { DATE_LOCALE_TRANSLATES, DEFAULT_TIMEZONE } from '@nest/shared.constant';
import { HiddenInputAttribute, WixPage } from '@nest/shared.enum';
import { AppVariableEnum } from '@nest/app.enum';
import { IWeekWorkingDay, IWeekWorkingDays } from '@nest/shared.interface';
import dayjs from 'dayjs';
import * as qs from 'qs';

export function uniq<T>(a: Array<T>): Array<T> {
  return Array.from(new Set(a.map((item) => JSON.stringify(item)))).map((item) => JSON.parse(item));
}

export function uniqByKey(a: Array<any>, key: string) {
  return Array.from(new Set(a.map((item) => JSON.stringify(item[key])))).map((item) =>
    a.find((i) => i[key] === JSON.parse(item)),
  );
}

export const objectToQuerystring = (obj: Record<string, any>): string => {
  return qs.stringify(obj);
};

export const getTimezoneDate = (timezone: string = '', date?: Date): Date => {
  if (timezone === DEFAULT_TIMEZONE || !timezone) return date ? new Date(date) : new Date();
  const dayJsDate = dayjs(date || new Date());
  timezone = timezone?.split(':')[0] || '';
  const timezoneDate = dayJsDate.tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  return new Date(timezoneDate);
};

export const isInCutoffTime = (date: Date, workingDays: IWeekWorkingDay[]) => {
  const workingDaysEnabled = workingDays.filter((w) => w.enable === 1);
  const currentWeekDay = date.getDay();
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const weekDay = workingDaysEnabled.find((workingDay) => Number(workingDay.day) === currentWeekDay);
  const condition = weekDay?.cut_off_after?.split(':') || [];
  const conditionHour = Number(condition[0]);
  const conditionMinute = Number(condition[1]);
  if (!weekDay || currentHour > conditionHour || (currentHour == conditionHour && currentMinute > conditionMinute)) {
    return true;
  } else {
    return false;
  }
};

export const formatDateString = (time?: Date | number | string, format: string = 'yyyy-mm-dd') => {
  let timestamp = new Date(time).getTime();
  if (!timestamp || !time) timestamp = Date.now();
  const date = new Date(timestamp);
  const year = String(date.getFullYear());
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  format = format.replace('yyyy', year);
  format = format.replace('mm', month);
  format = format.replace('dd', day);
  return format;
};

const orderedDay = (weekWorkingDays: IWeekWorkingDay[], timezoneOffset: string, preOrderDate?: Date): Date => {
  let today = getTimezoneDate(timezoneOffset, preOrderDate);
  if (isInCutoffTime(today, weekWorkingDays)) {
    today = increaseDateTimeByDays(today, 1);
  }
  return today;
};

export const calculateEstimatedDates = ({
  minPrepDays,
  maxPrepDays,
  minDeliveryDays,
  maxDeliveryDays,
  specificDayOff,
  weekWorkingDays,
  date_timezone_offset,
  isUseSeparateWorkingDays,
  productMetafield,
  dateCalculationMethod,
  preOrderDate,
}: {
  minPrepDays: number;
  maxPrepDays: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  specificDayOff: Date[];
  weekWorkingDays: IWeekWorkingDays;
  date_timezone_offset: string;
  isUseSeparateWorkingDays: boolean;
  productMetafield?: {
    [key: string]: {
      [key: string]: number | string;
    };
  };
  dateCalculationMethod?: DateCalculationMethod;
  preOrderDate?: Date;
}): {
  startShippedDate: Date;
  endShippedDate: Date;
  startDeliveredDate: Date;
  endDeliveredDate: Date;
} => {
  const minPrepareDaysFinal = productMetafield ? +productMetafield.estimateStartDate : minPrepDays;
  const maxPrepareDaysFinal = productMetafield ? +productMetafield.estimateEndDate : maxPrepDays;
  const minDeliveryDaysFinal = productMetafield?.estimateStartDate
    ? +productMetafield.estimateStartDate + minDeliveryDays
    : minDeliveryDays;
  const maxDeliveryDaysFinal = productMetafield?.estimateEndDate
    ? +productMetafield.estimateEndDate + maxDeliveryDays
    : maxDeliveryDays;
  const prepareWeekWorkingDays = isUseSeparateWorkingDays ? weekWorkingDays.prepare : weekWorkingDays.prepareAndDelivery;
  const deliveryWeekWorkingDays = isUseSeparateWorkingDays ? weekWorkingDays.delivery : weekWorkingDays.prepareAndDelivery;
  const orderPrepareDay = orderedDay(prepareWeekWorkingDays, date_timezone_offset, preOrderDate);
  const orderDeliveryDay = orderedDay(deliveryWeekWorkingDays, date_timezone_offset, preOrderDate);

  const startShippedDate = calculateEstimateDate(
    orderPrepareDay,
    minPrepareDaysFinal || 0,
    specificDayOff,
    prepareWeekWorkingDays,
    date_timezone_offset,
  );
  const endShippedDate = calculateEstimateDate(
    orderPrepareDay,
    maxPrepareDaysFinal || 0,
    specificDayOff,
    prepareWeekWorkingDays,
    date_timezone_offset,
  );
  const startDeliveredDate = calculateEstimateDate(
    dateCalculationMethod === DateCalculationMethod.MaxPreparationDate ? endShippedDate : orderDeliveryDay,
    minDeliveryDaysFinal || 0,
    specificDayOff,
    deliveryWeekWorkingDays,
    date_timezone_offset,
  );
  const endDeliveredDate = calculateEstimateDate(
    dateCalculationMethod === DateCalculationMethod.MaxPreparationDate ? endShippedDate : orderDeliveryDay,
    maxDeliveryDaysFinal || 0,
    specificDayOff,
    deliveryWeekWorkingDays,
    date_timezone_offset,
  );
  return { startShippedDate, endShippedDate, startDeliveredDate, endDeliveredDate };
};

export const increaseDateTimeByDays = (currentDay: Date, daysToAdd: number): Date => {
  const increasedDate = new Date(currentDay.getTime()); // Clone the date to avoid mutating the original
  increasedDate.setDate(increasedDate.getDate() + daysToAdd);
  return increasedDate;
};

// Calculate order-limiter Date after dayOff and working day
export const calculateEstimateDate = (
  startDate: Date,
  daysAfter: number,
  daysOff: Date[],
  allWorkingDays: IWeekWorkingDay[],
  timeZone?: string,
) => {
  const workingDays = allWorkingDays.filter((day) => day.enable === 1);
  const dayOff = daysOff.map((item) => getTimezoneDate(timeZone, new Date(item))).map((day) => formatDateString(day));

  let nextDay = new Date(startDate);
  let formattedDay = formatDateString(nextDay);
  const isHasWorkday = workingDays.find((day) => day.enable === 1);

  if (isHasWorkday) {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const weekDay = workingDays.find((day) => day.day === nextDay.getDay());
      const isSpecDay = dayOff.find((item) => item === formattedDay);
      if (weekDay && weekDay?.enable === 1 && !isSpecDay) {
        if (count >= daysAfter) break;
        count = count + 1;
      }
      formattedDay = formatDateString(increaseDateTimeByDays(nextDay, 1));
      nextDay = increaseDateTimeByDays(nextDay, 1);
    }
  }

  return nextDay;
};

// Format date to setup format string
export const formatEstimatedDate = (date: Date, displayMode: DateDisplayMode, format: string, locale: string): string => {
  if (displayMode === DateDisplayMode.Relative) {
    const estimatedDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set time to 00:00:00 for both today and tomorrow to compare only the dates
    const estimatedTime = estimatedDate.setHours(0, 0, 0, 0);
    const todayTime = today.setHours(0, 0, 0, 0);
    const tomorrowTime = tomorrow.setHours(0, 0, 0, 0);

    const translatedLocaleExist = DATE_LOCALE_TRANSLATES.find((translatedLocale) => translatedLocale.locale === locale);

    if (estimatedTime === todayTime) return translatedLocaleExist?.today || 'Today';
    if (estimatedTime === tomorrowTime) return translatedLocaleExist?.tomorrow || 'Tomorrow';
  }
  // dayjs.locale(locale);
  return dayjs(date).format(format);
};

export const calculateTimeDifference = (timeDiff: number, type: TimeCountDownFormat) => {
  const result = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (timeDiff < 0) return result;
  const hiddenDayFormat = [TimeCountDownFormat.HourMinute, TimeCountDownFormat.HourMinuteSecond];
  if (!hiddenDayFormat.includes(type)) {
    result.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    timeDiff -= result.days * 1000 * 60 * 60 * 24;
  }
  result.hours = Math.floor(timeDiff / (1000 * 60 * 60));
  timeDiff -= result.hours * 1000 * 60 * 60;
  result.minutes = Math.floor(timeDiff / (1000 * 60));
  timeDiff -= result.minutes * 1000 * 60;
  result.seconds = Math.floor(timeDiff / 1000);
  return result;
};

export const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const checkStringEqualWithoutAccent = (str1: string, str2: string): boolean => {
  return (
    removeAccents(str1).trim().toLowerCase() ===
    removeAccents(str2 || '')
      .trim()
      .toLowerCase()
  );
};

export const checkRegionCityEqual = (str1?: string, str2?: string): boolean => {
  if (!str1 && !str2) return true;
  if (!str1 || !str2) return false;
  const clean = (str: string) => removeAccents(str).trim().toLowerCase().replace(/\s+/g, '');
  const mapCustomProvinceName = SHOP_CUSTOM_SPAIN_PROVINCE_NAME[window.estimatedShop || ''];
  const cleanedStr1 = clean(mapCustomProvinceName?.[str1] ?? str1);
  const cleanedStr2 = clean(mapCustomProvinceName?.[str2] ?? str2);
  if (SHOP_CUSTOM_CHECK_INCLUDES_STATE_NAME.includes(window.estimatedShop || '')) {
    return cleanedStr1.includes(cleanedStr2) || cleanedStr2.includes(cleanedStr1);
  }
  return cleanedStr1 === cleanedStr2;
};

export const isZipcodeInRange = (zipcode: string, specificZipcode: string): boolean => {
  if (zipcode.includes(':')) {
    let [startZip, endZip] = zipcode.split(':').map((z) => z.trim());
    let tempSpecificZipcode = specificZipcode;
    // Brazil zipcode range
    if (specificZipcode.includes('-') && startZip.includes('-') && endZip.includes('-')) {
      tempSpecificZipcode = specificZipcode.replace(/-/g, '.');
      startZip = startZip.replace(/-/g, '.');
      endZip = endZip.replace(/-/g, '.');
    }
    return !isNaN(+startZip) && !isNaN(+endZip) && +startZip <= +tempSpecificZipcode && +endZip >= +tempSpecificZipcode;
  }
  return false;
};

export const removeDoms = (doms: NodeListOf<Element>): void => {
  doms.forEach((element) => element.remove());
};

export const removeHtmlTag = (text: string): string => {
  if (!text) return '';
  const result = text
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '');
  return result;
};

export const splitStringByIndex = (str: string, index: number): string[] => {
  const firstPart = str.substring(0, index);
  const secondPart = str.substring(index);
  return [firstPart, secondPart];
};

export const generateDateDisplay = (estimatedText: string) => {
  const prepMinIndex = estimatedText.indexOf(AppVariableEnum.StartShipDate);
  const prepMaxIndex = estimatedText.indexOf(AppVariableEnum.EndShipDate);
  const deliveryMinIndex = estimatedText.indexOf(AppVariableEnum.StartDeliveredDate);
  const deliveryMaxIndex = estimatedText.indexOf(AppVariableEnum.EndDeliveredDate);
  const indexes = [prepMinIndex, prepMaxIndex, deliveryMinIndex, deliveryMaxIndex].filter((index) => index > -1);
  let splitIndex = 0;
  if (indexes.length) splitIndex = Math.min(...indexes);
  return removeHtmlTag(splitStringByIndex(estimatedText, splitIndex)[1]);
};

export const renderEstimatedTextAsHiddenInput = (data: {
  currentRule: IRule;
  shopGeneral: ShopGeneral;
  labelCheckout?: string;
  countryName?: string;
  currentPage: string;
  specificDayOff?: Date[];
  weekWorkingDays?: IWeekWorkingDays;
  productMetafield?: {
    [key: string]: {
      [key: string]: string | number;
    };
  };
  isUseCustomOutOfStock: boolean;
}) => {
  const {
    currentRule,
    shopGeneral,
    labelCheckout,
    countryName,
    currentPage,
    specificDayOff,
    weekWorkingDays,
    isUseCustomOutOfStock,
    productMetafield,
  } = data;
  if (SHOP_ONLY_ADD_PROPERTIES_ON_PRODUCT_PAGE.includes(shopGeneral?.shop) && currentPage !== WixPage.Product) return;

  const {
    id,
    showTextInCart,
    cartPageLabelText,
    cartPageDateDisplay,
    cartPageDateDisplayType,
    maxDeliveryDays,
    maxPrepDays,
    minDeliveryDays,
    minPrepDays,
    soldOutCustomText,
    isUsePreOrderDate,
    preOrderDate,
  } = currentRule;
  const { date_format, date_display_mode, date_locale, date_timezone_offset, isUseSeparateWorkingDays, dateCalculationMethod } =
    shopGeneral || {};

  const { startShippedDate, endShippedDate, startDeliveredDate, endDeliveredDate } = calculateEstimatedDates({
    minPrepDays,
    maxPrepDays,
    minDeliveryDays,
    maxDeliveryDays,
    specificDayOff,
    weekWorkingDays,
    date_timezone_offset,
    isUseSeparateWorkingDays,
    productMetafield,
    dateCalculationMethod,
    preOrderDate: isUsePreOrderDate && preOrderDate ? new Date(preOrderDate) : undefined,
  });

  const { ExistRule, FormCartAdd, EstimatedShipping, HiddenInput } = ClassEnum;
  const formsAddToCart = document.querySelectorAll(FormCartAdd);
  const existRuleDoms = document.querySelectorAll(`.${ExistRule}`);
  if (existRuleDoms.length) removeDoms(existRuleDoms);

  if (!cartPageLabelText || !cartPageDateDisplay) {
    return '';
  }

  let fieldName = cartPageLabelText;
  let rawInputValue = '';
  if (isUseCustomOutOfStock) {
    rawInputValue = generateDateDisplay(soldOutCustomText || '');
  } else {
    rawInputValue =
      cartPageDateDisplayType === CartPageDateDisplayType.MessageText
        ? generateDateDisplay(currentRule.estimatedText)
        : cartPageDateDisplay;
  }

  const inputValue = rawInputValue
    .split(AppVariableEnum.StartShipDate)
    .join(formatEstimatedDate(startShippedDate, date_display_mode, date_format, date_locale))
    .split(AppVariableEnum.EndShipDate)
    .join(formatEstimatedDate(endShippedDate, date_display_mode, date_format, date_locale))
    .split(AppVariableEnum.StartDeliveredDate)
    .join(formatEstimatedDate(startDeliveredDate, date_display_mode, date_format, date_locale))
    .split(AppVariableEnum.EndDeliveredDate)
    .join(formatEstimatedDate(endDeliveredDate, date_display_mode, date_format, date_locale))
    .split(AppVariableEnum.Country)
    .join(countryName || '')
    .split(AppVariableEnum.FlagIcon)
    .join('')
    .trim();

  const formPropertiesInputs = document.querySelectorAll(`${FormCartAdd} input[name="properties[${fieldName}]"]`);
  const formPropertiesClasses = document.querySelectorAll(`.${EstimatedShipping}`);
  // Remove existing properties fields
  if (formPropertiesInputs.length) removeDoms(formPropertiesInputs);
  if (formPropertiesClasses.length) removeDoms(formPropertiesClasses);

  // Add a hidden input field with the order-limiter text
  if (!fieldName) fieldName = labelCheckout || '';
  formsAddToCart.forEach((form) => {
    const minPrepareDaysFinal = productMetafield ? +productMetafield.estimateStartDate : minPrepDays;
    const maxPrepareDaysFinal = productMetafield ? +productMetafield.estimateEndDate : maxPrepDays;
    const minDeliveryDaysFinal = productMetafield?.estimateStartDate
      ? +productMetafield.estimateStartDate + minDeliveryDays
      : minDeliveryDays;
    const maxDeliveryDaysFinal = productMetafield?.estimateEndDate
      ? +productMetafield.estimateEndDate + maxDeliveryDays
      : maxDeliveryDays;

    const formLabelHiddenInput = document.createElement('input');
    formLabelHiddenInput.type = 'hidden';
    formLabelHiddenInput.classList.add(ExistRule);
    if (
      showTextInCart &&
      (!shopGeneral?.isDynamicDateInCart || SHOP_USE_BOTH_STATIC_AND_DYNAMIC_TEXT_IN_CART.includes(shopGeneral?.shop))
    ) {
      formLabelHiddenInput.name = `properties[${fieldName}]`;
      formLabelHiddenInput.value = inputValue;
    }
    formLabelHiddenInput.id = HiddenInput;
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.RuleId, id.toString());
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.MinPrepDays, minPrepareDaysFinal.toString());
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.MaxPrepDays, maxPrepareDaysFinal.toString());
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.MinDeliveryDays, minDeliveryDaysFinal.toString());
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.MaxDeliveryDays, maxDeliveryDaysFinal.toString());
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.EstText, rawInputValue);
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.CartLabelText, cartPageLabelText);
    formLabelHiddenInput.setAttribute(HiddenInputAttribute.ShowTextInCart, Number(showTextInCart).toString());
    if (isUsePreOrderDate) {
      formLabelHiddenInput.setAttribute(HiddenInputAttribute.PreOrderDate, preOrderDate);
    }
    form.prepend(formLabelHiddenInput);
  });
};

export const generateEstimatedHtml = (
  shopGeneral: ShopGeneral,
  initHtml: string,
  startShippedDate: Date,
  endShippedDate: Date,
  startDeliveredDate: Date,
  endDeliveredDate: Date,
  country?: { name?: string; code?: string; provinceName?: string },
): string => {
  const { date_format, date_display_mode, date_locale } = shopGeneral;
  const { CountryName } = CountryRuleClassEnum;
  const { CountdownContainer } = CountdownClassEnum;

  const dateSpanHtml = initHtml
    .split(AppVariableEnum.StartShipDate)
    .join(`${formatEstimatedDate(startShippedDate, date_display_mode, date_format, date_locale)}`)
    .split(AppVariableEnum.EndShipDate)
    .join(`${formatEstimatedDate(endShippedDate, date_display_mode, date_format, date_locale)}`)
    .split(AppVariableEnum.StartDeliveredDate)
    .join(`${formatEstimatedDate(startDeliveredDate, date_display_mode, date_format, date_locale)}`)
    .split(AppVariableEnum.EndDeliveredDate)
    .join(`${formatEstimatedDate(endDeliveredDate, date_display_mode, date_format, date_locale)}`)
    .split(AppVariableEnum.TimeCountDown)
    .join(`<span class="${CountdownContainer}"></span>`)
    .split(AppVariableEnum.Country)
    .join(
      country?.name
        ? `<span class="${CountryName}">
              ${country?.provinceName ? country.provinceName + ', ' : ''}${country.name}
          </span>`
        : '',
    )
    .split(AppVariableEnum.FlagIcon)
    .join(country?.code ? `<span class="flag-icon flag-icon-${country.code.toLowerCase()}"></span>` : '');

  return dateSpanHtml;
};

export const findAllIndex = (arr: any[], val: any, field: string): number[] => {
  const indexes: number[] = [];
  arr.forEach((item, index) => {
    if (item[field] === val) indexes.push(index);
  });
  return indexes;
};

export const sortRulesBy = (rules: IRule[], sortBy?: SortOptionsEnum) => {
  switch (sortBy) {
    case SortOptionsEnum.IdAsc:
      return rules.sort((a, b) => (a?.id || 0) - (b?.id || 0));
    case SortOptionsEnum.IdDesc:
      return rules.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    case SortOptionsEnum.NameAsc:
      return rules.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
    case SortOptionsEnum.NameDesc:
      return rules.sort((a, b) => (b?.name || '').localeCompare(a?.name || ''));
    case SortOptionsEnum.MinPrepareAsc:
      return rules.sort((a, b) => (a?.minPrepDays || 0) - (b?.minPrepDays || 0));
    case SortOptionsEnum.MinPrepareDesc:
      return rules.sort((a, b) => (b?.minPrepDays || 0) - (a?.minPrepDays || 0));
    case SortOptionsEnum.MaxPrepareAsc:
      return rules.sort((a, b) => (a?.maxPrepDays || 0) - (b?.maxPrepDays || 0));
    case SortOptionsEnum.MaxPrepareDesc:
      return rules.sort((a, b) => (b?.maxPrepDays || 0) - (a?.maxPrepDays || 0));
    case SortOptionsEnum.MinDeliveryAsc:
      return rules.sort((a, b) => (a?.minDeliveryDays || 0) - (b?.minDeliveryDays || 0));
    case SortOptionsEnum.MinDeliveryDesc:
      return rules.sort((a, b) => (b?.minDeliveryDays || 0) - (a?.minDeliveryDays || 0));
    case SortOptionsEnum.MaxDeliveryAsc:
      return rules.sort((a, b) => (a?.maxDeliveryDays || 0) - (b?.maxDeliveryDays || 0));
    case SortOptionsEnum.MaxDeliveryDesc:
      return rules.sort((a, b) => (b?.maxDeliveryDays || 0) - (a?.maxDeliveryDays || 0));
    default:
      return rules;
  }
};

export const isSubDomain = (url: string) => {
  const hostname = new URL(url).hostname;
  const rootDomainRegex = /^[^.]+\.[^.]+$/;

  return !rootDomainRegex.test(hostname);
};

export const generateHmacKey = async (querystring: string, secret: string): Promise<string> => {
  if (!querystring || !secret) return '';

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    const data = encoder.encode(querystring);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error generating HMAC:', error);
    return '';
  }
};
