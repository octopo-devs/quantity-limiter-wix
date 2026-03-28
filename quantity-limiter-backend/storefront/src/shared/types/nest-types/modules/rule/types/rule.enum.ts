export enum SpecificType {
  Product = 'product',
  Collection = 'collection',
  Vendor = 'vendor',
  Tag = 'tag',
}
export enum AppliedItemsType {
  AllItems = 0,
  OnlyItems = 1,
  ExcludeItems = 2,
}
export enum ItemConditionEnum {
  IncludeProduct = 'products_applied',
  ExcludeProduct = 'products_excluded',
  IncludeCollection = 'collections_applied',
  ExcludeCollection = 'collections_excluded',
  IncludeVendor = 'brands_applied',
  ExcludeVendor = 'brands_excluded',
  Exception = 'products_exception',
  IncludeTag = 'tags_applied',
  ExcludeTag = 'tags_excluded',
  IncludeSKU = 'skus_applied',
  ExcludeSKU = 'skus_excluded',
  IncludeInventoryLocation = 'inventory_locations_applied',
  ExcludeInventoryLocation = 'inventory_locations_excluded',
  InventoryQuantity = 'inventory_quantity',
  IncludeProductMetafield = 'metafields_products_applied',
  ExcludeProductMetafield = 'metafields_products_excluded',
  IncludeVariantMetafield = 'metafields_variants_applied',
  ExcludeVariantMetafield = 'metafields_variants_excluded',
}

export enum TypeRelationEnum {
  AND = 'and',
  OR = 'or',
}

export enum SubConditionTypeEnum {
  Product = 'product',
  Collection = 'collection',
  Vendor = 'vendor',
  Tag = 'tag',
  InventoryLocation = 'inventory_location',
  SKU = 'sku',
  InventoryQuantity = 'inventory_quantity',
}

export enum LocationConditionEnum {
  Country = 'country',
  State = 'state',
  Zipcode = 'zipcode',
}
