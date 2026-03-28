import { notificationOptions } from '@/pages/Rules/config';
import { createRuleSelector, updateCreateRule } from '@/redux/slice/createRule.slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  Conjunction,
  NotificationTrigger,
  OrderConditionType,
  ProductSelectionType,
  RuleCustomerConditionType,
  RuleType,
} from '@/types/enum';
import { Box, Button, Dropdown, FormField, Input, Text, ToggleSwitch } from '@wix/design-system';
import React, { useCallback } from 'react';
import CollectionRuleSetup from './components/CollectionRuleSetup';
import CustomerRuleSetup from './components/CustomerRuleSetup';
import OrderRuleSetup from './components/OrderRuleSetup';
import ProductRuleSetup from './components/ProductRuleSetup';

interface Step2ContentProps {
  nameError?: string;
  onNameErrorClear?: () => void;
}

export default function Step2Content({ nameError, onNameErrorClear }: Step2ContentProps = {}) {
  const dispatch = useAppDispatch();
  const createRule = useAppSelector(createRuleSelector);

  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      dispatch(updateCreateRule({ [field]: value }));
    },
    [dispatch],
  );

  const handleRuleProductFieldChange = useCallback(
    (field: string, value: any) => {
      const currentRuleProduct = createRule.ruleProduct || {
        ruleId: '',
        conditionType: ProductSelectionType.ALL_PRODUCTS,
        productIds: [],
        groupProducts: [],
        conjunction: Conjunction.AND,
        sellProductInMultiples: false,
      };
      dispatch(
        updateCreateRule({
          ruleProduct: {
            ...currentRuleProduct,
            [field]: value,
          },
        }),
      );
    },
    [dispatch, createRule.ruleProduct],
  );

  const handleRuleCollectionFieldChange = useCallback(
    (field: string, value: any) => {
      const currentRuleCollection = createRule.ruleCollection || {
        ruleId: '',
        collectionIds: [],
      };
      dispatch(
        updateCreateRule({
          ruleCollection: {
            ...currentRuleCollection,
            [field]: value,
          },
        }),
      );
    },
    [dispatch, createRule.ruleCollection],
  );

  const handleRuleCustomerFieldChange = useCallback(
    (field: string, value: any) => {
      const currentRuleCustomer = createRule.ruleCustomer || {
        ruleId: '',
        conditionType: RuleCustomerConditionType.ALL_CUSTOMERS,
        customerTags: [],
        excludeCustomerTags: [],
      };
      dispatch(
        updateCreateRule({
          ruleCustomer: {
            ...currentRuleCustomer,
            [field]: value,
          },
        }),
      );
    },
    [dispatch, createRule.ruleCustomer],
  );

  const handleRuleOrderFieldChange = useCallback(
    (field: string, value: any) => {
      const currentRuleOrder = createRule.ruleOrder || {
        ruleId: '',
        conditionType: OrderConditionType.TOTAL_PRODUCTS,
      };
      dispatch(
        updateCreateRule({
          ruleOrder: {
            ...currentRuleOrder,
            [field]: value,
          },
        }),
      );
    },
    [dispatch, createRule.ruleOrder],
  );

  return (
    <Box direction="vertical" gap="large" padding="large">
      {createRule.type && (
        <Box direction="vertical" gap="large">
          {createRule.type === RuleType.PRODUCT && (
            <ProductRuleSetup ruleProduct={createRule.ruleProduct} onFieldChange={handleRuleProductFieldChange} />
          )}
          {createRule.type === RuleType.COLLECTION && (
            <CollectionRuleSetup
              ruleCollection={createRule.ruleCollection}
              onFieldChange={handleRuleCollectionFieldChange}
            />
          )}
          {createRule.type === RuleType.CUSTOMER && (
            <CustomerRuleSetup ruleCustomer={createRule.ruleCustomer} onFieldChange={handleRuleCustomerFieldChange} />
          )}
          {createRule.type === RuleType.ORDER && (
            <OrderRuleSetup
              ruleOrder={createRule.ruleOrder}
              onFieldChange={handleRuleOrderFieldChange}
              minQty={createRule.minQty}
              maxQty={createRule.maxQty}
              onRuleFieldChange={handleFieldChange}
            />
          )}
        </Box>
      )}

      <Box direction="vertical" gap="large">
        <Box direction="vertical" gap="medium">
          <Text weight="bold" size="medium">
            Basic Information
          </Text>
          <FormField label="Rule Name" required statusMessage={nameError} status={nameError ? 'error' : undefined}>
            <Input
              value={createRule.name || ''}
              onChange={(e) => {
                handleFieldChange('name', e.target.value);
                if (nameError && onNameErrorClear) onNameErrorClear();
              }}
              placeholder="Enter rule name"
              status={nameError ? 'error' : undefined}
            />
          </FormField>
          <FormField label="Active">
            <ToggleSwitch
              checked={createRule.isActive ?? true}
              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              size="medium"
              skin="standard"
            />
          </FormField>
        </Box>

        {createRule.type !== RuleType.ORDER && (
          <Box direction="vertical" gap="medium">
            <Text weight="bold" size="medium">
              Quantity Limits
            </Text>
            <Box direction="horizontal" gap="medium" style={{ width: '100%' }}>
              <Box style={{ flex: 1 }}>
                <FormField label="Min Quantity" required>
                  <Input
                    type="number"
                    min={0}
                    value={String(createRule.minQty || 1)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('minQty', parseInt(e.target.value) || 0)
                    }
                  />
                </FormField>
              </Box>
              <Box style={{ flex: 1 }}>
                <FormField label="Max Quantity" required>
                  <Input
                    type="number"
                    min={0}
                    value={String(createRule.maxQty || 10)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('maxQty', parseInt(e.target.value) || 0)
                    }
                  />
                </FormField>
              </Box>
            </Box>
          </Box>
        )}

        <Box direction="vertical" gap="medium">
          <Text weight="bold" size="medium">
            Notification Settings
          </Text>
          <FormField label="Notify About Limit When">
            <Dropdown
              options={notificationOptions}
              selectedId={createRule.notifyAboutLimitWhen || NotificationTrigger.LIMIT_REACHED}
              onSelect={(option) => handleFieldChange('notifyAboutLimitWhen', option.id)}
            >
              <Button size="medium" priority="secondary">
                {notificationOptions.find((opt) => opt.id === createRule.notifyAboutLimitWhen)?.value ||
                  'Select notification trigger'}
              </Button>
            </Dropdown>
          </FormField>
          <FormField label="Show Contact Us in Notification">
            <ToggleSwitch
              checked={createRule.showContactUsInNotification ?? false}
              onChange={(e) => handleFieldChange('showContactUsInNotification', e.target.checked)}
              size="medium"
              skin="standard"
            />
          </FormField>
        </Box>

        <Box direction="vertical" gap="medium">
          <Text weight="bold" size="medium">
            Messages
          </Text>
          <FormField
            label="Min Quantity Limit Message"
            infoContent="Available variables: {{min_quantity}}, {{max_quantity}}"
          >
            <Input
              value={createRule.minQtyLimitMessage || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange('minQtyLimitMessage', e.target.value)
              }
              placeholder="Enter message for min quantity limit"
            />
          </FormField>
          <FormField
            label="Max Quantity Limit Message"
            infoContent="Available variables: {{min_quantity}}, {{max_quantity}}"
          >
            <Input
              value={createRule.maxQtyLimitMessage || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange('maxQtyLimitMessage', e.target.value)
              }
              placeholder="Enter message for max quantity limit"
            />
          </FormField>
          {createRule.type === RuleType.PRODUCT && createRule.ruleProduct?.sellProductInMultiples && (
            <FormField label="Break Multiple Limit Message">
              <Input
                value={createRule.breakMultipleLimitMessage || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange('breakMultipleLimitMessage', e.target.value)
                }
                placeholder="Enter message for break multiple limit"
              />
            </FormField>
          )}
          {createRule.showContactUsInNotification && (
            <>
              <FormField label="Contact Us Button Text">
                <Input
                  value={createRule.contactUsButtonText || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFieldChange('contactUsButtonText', e.target.value)
                  }
                  placeholder="Enter contact us button text"
                />
              </FormField>
              <FormField label="Contact Us Message">
                <Input
                  value={createRule.contactUsMessage || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFieldChange('contactUsMessage', e.target.value)
                  }
                  placeholder="Enter contact us message"
                />
              </FormField>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
