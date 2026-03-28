import { QuantityButton, QuantityInput, StyledQuantitySelector } from './styled';

interface QuantitySelectorProps {
  quantity: number;
  minQuantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function QuantitySelector({ quantity, minQuantity, onDecrease, onIncrease }: QuantitySelectorProps) {
  return (
    <StyledQuantitySelector>
      <QuantityButton isLeft onClick={onDecrease} disabled={quantity <= minQuantity}>
        -
      </QuantityButton>
      <QuantityInput type="text" value={quantity} readOnly />
      <QuantityButton onClick={onIncrease}>+</QuantityButton>
    </StyledQuantitySelector>
  );
}
