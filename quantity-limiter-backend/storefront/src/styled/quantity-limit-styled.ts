import { createGlobalStyle } from 'styled-components';

export const QuantityLimitStyled = createGlobalStyle`
  .ot-quantity-limit {
    width: 100%;
  }
  .ot-quantity-limit__message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    line-height: 1.5;
  }
  .ot-quantity-limit__message svg {
    flex-shrink: 0;
  }
  .ot-quantity-limit__contact {
    margin-top: 4px;
  }
  .ot-quantity-limit__contact a {
    text-decoration: underline;
    cursor: pointer;
  }
`;
