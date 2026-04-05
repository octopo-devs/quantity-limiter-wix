const PreviewInEditor = () => {
  return (
    <div className="ot-quantity-limiter">
      <div
        className="ot-quantity-limit__message"
        style={{
          backgroundColor: '#FFD466',
          color: '#4A4A4A',
          padding: '8px 12px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '8px 0',
          fontSize: '14px',
        }}
      >
        <span>Preview: Maximum 5 items per order</span>
      </div>
    </div>
  );
};

export default PreviewInEditor;
