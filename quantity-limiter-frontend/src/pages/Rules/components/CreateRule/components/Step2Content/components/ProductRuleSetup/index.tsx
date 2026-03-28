import GroupProductConditionBuilder from '@/components/GroupProductConditionBuilder';
import SelectWixProductModal, { SelectedProduct } from '@/components/SelectWixProductModal';
import { SHOW_MULTIPLES_FEATURE } from '@/config';
import { setSelectedProducts } from '@/redux/slice/createRule.slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { Conjunction, ProductSelectionType } from '@/types/enum';
import { RuleGroupProductCondition } from '@/types/interface/rule.interface';
import { ApiRequest } from '@/types/interface/request.interface';
import { Box, Button, Dropdown, FormField, IconButton, Text, ToggleSwitch } from '@wix/design-system';
import { Delete } from '@wix/wix-ui-icons-common';
import { useCallback, useMemo, useState } from 'react';
import { conjunctionOptions, productSelectionOptions } from '../../config';

interface ProductRuleSetupProps {
  ruleProduct?: Partial<ApiRequest.CreateRule['ruleProduct']>;
  onFieldChange: (field: string, value: any) => void;
}

export default function ProductRuleSetup({ ruleProduct, onFieldChange }: ProductRuleSetupProps) {
  const dispatch = useAppDispatch();
  const rawSelectedProducts = useAppSelector((state) => state.createRule.selectedProducts);
  const selectedProducts = useMemo(() => rawSelectedProducts || [], [rawSelectedProducts]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductSelect = useCallback(
    (products: SelectedProduct[]) => {
      dispatch(setSelectedProducts(products));
      const productIds = products.map((p) => p.productId);
      onFieldChange('productIds', productIds);
    },
    [dispatch, onFieldChange],
  );

  const handleRemove = useCallback(
    (productId: string, variantId?: string) => {
      const updatedProducts = selectedProducts.filter(
        (item) => !(item.productId === productId && item.variantId === variantId),
      );
      dispatch(setSelectedProducts(updatedProducts));
      const productIds = updatedProducts.map((p) => p.productId);
      onFieldChange('productIds', productIds);
    },
    [dispatch, onFieldChange, selectedProducts],
  );

  return (
    <Box direction="vertical" gap="medium">
      <Text weight="bold" size="medium">
        Product Selection
      </Text>
      <FormField label="Product Selection Type" required>
        <Dropdown
          options={productSelectionOptions}
          selectedId={ruleProduct?.conditionType || ProductSelectionType.ALL_PRODUCTS}
          onSelect={(option) => onFieldChange('conditionType', option.id)}
        >
          <Button size="medium" priority="secondary">
            {productSelectionOptions.find((opt) => opt.id === ruleProduct?.conditionType)?.value ||
              'Select product selection type'}
          </Button>
        </Dropdown>
      </FormField>

      {ruleProduct?.conditionType === ProductSelectionType.SPECIFIC_PRODUCTS && (
        <FormField label="Products">
          <Box direction="vertical" gap="small">
            {selectedProducts.length > 0 && (
              <Box
                direction="vertical"
                gap="tiny"
                style={{
                  marginBottom: '8px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {selectedProducts.map((product, index) => (
                  <Box
                    key={`${product.productId}-${product.variantId || 'default'}-${index}`}
                    direction="horizontal"
                    align="center"
                    gap="small"
                    style={{
                      padding: '8px 12px',
                      borderBottom: index < selectedProducts.length - 1 ? '1px solid #F0F0F0' : 'none',
                    }}
                  >
                    <Box
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      ) : (
                        <Text size="tiny" skin="disabled">
                          N/A
                        </Text>
                      )}
                    </Box>
                    <Box direction="vertical" style={{ flex: 1, gap: '1px' }}>
                      <Text size="small" weight="bold">
                        {product.name}
                      </Text>
                      {product.variantTitle && (
                        <Text size="tiny" skin="disabled">
                          {product.variantTitle}
                        </Text>
                      )}
                    </Box>
                    <IconButton
                      size="tiny"
                      priority="secondary"
                      skin="light"
                      onClick={() => handleRemove(product.productId, product.variantId)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            <Button size="medium" priority="secondary" onClick={() => setIsModalOpen(true)}>
              Browse
            </Button>
          </Box>
        </FormField>
      )}

      {ruleProduct?.conditionType === ProductSelectionType.GROUP_OF_PRODUCTS && (
        <>
          <FormField label="Conjunction">
            <Dropdown
              options={conjunctionOptions}
              selectedId={ruleProduct?.conjunction || Conjunction.AND}
              onSelect={(option) => onFieldChange('conjunction', option.id)}
            >
              <Button size="medium" priority="secondary">
                {conjunctionOptions.find((opt) => opt.id === ruleProduct?.conjunction)?.value || 'AND'}
              </Button>
            </Dropdown>
          </FormField>
          <FormField label="Conditions">
            <GroupProductConditionBuilder
              conditions={(ruleProduct?.groupProducts as RuleGroupProductCondition[]) || []}
              onChange={(conditions) => onFieldChange('groupProducts', conditions)}
            />
          </FormField>
        </>
      )}

      {SHOW_MULTIPLES_FEATURE && (
        <FormField label="Sell Product in Multiples">
          <ToggleSwitch
            checked={ruleProduct?.sellProductInMultiples ?? false}
            onChange={(e) => onFieldChange('sellProductInMultiples', e.target.checked)}
            size="medium"
            skin="standard"
          />
        </FormField>
      )}

      <SelectWixProductModal
        isOpen={isModalOpen}
        isMultiple
        selectedProducts={selectedProducts}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleProductSelect}
      />
    </Box>
  );
}
