export interface ISendCustomerIoEvent {
  email: string;
  shop: string;
  data?: Record<string, any>;
}

export interface IRegisterCustomerIo {
  email: string;
  shop: string;
  data?: Record<string, any>;
}

export interface IUpdateAndRemoveCustomerIo {
  email: string;
  data?: Record<string, any>;
}
