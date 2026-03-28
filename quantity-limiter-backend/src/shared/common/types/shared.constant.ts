import { PricingPlan } from 'src/shared/api/types/wix-api/wix-api.enum';
import { AppFeatures } from 'src/shared/common/types/shared.enum';

export const TEST_SHOPS = ['sonlh-dev.myshopify.com'];

export const DEFAULT_PER_PAGE = 10;

export const MONTH_NAME = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'May',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

export const LIMITATION_BY_PLAN = {
  [PricingPlan.Free]: [],
  [PricingPlan.Standard]: [
    AppFeatures.ShowInCart,
    AppFeatures.ShowOutOfStock,
    AppFeatures.TimelineGraphicIcon,
    AppFeatures.VisualAppearanceEditor,
  ],
  [PricingPlan.Pro]: [
    AppFeatures.CountryRegion,
    AppFeatures.ShowInCart,
    AppFeatures.ShowOutOfStock,
    AppFeatures.ImportZipCodeCSV,
    AppFeatures.TimelineGraphicIcon,
    AppFeatures.VisualAppearanceEditor,
    AppFeatures.AutoDetectLocation,
    AppFeatures.ZipCodeValidity,
  ],
  [PricingPlan.Plus]: [
    AppFeatures.CountryRegion,
    AppFeatures.ShowInCart,
    AppFeatures.ShowOutOfStock,
    AppFeatures.ImportZipCodeCSV,
    AppFeatures.TimelineGraphicIcon,
    AppFeatures.VisualAppearanceEditor,
    AppFeatures.AutoDetectLocation,
    AppFeatures.ZipCodeValidity,
    AppFeatures.ETACheckoutExtension,
  ],
};
