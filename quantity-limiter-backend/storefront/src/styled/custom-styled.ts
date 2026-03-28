import { CustomClassEnum } from '@nest/class.enum';
import { createGlobalStyle } from 'styled-components';
import { ShopGeneral } from '../shared/types/nest-types/modules/shop/entities/shop-general.entity';

interface ICustomStyledProps {
  shopGeneral: ShopGeneral;
  mainClass: string;
}

export const CustomStyled = createGlobalStyle<ICustomStyledProps>`
  [class='${(props) => props.mainClass}'] {
    font-size: ${(props) => props.shopGeneral?.text_size}px;
    color: ${(props) => props.shopGeneral?.text_color};
    line-height: ${(props) => Number(props.shopGeneral?.text_size) * 1.5}px;
  }

  .${CustomClassEnum.Toggle} {
    cursor: pointer;
    padding: 0 8px;
  }

  ${(props) => props.shopGeneral?.custom_css}
`;
