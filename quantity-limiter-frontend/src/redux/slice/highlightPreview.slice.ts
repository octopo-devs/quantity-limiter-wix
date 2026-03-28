import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define the initial state using that type
const initialState = {
  isOrderIconClicked: false,
  isShipIconClicked: false,
  isDeliveryIconClicked: false,
  isHighlightedOrderIcon: false,
  isHighlightedShipIcon: false,
  isHighlightedDeliveryIcon: false,
  isHighlightedOrderTooltip: false,
  isHighlightedShipTooltip: false,
  isHighlightedDeliveryTooltip: false,
  isHighlightedOrderTitle: false,
  isHighlightedShipTitle: false,
  isHighlightedDeliveryTitle: false,
  isHighlightedDateAppearance: false,
  isHighlightedDateRangeIcon: false,
  isHighlightedShippingMethodHeader: false,
  isHighlightedZipcodeCheckerLabel: false,
  isHighlightedZipcodeCheckerInputIndicator: false,
  isHighlightedZipcodeCheckerInputIndicatorSetting: false,
  isHighlightedZipcodeCheckerSubmitButton: false,
  isHighlightedZipcodeCheckerSubmitButtonSetting: false,
  isHighlightedZipcodeCheckerValidText: false,
  isHighlightedZipcodeCheckerInvalidText: false,
};

export type HighlightPreviewStateKeys = keyof typeof initialState;

export const highlightPreviewSlice = createSlice({
  name: 'highlightPreview',
  initialState,
  reducers: {
    handleClickHighlightItem: (
      state,
      action: PayloadAction<{
        key: keyof typeof initialState;
        value: boolean;
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    handleClearHighlightItem: (state) => {
      Object.keys(state).forEach((key) => {
        if (key.startsWith('isHighlighted')) {
          state[key as keyof typeof state] = false;
        }
      });
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const highlightPreviewSelector = createSelector(
  (state: RootState) => state.highlightPreview,
  (state) => state,
);

export default highlightPreviewSlice;
