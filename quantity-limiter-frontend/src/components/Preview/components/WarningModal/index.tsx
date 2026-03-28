import { Box, Modal } from '@wix/design-system';
import { StatusAlert } from '@wix/wix-ui-icons-common';
import { AppearanceFormData } from '@/pages/Appearance/config';
import { ContactLink, ModalContent, ModalWarningIcon } from '../../styled';

interface WarningModalProps {
  isOpen: boolean;
  appearance: AppearanceFormData;
  maxQtyLimitMessage: string;
  contactUsMessage: string;
  contactUsButtonText: string;
  showContactUs: boolean;
  onClose: () => void;
}

export default function WarningModal({
  isOpen,
  appearance,
  maxQtyLimitMessage,
  contactUsMessage,
  contactUsButtonText,
  showContactUs,
  onClose,
}: WarningModalProps) {
  return (
    <Modal isOpen={isOpen} shouldCloseOnOverlayClick shouldDisplayCloseButton onRequestClose={onClose}>
      <ModalContent
        backgroundColor={appearance.backgroundColor}
        textColor={appearance.textColor}
        fontSize={appearance.fontSize}
        textAlign={appearance.textAlign}
        fontFamily={appearance.fontFamily}
      >
        <Box direction="vertical" gap="medium" align="center">
          <ModalWarningIcon>
            <StatusAlert size={24} color="#ffffff" />
          </ModalWarningIcon>
          <Box direction="vertical" gap="small">
            <b>{maxQtyLimitMessage}</b>
            {showContactUs && (
              <span>
                {contactUsMessage}
                {contactUsButtonText && <ContactLink> {contactUsButtonText}</ContactLink>}
              </span>
            )}
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}
