/**
 * ModalWrapper Component
 * Adds accessibility features to modal dialogs
 * - Focus trapping
 * - Escape key handling
 * - Proper ARIA attributes
 *
 * Usage:
 * <ModalWrapper
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   ariaLabel="Dialog title"
 * >
 *   <YourModalContent />
 * </ModalWrapper>
 */

import { useEffect } from 'react';
import { DxcDialog } from '@dxc-technology/halstack-react';
import useFocusTrap from '../../hooks/useFocusTrap';

const ModalWrapper = ({
  isOpen,
  onClose,
  ariaLabel,
  ariaLabelledBy,
  children
}) => {
  const dialogRef = useFocusTrap(isOpen);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <DxcDialog
      isCloseVisible={false}
      overlay
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {children}
      </div>
    </DxcDialog>
  );
};

export default ModalWrapper;
