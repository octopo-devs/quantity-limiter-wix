import { Box } from '@wix/design-system';
import { StatusAlert } from '@wix/wix-ui-icons-common';
import { AppearanceFormData } from '@/pages/Appearance/config';
import { ContactLink, WarningBox } from '../../styled';

interface WarningMessageProps {
  appearance: AppearanceFormData;
  maxQtyLimitMessage: string;
  contactUsMessage: string;
  contactUsButtonText: string;
  showContactUs: boolean;
}

export default function WarningMessage({
  appearance,
  maxQtyLimitMessage,
  contactUsMessage,
  contactUsButtonText,
  showContactUs,
}: WarningMessageProps) {
  return (
    <WarningBox
      backgroundColor={appearance.backgroundColor}
      textColor={appearance.textColor}
      fontSize={appearance.fontSize}
      textAlign={appearance.textAlign}
      fontFamily={appearance.fontFamily}
    >
      <StatusAlert size={24} />
      <Box direction="vertical" gap="tiny">
        <span>{maxQtyLimitMessage}</span>
        {showContactUs && (
          <span>
            {contactUsMessage}
            {contactUsButtonText && <ContactLink> {contactUsButtonText}</ContactLink>}
          </span>
        )}
      </Box>
    </WarningBox>
  );
}
