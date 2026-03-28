import styled from 'styled-components';

export const StyledQuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: fit-content;
  overflow: hidden;
`;

export const QuantityButton = styled.button<{ isLeft?: boolean }>`
  width: 32px;
  height: 32px;
  border: none;
  border-left: ${(props) => (props.isLeft ? 'none' : '1px solid #e0e0e0')};
  border-right: ${(props) => (props.isLeft ? '1px solid #e0e0e0' : 'none')};
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const QuantityInput = styled.input`
  width: 60px;
  text-align: center;
  border: none;
  font-size: 16px;
  font-weight: 500;
  outline: none;
`;
