export enum EventEmitterName {
  AppInstall = 'app.installed',
  AppInstallEvent = 'app.installed.event',
  InitShopSettings = 'shop.settings.init',
  ShopUpdate = 'shop.update',
  ShopCheckoutAppearance = 'shop.checkout.appearance',
  AppUninstall = 'app.uninstalled',
  ProductUpdate = 'product.update',
  ProductRemove = 'product.remove',
  ProductTagRemove = 'product.tag.remove',
  CollectionCustomUpdate = 'collection.custom.update',
  CollectionCustomRemove = 'collection.custom.remove',
  MetafieldUpdate = 'metafield.update',
  PlanPurchase = 'plan.purchase',
  ReportUpdate = 'report.update',
  DataRemove = 'data.remove',
  ShippingRuleTargetRemove = 'shipping-rule-target.remove',
  S3FileRemove = 's3.file.remove',
  S3FilesRemove = 's3.files.remove',
  S3FolderRemove = 's3.folder.remove',
  ThemesUpdate = 'themes.update',
  AppScopeUpdate = 'app.scope.update',
  CollectionUpdate = 'collection.update',
  CollectionRemove = 'collection.remove',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum AppFeatures {
  CountryRegion = 'country_region',
  ShowInCart = 'showInCart',
  ShowOutOfStock = 'showOutOfStock',
  ImportZipCodeCSV = 'importZipcodeCsv',
  TimelineGraphicIcon = 'timelineGraphicIcon',
  VisualAppearanceEditor = 'visualAppearanceEditor',
  AutoDetectLocation = 'autoDetectLocation',
  ZipCodeValidity = 'zipCodeValidity',
  ETACheckoutExtension = 'etaCheckoutExtension',
}

export enum Conjunction {
  AND = 'AND',
  OR = 'OR',
}
