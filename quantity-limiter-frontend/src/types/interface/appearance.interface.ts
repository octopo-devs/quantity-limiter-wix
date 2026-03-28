import { DisplayType, TextAlign } from '../enum';

export interface Appearance {
  shop: string;
  displayType: DisplayType;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  textAlign: TextAlign;
  fontSize: number;
  customCss: string;
  createdAt: string;
  updatedAt: string;
}
