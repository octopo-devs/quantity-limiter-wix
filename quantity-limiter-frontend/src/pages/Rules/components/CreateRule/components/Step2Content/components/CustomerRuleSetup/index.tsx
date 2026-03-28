import { RuleCustomerConditionType } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { Box, Button, Dropdown, FormField, Input, Text } from '@wix/design-system';
import React from 'react';
import { customerConditionOptions } from '../../config';

interface CustomerRuleSetupProps {
  ruleCustomer?: Partial<ApiRequest.CreateRule['ruleCustomer']>;
  onFieldChange: (field: string, value: any) => void;
}

export default function CustomerRuleSetup({ ruleCustomer, onFieldChange }: CustomerRuleSetupProps) {
  return (
    <Box direction="vertical" gap="medium">
      <Text weight="bold" size="medium">
        Customer Selection
      </Text>
      <FormField label="Customer Condition Type" required>
        <Dropdown
          options={customerConditionOptions}
          selectedId={ruleCustomer?.conditionType || RuleCustomerConditionType.ALL_CUSTOMERS}
          onSelect={(option) => onFieldChange('conditionType', option.id)}
        >
          <Button size="medium" priority="secondary">
            {customerConditionOptions.find((opt) => opt.id === ruleCustomer?.conditionType)?.value ||
              'Select customer condition type'}
          </Button>
        </Dropdown>
      </FormField>

      {ruleCustomer?.conditionType === RuleCustomerConditionType.CUSTOMER_TAGS && (
        <>
          <FormField label="Customer Tags (comma separated)">
            <Input
              value={(ruleCustomer?.customerTags || []).join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(
                  'customerTags',
                  e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              placeholder="e.g., vip, premium"
            />
          </FormField>
          <FormField label="Exclude Customer Tags (comma separated)">
            <Input
              value={(ruleCustomer?.excludeCustomerTags || []).join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onFieldChange(
                  'excludeCustomerTags',
                  e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              placeholder="e.g., blocked, inactive"
            />
          </FormField>
        </>
      )}
    </Box>
  );
}
