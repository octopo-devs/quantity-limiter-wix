export enum ShopLayout {
  ShippingRule = 1,
  ZipcodeRule = 2,
  CountryRule = 3,
}
export enum DateDisplayMode {
  Relative = 'relative',
  Absolute = 'absolute',
}
export enum TimeCountDownFormat {
  Full = 1,
  DayHourMinute = 2,
  DayHour = 3,
  HourMinuteSecond = 4,
  HourMinute = 5,
}
export enum CountdownTimerOption {
  NextCutoff = 'next_cutoff',
  EndOfDay = 'end_of_day',
}
export enum DateRangeDirection {
  Vertical = 'column',
  Horizontal = 'row',
}
export enum CartPageDateDisplayType {
  MessageText = 'message_text',
  CustomizeText = 'customize_text',
}

export enum DetectionMethod {
  ShopLocale = 'shop_locale',
  IpAddress = 'ip_address',
  Url = 'url',
  BrowserLanguage = 'browser_language',
}

export enum DateCalculationMethod {
  OrderDate = 'orderDate',
  MaxPreparationDate = 'maxPreparationDate',
}
