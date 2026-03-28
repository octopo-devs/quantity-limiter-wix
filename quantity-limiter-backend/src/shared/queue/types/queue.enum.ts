export enum QueueProcessor {
  Wix = 'wix-queue',
  CustomerIO = 'customer-io',
}

export enum WixQueueProcess {
  GetDataProcess = 'get-data-process',
  SyncDataProcess = 'sync-data-process',
}

export enum CustomerIOProcess {
  SendEvent = 'send-event',
  Register = 'register',
  Remove = 'remove',
  Update = 'update-customer',
}
