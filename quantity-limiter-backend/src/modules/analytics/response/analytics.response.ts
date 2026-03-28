import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { OmitType } from '@nestjs/swagger';

export class OnboardingStatsResponse extends DefaultResponse {
  stepCompletionStats: StepCompletionStats[];
}

export class StepCompletionStats {
  step: number;

  total_records: number;

  average_duration: number;
}

export class TypePreferenceCount {
  delivery?: number;

  postal?: number;
  country?: number;
}

export class TemplatePreferenceCount {
  delivery_basic?: number;
  delivery_advanced?: number;
  delivery_blank?: number;
  postal_basic?: number;
  postal_advanced?: number;
  postal_blank?: number;
  country_basic?: number;
  country_advanced?: number;
  country_blank?: number;
}

export class TypePreferenceStats {
  typePreferenceCount: TypePreferenceCount;
  templatePreferenceCount: TemplatePreferenceCount;
}
export class TouchPointDetail {
  click: number;
  percentage: number;
}

export class TouchpointStats {
  pricing_plan: TouchPointDetail;
  home_top_banner: TouchPointDetail;
  checklist_estimate_rule_limit: TouchPointDetail;
  checklist_show_in_cart: TouchPointDetail;
  checklist_auto_detect_location: TouchPointDetail;
  settings_top_banner: TouchPointDetail;
  setup_show_in_cart: TouchPointDetail;
  setup_out_of_stock: TouchPointDetail;
  appearance_change_icon: TouchPointDetail;
  appearance_visual_editor: TouchPointDetail;
  custom_css: TouchPointDetail;
  upgrade_ETA_checkout: TouchPointDetail;
}
export class TouchpointStatsResponse extends DefaultResponse {
  data: TouchpointStats;
}

export class GeneralTouchpointResponse {
  pricing_plan: number;
  home_top_banner: number;
  checklist_estimate_rule_limit: number;
  checklist_show_in_cart: number;
  checklist_auto_detect_location: number;
  settings_top_banner: number;
  setup_show_in_cart: number;
  setup_out_of_stock: number;
  appearance_change_icon: number;
  appearance_visual_editor: number;
  custom_css: number;
  upgrade_ETA_checkout: number;
}
export class AnalyticRuleResponse extends DefaultResponse {
  appliedProducts: DataAppliedProducts[];
  totalActiveRules: number;
  isAllProducts?: boolean;
}

export class DataAppliedProducts {
  ruleId: number;
  ruleName: string;
  totalProducts: number;
}
