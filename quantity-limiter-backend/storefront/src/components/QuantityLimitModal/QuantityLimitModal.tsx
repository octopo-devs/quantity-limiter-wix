import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Branding, QuantityLimitResult } from '~/shared/types/quantity-limit.types';
import { replacePlaceholder } from '~/shared/utils/string';
import { Backdrop, CloseButton, ContactLink, ModalBox, WarningIconCircle } from './styled';

interface QuantityLimitModalProps {
  result: QuantityLimitResult;
  branding: Branding | undefined;
  onClose: () => void;
}

const AlertIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9v4m0 4h.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function QuantityLimitModal({ result, branding, onClose }: QuantityLimitModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const backgroundColor = branding?.backgroundColor || '#FFD466';
  const textColor = branding?.textColor || '#4A4A4A';
  const fontSize = branding?.fontSize || 14;
  const textAlign = branding?.textAlign?.toLowerCase() || 'left';
  const fontFamily = branding?.fontFamily || 'inherit';

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + restore previous focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const { rule } = result;

  return createPortal(
    <Backdrop onClick={handleBackdropClick}>
      <ModalBox
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        $backgroundColor={backgroundColor}
        $textColor={textColor}
        $fontSize={fontSize}
        $textAlign={textAlign}
        $fontFamily={fontFamily}
      >
        <CloseButton ref={closeButtonRef} onClick={onClose} aria-label="Close">
          ✕
        </CloseButton>
        <WarningIconCircle>
          <AlertIcon />
        </WarningIconCircle>
        <b>{result.text}</b>
        {rule.showContactUsInNotification && rule.contactUsMessage && (
          <div>
            {replacePlaceholder(
              rule.contactUsMessage,
              '{Button text}',
              <ContactLink href="#" target="_self" rel="noreferrer">
                {rule.contactUsButtonText || 'Contact Us'}
              </ContactLink>,
            )}
          </div>
        )}
        {branding?.customCss && <style>{branding.customCss}</style>}
      </ModalBox>
    </Backdrop>,
    document.body,
  );
}

export default QuantityLimitModal;
