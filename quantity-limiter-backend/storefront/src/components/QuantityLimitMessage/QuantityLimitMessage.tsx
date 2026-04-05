import React from 'react';
import useAppContext from '~/context/AppContext/useAppContext';
import useQuantityLimitContext from '~/context/QuantityLimitContext/useQuantityLimitContext';
import { replacePlaceholder } from '~/shared/utils/string';

const WarningIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="15" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.00076 2.89999C6.33213 2.89999 6.60076 3.16862 6.60076 3.49999V6.29999C6.60076 6.63136 6.33213 6.89999 6.00076 6.89999C5.66939 6.89999 5.40076 6.63136 5.40076 6.29999V3.49999C5.40076 3.16862 5.66939 2.89999 6.00076 2.89999Z"
      fill={color}
    />
    <path
      d="M6.80081 8.29999C6.80081 8.74182 6.44263 9.09999 6.00081 9.09999C5.55898 9.09999 5.20081 8.74182 5.20081 8.29999C5.20081 7.85816 5.55898 7.49999 6.00081 7.49999C6.44263 7.49999 6.80081 7.85816 6.80081 8.29999Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.00084 0.299988C5.16458 0.299988 4.57373 0.861846 4.2789 1.45736C4.12532 1.76757 3.40868 3.13527 2.67524 4.53481L2.65305 4.57716C1.93913 5.93946 1.21452 7.32216 1.04653 7.66156C0.748884 8.26293 0.66425 9.0615 1.12043 9.75277C1.5761 10.4433 2.35459 10.7 3.09166 10.7H8.9099C9.64698 10.7 10.4255 10.4433 10.8812 9.75278C11.3373 9.06151 11.2527 8.26293 10.9551 7.66156C10.7873 7.3227 10.0648 5.94398 9.35196 4.58379L9.32629 4.5348C8.59279 3.13519 7.87622 1.76762 7.72276 1.45753C7.428 0.86192 6.83716 0.299988 6.00084 0.299988ZM5.35432 1.98978C5.67764 1.33672 6.32406 1.33672 6.64725 1.98978C6.80893 2.31648 7.53686 3.70547 8.26451 5.09393C8.99141 6.48096 9.71805 7.86751 9.87958 8.19387C10.2028 8.84693 9.87958 9.49999 8.9099 9.49999L3.09166 9.49999C2.12201 9.49999 1.79878 8.84693 2.12201 8.19387C2.28381 7.86696 3.01255 6.47638 3.74065 5.08703C4.46707 3.70087 5.19285 2.31594 5.35432 1.98978Z"
      fill={color}
    />
  </svg>
);

function QuantityLimitMessage() {
  const { shopGeneral } = useAppContext();
  const { results } = useQuantityLimitContext();

  const branding = shopGeneral?.branding;
  const entries = Object.entries(results);
  if (!entries.length) return null;

  // Show first matching result
  const [, result] = entries[0];
  if (!result?.text) return null;

  const { rule } = result;

  const messageStyle: React.CSSProperties = {
    fontFamily: branding?.fontFamily || 'inherit',
    fontSize: branding?.fontSize ? `${branding.fontSize}px` : '14px',
    textAlign: (branding?.textAlign?.toLowerCase() as React.CSSProperties['textAlign']) || 'left',
    color: branding?.textColor || '#4A4A4A',
    backgroundColor: branding?.backgroundColor || '#FFD466',
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 0',
  };

  return (
    <div className="ot-quantity-limit">
      <div className="ot-quantity-limit__message" style={messageStyle}>
        <WarningIcon color={messageStyle.color as string} />
        <span>{result.text}</span>
      </div>
      {rule.showContactUsInNotification && rule.contactUsMessage && (
        <div
          className="ot-quantity-limit__contact"
          style={{
            fontSize: messageStyle.fontSize,
            fontFamily: messageStyle.fontFamily,
            margin: '4px 0',
          }}
        >
          {replacePlaceholder(
            rule.contactUsMessage,
            '{Button text}',
            <a href="#" target="_self" rel="noreferrer">
              {rule.contactUsButtonText || 'Contact Us'}
            </a>,
          )}
        </div>
      )}
      {branding?.customCss && <style>{branding.customCss}</style>}
    </div>
  );
}

export default QuantityLimitMessage;
