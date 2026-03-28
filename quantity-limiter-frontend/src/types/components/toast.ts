export interface IToast {
  hasAction?: boolean;
  error?: boolean;
  content: string;
  isOpen: boolean;
  contentAction?: string;
}
