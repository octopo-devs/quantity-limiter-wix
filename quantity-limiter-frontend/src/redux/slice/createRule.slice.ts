import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { config } from '@/config';
import { NotificationTrigger, RuleType } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { RootState } from '../store';
import { CreateRuleStep } from '@/pages/Rules/components/CreateRule/config';

export interface SelectedCollection {
  collectionId: string;
  name: string;
}

interface CreateRuleState {
  createRule: Partial<ApiRequest.CreateRule>;
  currentStep: CreateRuleStep;
  collapseSection: {
    [CreateRuleStep.STEP_1]: boolean;
    [CreateRuleStep.STEP_2]: boolean;
  };
  selectedProducts?: Array<{
    productId: string;
    variantId?: string;
    image?: string;
    name: string;
    variantTitle?: string;
  }>;
  selectedCollections?: SelectedCollection[];
}

const initialState: CreateRuleState = {
  createRule: {
    shop: config.shop,
    name: '',
    type: undefined,
    isActive: true,
    minQty: 1,
    maxQty: 10,
    notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
    showContactUsInNotification: false,
    minQtyLimitMessage: 'Minimum quantity is {{min_quantity}}',
    maxQtyLimitMessage: 'Maximum quantity is {{max_quantity}}',
    contactUsButtonText: 'Contact Us',
    contactUsMessage: 'Please contact our support team for assistance.',
  },
  currentStep: CreateRuleStep.STEP_1,
  collapseSection: {
    [CreateRuleStep.STEP_1]: true,
    [CreateRuleStep.STEP_2]: false,
  },
};

export const createRuleSlice = createSlice({
  name: 'createRule',
  initialState,
  reducers: {
    setRuleType: (state, action: PayloadAction<RuleType>) => {
      state.createRule.type = action.payload;
    },
    updateCreateRule: (state, action: PayloadAction<Partial<ApiRequest.CreateRule>>) => {
      state.createRule = { ...state.createRule, ...action.payload };
    },
    setSelectedProducts: (
      state,
      action: PayloadAction<
        Array<{
          productId: string;
          variantId?: string;
          image?: string;
          name: string;
          variantTitle?: string;
        }>
      >,
    ) => {
      state.selectedProducts = action.payload;
    },
    setSelectedCollections: (state, action: PayloadAction<SelectedCollection[]>) => {
      state.selectedCollections = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<CreateRuleStep>) => {
      state.currentStep = action.payload;
    },
    setCollapseSection: (state, action: PayloadAction<{ step: CreateRuleStep; isOpen: boolean }>) => {
      state.collapseSection[action.payload.step] = action.payload.isOpen;
    },
    resetCreateRule: (state) => {
      state.createRule = initialState.createRule;
      state.currentStep = initialState.currentStep;
      state.collapseSection = initialState.collapseSection;
      state.selectedProducts = undefined;
      state.selectedCollections = undefined;
    },
  },
});

export const {
  setRuleType,
  updateCreateRule,
  setCurrentStep,
  setCollapseSection,
  setSelectedProducts,
  setSelectedCollections,
  resetCreateRule,
} = createRuleSlice.actions;

export const createRuleSelector = createSelector(
  (state: RootState) => state.createRule.createRule,
  (createRule) => createRule,
);

export const currentStepSelector = createSelector(
  (state: RootState) => state.createRule.currentStep,
  (currentStep) => currentStep,
);

export const collapseSectionSelector = createSelector(
  (state: RootState) => state.createRule.collapseSection,
  (collapseSection) => collapseSection,
);

export default createRuleSlice;
