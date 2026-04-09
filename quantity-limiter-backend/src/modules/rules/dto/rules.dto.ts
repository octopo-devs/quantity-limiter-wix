import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DefaultAuthRequest, DefaultPaginationRequest } from 'src/docs/default/default-request.swagger';
import { Conjunction } from 'src/shared/common/types/shared.enum';
import {
  NotificationTrigger,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
  RuleType,
} from '../types/rule.enum';
import { RuleGroupProductCondition, RuleProductSelection } from '../types/rule.interface';

export class GetRulesDto extends IntersectionType(DefaultPaginationRequest, DefaultAuthRequest) {
  @ApiPropertyOptional({ description: 'Filter by rule name', example: 'Product Limit' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by rule type', enum: RuleType, example: RuleType.PRODUCT })
  @IsOptional()
  @IsEnum(RuleType)
  type?: RuleType;

  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => [true, 'true', 1, '1'].includes(value))
  isActive?: boolean;
}

export class RuleGroupProductConditionDto implements RuleGroupProductCondition {
  @ApiProperty({
    description: 'Condition type',
    enum: RuleGroupProductConditionType,
    example: RuleGroupProductConditionType.TAG,
  })
  @IsEnum(RuleGroupProductConditionType)
  type: RuleGroupProductConditionType;

  @ApiProperty({
    description: 'Condition operator',
    enum: RuleGroupProductConditionOperator,
    example: RuleGroupProductConditionOperator.EQUALS,
  })
  @IsEnum(RuleGroupProductConditionOperator)
  operator: RuleGroupProductConditionOperator;

  @ApiProperty({ description: 'Condition value', example: ['tag1', 'tag2'] })
  @IsArray()
  @IsString({ each: true })
  value: string | string[];
}

export class RuleProductDto {
  @ApiProperty({
    description: 'Product selection type',
    enum: ProductSelectionType,
    example: ProductSelectionType.ALL_PRODUCTS,
  })
  @IsEnum(ProductSelectionType)
  conditionType: ProductSelectionType;

  @ApiPropertyOptional({
    description: 'List of product selections with optional variant',
    example: [{ productId: 'product-id-1', variantId: 'variant-id-1' }, { productId: 'product-id-2' }],
  })
  @IsOptional()
  @IsArray()
  productIds?: RuleProductSelection[];

  @ApiPropertyOptional({ description: 'Group product conditions', type: [RuleGroupProductConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleGroupProductConditionDto)
  groupProducts?: RuleGroupProductConditionDto[];

  @ApiPropertyOptional({ description: 'Conjunction operator', enum: Conjunction, default: Conjunction.AND })
  @IsOptional()
  @IsEnum(Conjunction)
  conjunction?: Conjunction;

  @ApiPropertyOptional({ description: 'Sell product in multiples', default: false })
  @IsOptional()
  @IsBoolean()
  sellProductInMultiples?: boolean;
}

export class RuleCollectionDto {
  @ApiPropertyOptional({ description: 'List of collection IDs', example: ['collection-id-1', 'collection-id-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collectionIds?: string[];
}

export class RuleCustomerDto {
  @ApiProperty({
    description: 'Customer condition type',
    enum: RuleCustomerConditionType,
    example: RuleCustomerConditionType.ALL_CUSTOMERS,
  })
  @IsEnum(RuleCustomerConditionType)
  conditionType: RuleCustomerConditionType;

  @ApiPropertyOptional({ description: 'Customer tags to include', example: ['vip', 'premium'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customerTags?: string[];

  @ApiPropertyOptional({ description: 'Customer tags to exclude', example: ['excluded-tag'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeCustomerTags?: string[];
}

export class RuleOrderDto {
  @ApiProperty({
    description: 'Order condition type',
    enum: OrderConditionType,
    example: OrderConditionType.TOTAL_PRODUCTS,
  })
  @IsEnum(OrderConditionType)
  conditionType: OrderConditionType;
}

export class CreateRuleDto extends DefaultAuthRequest {
  @ApiProperty({ description: 'Rule name', example: 'Product Quantity Limit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Rule type', enum: RuleType, example: RuleType.PRODUCT })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiPropertyOptional({ description: 'Product rule configuration', type: RuleProductDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RuleProductDto)
  ruleProduct?: RuleProductDto;

  @ApiPropertyOptional({ description: 'Collection rule configuration', type: RuleCollectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RuleCollectionDto)
  ruleCollection?: RuleCollectionDto;

  @ApiPropertyOptional({ description: 'Customer rule configuration', type: RuleCustomerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RuleCustomerDto)
  ruleCustomer?: RuleCustomerDto;

  @ApiPropertyOptional({ description: 'Order rule configuration', type: RuleOrderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RuleOrderDto)
  ruleOrder?: RuleOrderDto;

  @ApiPropertyOptional({ description: 'Rule active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Minimum quantity', example: 1 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQty: number;

  @ApiProperty({ description: 'Maximum quantity', example: 10 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxQty: number;

  @ApiProperty({
    description: 'Notification trigger',
    enum: NotificationTrigger,
    default: NotificationTrigger.NO_NOTIFICATION,
  })
  @IsEnum(NotificationTrigger)
  notifyAboutLimitWhen: NotificationTrigger;

  @ApiPropertyOptional({ description: 'Show contact us in notification', default: false })
  @IsOptional()
  @IsBoolean()
  showContactUsInNotification?: boolean;

  @ApiProperty({ description: 'Minimum quantity limit message', example: 'Minimum quantity is {minQty}' })
  @IsString()
  @IsNotEmpty()
  minQtyLimitMessage: string;

  @ApiProperty({ description: 'Maximum quantity limit message', example: 'Maximum quantity is {maxQty}' })
  @IsString()
  @IsNotEmpty()
  maxQtyLimitMessage: string;

  @ApiPropertyOptional({
    description: 'Break multiple limit message',
    example: 'Please order in multiples of {multiple}',
  })
  @IsOptional()
  @IsString()
  breakMultipleLimitMessage?: string;

  @ApiProperty({ description: 'Contact us button text', example: 'Contact Us' })
  @IsString()
  @IsNotEmpty()
  contactUsButtonText: string;

  @ApiProperty({ description: 'Contact us message', example: 'Please contact us for assistance' })
  @IsString()
  @IsNotEmpty()
  contactUsMessage: string;
}

export class UpdateRuleDto extends PartialType(OmitType(CreateRuleDto, ['shop'] as const)) {}

export class SeedRulesDto extends DefaultAuthRequest {
  @ApiProperty({ description: 'Number of rules to seed per type', example: 2, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  count: number;
}
