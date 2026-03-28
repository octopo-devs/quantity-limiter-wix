import { useCanny } from '@/hooks/useCanny';
// Wix Design System - replace with actual import when package is installed
// import { Loader } from 'wix-style-react';

const FeedbackSDK = () => {
  const { isLoading: isInitCanny } = useCanny();

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--p-border-radius-200)',
        padding: '1rem 1rem 0 1rem',
        position: 'relative',
        minHeight: '80vh',
      }}
    >
      {isInitCanny ? (
        <div style={{ position: 'absolute', width: '100%', height: '90%' }} className="flex-center">
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0066cc',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : null}
      <div data-canny />
    </div>
  );
};

export default FeedbackSDK;
