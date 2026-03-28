import { MessageModalLayout, Modal } from '@wix/design-system';
import { useCallback } from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item?',
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const displayMessage = itemName ? `${message}: "${itemName}"?` : message;

  return (
    <Modal isOpen={isOpen} onRequestClose={handleCancel} shouldCloseOnOverlayClick contentLabel={title}>
      <MessageModalLayout
        title={title}
        content={displayMessage}
        primaryButtonText="Delete"
        primaryButtonOnClick={handleConfirm}
        primaryButtonProps={{
          priority: 'primary',
          skin: 'destructive',
          disabled: isLoading,
        }}
        secondaryButtonText="Cancel"
        secondaryButtonOnClick={handleCancel}
        secondaryButtonProps={{
          disabled: isLoading,
        }}
        closeButtonProps={{
          onClick: handleCancel,
        }}
      />
    </Modal>
  );
}
