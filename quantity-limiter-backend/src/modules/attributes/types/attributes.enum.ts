export enum CronAttributeStatus {
  Pending = 0,
  Completed = 1,
  Processing = 2,
  MaxRetryReached = 3,
}

export enum CronAttributeType {
  Collection = 'collection',
  Product = 'product',
  Country = 'country',
}
