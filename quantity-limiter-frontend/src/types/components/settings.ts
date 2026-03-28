export interface IAppearance {
  chooseLayout: string;
  timelineOrderStepTitle: string;
  timelineOrderStepDescription: string;
  timelineShipStepTitle: string;
  timelineShipStepDescription: string;
  timelineDeliveryStepTitle: string;
  timelineDeliveryStepDescription: string;
  textColor: string;
  textSize: number;
  backgroundColor: string;
  borderColor: string;
  dateFormat: string;
  dateLocale: string;
  textCountDownFormat: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface IEstimateRules {
  method: {
    ourPolicy: string;
    policyUrl: string;
    moreInfo: string;
  };
}

export interface IActionTableProps {
  onEdit: () => void;
  onDelete: () => void;
}

export interface IError {
  status: boolean;
  msg: string;
  isShowBanner?: boolean;
}
