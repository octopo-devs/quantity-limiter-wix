import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultPaginationResponse, DefaultResponse } from 'src/docs/default/default-response.swagger';
import { RuleCollection } from '../entities/rule-collection.entity';
import { RuleCustomer } from '../entities/rule-customer.entity';
import { RuleOrder } from '../entities/rule-order.entity';
import { RuleProduct } from '../entities/rule-product.entity';

export class RuleResponse {
  @ApiProperty({ description: 'Rule ID', example: 'uuid-here' })
  id: string;

  @ApiProperty({ description: 'Shop identifier', example: 'shop-name' })
  shop: string;

  @ApiProperty({ description: 'Rule name', example: 'Product Quantity Limit' })
  name: string;

  @ApiProperty({ description: 'Rule type', example: 'PRODUCT' })
  type: string;

  @ApiPropertyOptional({ description: 'Product rule configuration', type: RuleProduct })
  ruleProduct?: RuleProduct;

  @ApiPropertyOptional({ description: 'Collection rule configuration', type: RuleCollection })
  ruleCollection?: RuleCollection;

  @ApiPropertyOptional({ description: 'Customer rule configuration', type: RuleCustomer })
  ruleCustomer?: RuleCustomer;

  @ApiPropertyOptional({ description: 'Order rule configuration', type: RuleOrder })
  ruleOrder?: RuleOrder;

  @ApiProperty({ description: 'Rule active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Minimum quantity', example: 1 })
  minQty: number;

  @ApiProperty({ description: 'Maximum quantity', example: 10 })
  maxQty: number;

  @ApiProperty({ description: 'Notification trigger', example: 'NO_NOTIFICATION' })
  notifyAboutLimitWhen: string;

  @ApiProperty({ description: 'Show contact us in notification', example: false })
  showContactUsInNotification: boolean;

  @ApiProperty({ description: 'Minimum quantity limit message', example: 'Minimum quantity is {minQty}' })
  minQtyLimitMessage: string;

  @ApiProperty({ description: 'Maximum quantity limit message', example: 'Maximum quantity is {maxQty}' })
  maxQtyLimitMessage: string;

  @ApiPropertyOptional({
    description: 'Break multiple limit message',
    example: 'Please order in multiples of {multiple}',
  })
  breakMultipleLimitMessage?: string;

  @ApiProperty({ description: 'Contact us button text', example: 'Contact Us' })
  contactUsButtonText: string;

  @ApiProperty({ description: 'Contact us message', example: 'Please contact us for assistance' })
  contactUsMessage: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class GetRulesResponse extends DefaultPaginationResponse {
  @ApiProperty({ description: 'List of rules', type: [RuleResponse] })
  data: RuleResponse[];
}

export class GetRuleResponse extends DefaultResponse {
  @ApiProperty({ description: 'Rule data', type: RuleResponse })
  data: RuleResponse;
}

export class SaveRuleResponse extends DefaultResponse {
  @ApiProperty({ description: 'Saved rule data', type: RuleResponse })
  data: RuleResponse;
}

export class SeedRulesResponse extends DefaultResponse {
  @ApiProperty({ description: 'Seeding result', example: { totalCreated: 8, rulesCreated: ['uuid1', 'uuid2'] } })
  data: {
    totalCreated: number;
    rulesCreated: string[];
  };
}
