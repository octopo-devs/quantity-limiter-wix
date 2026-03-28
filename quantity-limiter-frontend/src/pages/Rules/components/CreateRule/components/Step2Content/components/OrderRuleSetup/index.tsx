import { OrderConditionType } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { Box, Button, Dropdown, FormField, Input, Text } from '@wix/design-system';
import React from 'react';
import { orderConditionOptions } from '../../config';

interface OrderRuleSetupProps {
  ruleOrder?: Partial<ApiRequest.CreateRule['ruleOrder']>;
  onFieldChange: (field: string, value: any) => void;
  minQty?: number;
  maxQty?: number;
  onRuleFieldChange: (field: string, value: any) => void;
}

export default function OrderRuleSetup({
  ruleOrder,
  onFieldChange,
  minQty,
  maxQty,
  onRuleFieldChange,
}: OrderRuleSetupProps) {
  const conditionType = ruleOrder?.conditionType || OrderConditionType.TOTAL_PRODUCTS;
  const isPrice = conditionType === OrderConditionType.TOTAL_PRICE;
  const minLabel = isPrice ? 'Min Price' : 'Min Quantity';
  const maxLabel = isPrice ? 'Max Price' : 'Max Quantity';

  return (
    <Box direction="vertical" gap="medium">
      <Text weight="bold" size="medium">
        Order Condition
      </Text>
      <FormField label="Order Condition Type" required>
        <Dropdown
          options={orderConditionOptions}
          selectedId={conditionType}
          onSelect={(option) => onFieldChange('conditionType', option.id)}
        >
          <Button size="medium" priority="secondary">
            {orderConditionOptions.find((opt) => opt.id === conditionType)?.value || 'Select order condition type'}
          </Button>
        </Dropdown>
      </FormField>

      <Box direction="horizontal" gap="medium" style={{ width: '100%' }}>
        <Box style={{ flex: 1 }}>
          <FormField label={minLabel} required>
            <Input
              type="number"
              min={0}
              value={String(minQty ?? 1)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onRuleFieldChange('minQty', parseInt(e.target.value) || 0)
              }
            />
          </FormField>
        </Box>
        <Box style={{ flex: 1 }}>
          <FormField label={maxLabel} required>
            <Input
              type="number"
              min={0}
              value={String(maxQty ?? 10)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onRuleFieldChange('maxQty', parseInt(e.target.value) || 0)
              }
            />
          </FormField>
        </Box>
      </Box>
    </Box>
  );
}
