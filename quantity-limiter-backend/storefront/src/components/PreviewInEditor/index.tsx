const PreviewInEditor = () => {
  return (
    <div className="ot-quantity-limiter-shipping">
      <div
        className="ot-quantity-limiter-shipping-basic-layout"
        style={{
          border: '2px solid rgb(186, 230, 253)',
          borderRadius: '8px',
          backgroundColor: 'rgb(240, 249, 255)',
          padding: '10px',
          marginTop: '10px',
        }}
      >
        <span className="ot-quantity-limiter-shipping-main-text" style={{ fontSize: '12px' }}>
          <div className="ot-quantity-limiter-shipping-title-shipping">
            <span className="ot-quantity-limiter-shipping-name-shipping">Preview Order limiter Delivery Datee</span>
          </div>
          <span className="ot-quantity-limiter-shipping-main-text-quantity-limiter">
            ⏰ Order today within{' '}
            <strong style={{ color: '#1750A6' }}>
              <span className="otCountDown" />
            </strong>{' '}
            to get discounted price
            <br />
            🚚 Delivery from <strong style={{ color: '#1750A6' }}>05/07/2025</strong> to{' '}
            <strong style={{ color: '#1750A6' }}>05/10/2025</strong>
          </span>
        </span>
      </div>
    </div>
  );
};

export default PreviewInEditor;
