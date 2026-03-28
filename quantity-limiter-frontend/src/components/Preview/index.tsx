import { AppearanceFormData } from '@/pages/Appearance/config';
import { DisplayType, NotificationTrigger } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { Box, IconButton, Image, Text } from '@wix/design-system';
import { Cart, Menu, Search } from '@wix/wix-ui-icons-common';
import { useCallback, useMemo, useState } from 'react';
import QuantitySelector from './components/QuantitySelector';
import WarningMessage from './components/WarningMessage';
import WarningModal from './components/WarningModal';
import { DEFAULT_APPEARANCE, getInitialQuantity, getRuleConfig } from './config';
import { ActionButton, MobileFrame } from './styled';

interface PreviewProps {
  formData?: AppearanceFormData;
  rule?: Partial<ApiRequest.CreateRule>;
}

export default function Preview({ formData, rule }: PreviewProps) {
  const appearance = formData || DEFAULT_APPEARANCE;
  const ruleConfig = useMemo(() => getRuleConfig(rule), [rule]);

  const {
    maxQuantity,
    minQuantity,
    notifyAboutLimitWhen,
    minQtyLimitMessage,
    maxQtyLimitMessage,
    contactUsMessage,
    contactUsButtonText,
    showContactUs,
  } = ruleConfig;

  const [quantity, setQuantity] = useState(() => getInitialQuantity(minQuantity, maxQuantity));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const isOverLimit = quantity > maxQuantity;
  const isUnderLimit = quantity < minQuantity;
  const isQuantityValid = !isOverLimit && !isUnderLimit;
  const shouldShowNotification = notifyAboutLimitWhen !== NotificationTrigger.NO_NOTIFICATION;
  const isLimitReachedTrigger = notifyAboutLimitWhen === NotificationTrigger.LIMIT_REACHED;
  const isButtonClickTrigger = notifyAboutLimitWhen === NotificationTrigger.ADD_TO_CART_BUTTON_CLICKED;
  const isInlineDisplay = appearance.displayType === DisplayType.INLINE;
  const isPopupDisplay = appearance.displayType === DisplayType.POPUP;

  const handleQuantityChange = useCallback(
    (delta: number) => {
      const newQuantity = Math.max(1, quantity + delta);
      setQuantity(newQuantity);
      const newIsOverLimit = newQuantity > maxQuantity;
      const newIsUnderLimit = newQuantity < minQuantity;
      const newIsQuantityValid = !newIsOverLimit && !newIsUnderLimit;

      if (isLimitReachedTrigger) {
        if (isPopupDisplay) {
          setIsModalOpen(newIsOverLimit || newIsUnderLimit);
        } else {
          setShowWarning(newIsOverLimit || newIsUnderLimit);
        }
      } else if (isButtonClickTrigger && newIsQuantityValid) {
        setShowWarning(false);
        setIsModalOpen(false);
      }
    },
    [quantity, maxQuantity, minQuantity, isLimitReachedTrigger, isButtonClickTrigger, isPopupDisplay],
  );

  const handleDecreaseQuantity = useCallback(() => {
    handleQuantityChange(-1);
  }, [handleQuantityChange]);

  const handleIncreaseQuantity = useCallback(() => {
    handleQuantityChange(1);
  }, [handleQuantityChange]);

  const handleAddToCartClick = useCallback(() => {
    if (isButtonClickTrigger && !isQuantityValid) {
      if (isPopupDisplay) {
        setIsModalOpen(true);
      } else {
        setShowWarning(true);
      }
    }
  }, [isButtonClickTrigger, isQuantityValid, isPopupDisplay]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const shouldShowInlineWarning = useMemo(() => {
    if (!shouldShowNotification || !isInlineDisplay) {
      return false;
    }
    if (isLimitReachedTrigger) {
      return !isQuantityValid;
    }
    if (isButtonClickTrigger) {
      return showWarning;
    }
    return false;
  }, [
    shouldShowNotification,
    isInlineDisplay,
    isLimitReachedTrigger,
    isButtonClickTrigger,
    isQuantityValid,
    showWarning,
  ]);

  const shouldShowPopupModal = useMemo(() => {
    if (!shouldShowNotification || !isPopupDisplay || !isModalOpen) {
      return false;
    }
    return (isLimitReachedTrigger || isButtonClickTrigger) && !isQuantityValid;
  }, [
    shouldShowNotification,
    isPopupDisplay,
    isModalOpen,
    isLimitReachedTrigger,
    isButtonClickTrigger,
    isQuantityValid,
  ]);

  return (
    <Box direction="vertical">
      <MobileFrame>
        <Box direction="vertical">
          <Box
            direction="horizontal"
            align="center"
            padding="medium"
            style={{
              borderBottom: '1px solid #e0e0e0',
              justifyContent: 'space-between',
            }}
          >
            <IconButton size="small" priority="secondary">
              <Menu />
            </IconButton>
            <Text weight="bold" size="small">
              PRODUCT PAGE
            </Text>
            <Box direction="horizontal" gap="small">
              <IconButton size="small" priority="secondary">
                <Search />
              </IconButton>
              <IconButton size="small" priority="secondary">
                <Cart />
              </IconButton>
            </Box>
          </Box>
          <Box direction="vertical" padding="medium" gap="small">
            <Image height="176px" />
            <Box direction="vertical" paddingTop="small">
              <Text weight="bold" size="medium">
                ¥35,000
              </Text>
            </Box>
            <Box direction="vertical" gap="small">
              <Text size="small">Quantity</Text>
              <QuantitySelector
                quantity={quantity}
                minQuantity={minQuantity}
                onDecrease={handleDecreaseQuantity}
                onIncrease={handleIncreaseQuantity}
              />
              {shouldShowInlineWarning && (
                <WarningMessage
                  appearance={appearance}
                  maxQtyLimitMessage={isUnderLimit ? minQtyLimitMessage : maxQtyLimitMessage}
                  contactUsMessage={contactUsMessage}
                  contactUsButtonText={contactUsButtonText}
                  showContactUs={showContactUs}
                />
              )}
            </Box>
            <Box direction="vertical">
              <ActionButton priority="secondary" isDisabled={!isQuantityValid} onClick={handleAddToCartClick}>
                ADD TO CART
              </ActionButton>
              <ActionButton priority="primary" isDisabled={!isQuantityValid} onClick={handleAddToCartClick}>
                BUY IT NOW
              </ActionButton>
            </Box>
          </Box>
        </Box>
      </MobileFrame>
      {shouldShowPopupModal && (
        <WarningModal
          isOpen={isModalOpen}
          appearance={appearance}
          maxQtyLimitMessage={isUnderLimit ? minQtyLimitMessage : maxQtyLimitMessage}
          contactUsMessage={contactUsMessage}
          contactUsButtonText={contactUsButtonText}
          showContactUs={showContactUs}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}
