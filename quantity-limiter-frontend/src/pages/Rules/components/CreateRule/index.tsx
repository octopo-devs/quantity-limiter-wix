import Preview from '@/components/Preview';
import { SelectedProduct } from '@/components/SelectWixProductModal';
import { PATH } from '@/constants';
import useHandleToastNotEmbedded from '@/hooks/useToast';
import { apiCaller } from '@/redux/query';
import {
  collapseSectionSelector,
  createRuleSelector,
  currentStepSelector,
  resetCreateRule,
  setCollapseSection,
  setSelectedCollections,
  setSelectedProducts,
  updateCreateRule,
} from '@/redux/slice/createRule.slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { ProductSelectionType, RuleType } from '@/types/enum';
import { IWixProduct } from '@/types/interface/wix.interface';
import { Box, Button, Card, Cell, Collapse, IconButton, Layout, Loader, Page, Text } from '@wix/design-system';
import { ChevronDown, ChevronUp } from '@wix/wix-ui-icons-common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RuleTypeIcon from '../RuleTypeIcon';
import Step1Content from './components/Step1Content';
import Step2Content from './components/Step2Content';
import StepHeader from './components/StepHeader';
import { CreateRuleStep, getStepNumber } from './config';
import { StepCircle, StepLine } from './styled';

function getProductImage(product: IWixProduct): string | undefined {
  return product.media?.mainMedia?.image?.url || product.media?.items?.[0]?.image?.url;
}

function mapWixProductsToSelected(products: IWixProduct[]): SelectedProduct[] {
  const items: SelectedProduct[] = [];
  for (const product of products) {
    const image = getProductImage(product);
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        const choices = variant.choices || {};
        const parts: string[] = [];
        if (choices.Size) parts.push(`Size: ${choices.Size}`);
        if (choices.Color) parts.push(`Color: ${choices.Color}`);
        items.push({
          productId: product.id,
          variantId: variant.id,
          image,
          name: product.name,
          variantTitle: parts.length > 0 ? parts.join(', ') : undefined,
        });
      }
    } else {
      items.push({ productId: product.id, image, name: product.name });
    }
  }
  return items;
}

export default function CreateRule() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const toast = useHandleToastNotEmbedded();
  const createRule = useAppSelector(createRuleSelector);
  const rawSelectedProducts = useAppSelector((state) => state.createRule.selectedProducts);
  const rawSelectedCollections = useAppSelector((state) => state.createRule.selectedCollections);
  const selectedProducts = useMemo(() => rawSelectedProducts || [], [rawSelectedProducts]);
  const selectedCollections = useMemo(() => rawSelectedCollections || [], [rawSelectedCollections]);
  const currentStep = useAppSelector(currentStepSelector);
  const collapseSection = useAppSelector(collapseSectionSelector);
  const [nameError, setNameError] = useState<string | undefined>();
  const { data: appearanceData } = apiCaller.useGetAppearanceQuery();
  const { data: ruleData, isLoading: isRuleLoading } = apiCaller.useGetRuleByIdQuery(id!, { skip: !id });
  const [fetchWixProducts] = apiCaller.useLazyGetWixProductsQuery();
  const [fetchCollections] = apiCaller.useLazyGetCollectionsQuery();
  const [createRuleMutation, { isLoading: isCreating }] = apiCaller.useCreateRuleMutation();
  const [updateRuleMutation, { isLoading: isUpdating }] = apiCaller.useUpdateRuleMutation();
  const isSaving = isEditMode ? isUpdating : isCreating;

  useEffect(() => {
    if (!ruleData?.data) return;
    const rule = ruleData.data;
    dispatch(
      updateCreateRule({
        name: rule.name,
        type: rule.type,
        isActive: rule.isActive,
        minQty: rule.minQty,
        maxQty: rule.maxQty,
        notifyAboutLimitWhen: rule.notifyAboutLimitWhen,
        showContactUsInNotification: rule.showContactUsInNotification,
        minQtyLimitMessage: rule.minQtyLimitMessage,
        maxQtyLimitMessage: rule.maxQtyLimitMessage,
        breakMultipleLimitMessage: rule.breakMultipleLimitMessage,
        contactUsButtonText: rule.contactUsButtonText,
        contactUsMessage: rule.contactUsMessage,
        ruleProduct: rule.ruleProduct,
        ruleCollection: rule.ruleCollection,
        ruleCustomer: rule.ruleCustomer,
        ruleOrder: rule.ruleOrder,
      }),
    );

    if (rule.ruleProduct?.productIds?.length) {
      const ids = rule.ruleProduct.productIds;
      fetchWixProducts({ page: 1, perPage: ids.length, specificIds: ids.join(',') })
        .unwrap()
        .then((res) => {
          if (res?.products?.length) {
            dispatch(setSelectedProducts(mapWixProductsToSelected(res.products)));
          } else {
            dispatch(setSelectedProducts(ids.map((productId) => ({ productId, name: productId }))));
          }
        })
        .catch(() => {
          dispatch(setSelectedProducts(ids.map((productId) => ({ productId, name: productId }))));
        });
    }

    if (rule.ruleCollection?.collectionIds?.length) {
      const ids = rule.ruleCollection.collectionIds;
      fetchCollections({ page: 1, perPage: 100 })
        .unwrap()
        .then((res) => {
          if (res?.data?.length) {
            const mapped = ids.map((collectionId) => {
              const found = res.data.find((c) => String(c.collection_id) === collectionId);
              return { collectionId, name: found?.title || collectionId };
            });
            dispatch(setSelectedCollections(mapped));
          } else {
            dispatch(setSelectedCollections(ids.map((collectionId) => ({ collectionId, name: collectionId }))));
          }
        })
        .catch(() => {
          dispatch(setSelectedCollections(ids.map((collectionId) => ({ collectionId, name: collectionId }))));
        });
    }

    dispatch(setCollapseSection({ step: CreateRuleStep.STEP_1, isOpen: false }));
    dispatch(setCollapseSection({ step: CreateRuleStep.STEP_2, isOpen: true }));
  }, [ruleData, dispatch, fetchWixProducts, fetchCollections]);

  useEffect(() => {
    return () => {
      dispatch(resetCreateRule());
    };
  }, [dispatch]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!createRule.name || !createRule.type) {
        if (!createRule.name) {
          setNameError('Rule name is required');
          dispatch(setCollapseSection({ step: CreateRuleStep.STEP_2, isOpen: true }));
        }
        toast.show('Please fill in all required fields', true);
        return;
      }

      const minQty = createRule.minQty ?? 0;
      const maxQty = createRule.maxQty ?? 0;
      if (minQty > maxQty) {
        toast.show('Min quantity must be less than or equal to max quantity', true);
        return;
      }

      if (
        createRule.type === RuleType.PRODUCT &&
        createRule.ruleProduct?.conditionType === ProductSelectionType.SPECIFIC_PRODUCTS &&
        selectedProducts.length === 0
      ) {
        toast.show('Please select at least one product', true);
        return;
      }

      if (createRule.type === RuleType.COLLECTION && selectedCollections.length === 0) {
        toast.show('Please select at least one collection', true);
        return;
      }

      if (isEditMode && id) {
        await updateRuleMutation({ id, ...createRule } as any).unwrap();
        toast.show('Rule updated successfully', false);
      } else {
        await createRuleMutation(createRule as any).unwrap();
        toast.show('Rule created successfully', false);
      }

      dispatch(resetCreateRule());
      navigate(PATH.RULES.pathname);
    } catch (error) {
      console.error('Failed to save rule:', error);
      toast.show(`Failed to ${isEditMode ? 'update' : 'create'} rule`, true);
    }
  }, [
    createRule,
    createRuleMutation,
    updateRuleMutation,
    dispatch,
    navigate,
    toast,
    isEditMode,
    id,
    selectedProducts,
    selectedCollections,
  ]);

  const STEPS = [
    { step: CreateRuleStep.STEP_1, content: Step1Content },
    { step: CreateRuleStep.STEP_2, content: Step2Content },
  ];

  const handleCancel = useCallback(() => {
    dispatch(resetCreateRule());
    navigate(PATH.RULES.pathname);
  }, [dispatch, navigate]);

  const isStepCompleted = useCallback(
    (step: CreateRuleStep): boolean => {
      if (step === CreateRuleStep.STEP_1) {
        return createRule.type !== undefined;
      }
      if (step === CreateRuleStep.STEP_2) {
        return !!(createRule.name && createRule.minQty !== undefined && createRule.maxQty !== undefined);
      }
      return false;
    },
    [createRule],
  );

  const handleStepToggle = useCallback(
    (step: CreateRuleStep) => {
      dispatch(setCollapseSection({ step, isOpen: !collapseSection[step] }));
    },
    [dispatch, collapseSection],
  );

  const renderStepIndicator = (step: CreateRuleStep, isLast = false) => {
    const isCompleted = isStepCompleted(step);
    const isActive = step === currentStep;
    const stepNumber = getStepNumber(step);
    return (
      <Box direction="vertical" align="center" marginRight="large" style={{ minWidth: '40px' }}>
        <StepCircle $isCompleted={isCompleted} $isActive={isActive}>
          {isCompleted ? '✓' : stepNumber}
        </StepCircle>
        {!isLast && <StepLine $isActive={isCompleted || isActive} />}
      </Box>
    );
  };

  const getSelectedText = (step: CreateRuleStep): React.ReactNode | undefined => {
    if (step === CreateRuleStep.STEP_1 && createRule.type) {
      return <RuleTypeIcon type={createRule.type} isShowText />;
    }
    return undefined;
  };

  if (isEditMode && isRuleLoading) {
    return (
      <Page>
        <Page.Header title="Edit limit" showBackButton onBackClicked={() => navigate(PATH.RULES.pathname)} />
        <Page.Content>
          <Box align="center" padding="large">
            <Loader size="medium" />
          </Box>
        </Page.Content>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header
        title={isEditMode ? 'Edit limit' : 'Create new limit'}
        showBackButton
        onBackClicked={() => navigate(PATH.RULES.pathname)}
        actionsBar={
          <Box direction="horizontal" gap="medium">
            <Button priority="secondary" size="medium" onClick={handleCancel}>
              Cancel
            </Button>
            <Button priority="primary" size="medium" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create Limit'}
            </Button>
          </Box>
        }
      />
      <Page.Content>
        <Layout>
          <Cell span={8}>
            <Box direction="vertical" gap="medium">
              {STEPS.map((stepConfig, index) => {
                const isLast = index === STEPS.length - 1;
                const isOpen = collapseSection[stepConfig.step];
                const StepContent = stepConfig.content;
                const selectedText = getSelectedText(stepConfig.step);

                return (
                  <Box key={stepConfig.step} direction="horizontal" gap="medium">
                    {renderStepIndicator(stepConfig.step, isLast)}
                    <Box style={{ flex: 1 }}>
                      <Card className="w-100">
                        <Box direction="vertical">
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '16px',
                              cursor: 'pointer',
                              borderRadius: '8px',
                            }}
                            onClick={() => handleStepToggle(stepConfig.step)}
                          >
                            <StepHeader step={stepConfig.step} isOpen={isOpen} selectedText={selectedText} />
                            <IconButton size="small" priority="secondary">
                              {isOpen ? <ChevronUp /> : <ChevronDown />}
                            </IconButton>
                          </div>
                          <Collapse open={isOpen}>
                            {stepConfig.step === CreateRuleStep.STEP_2 ? (
                              <StepContent nameError={nameError} onNameErrorClear={() => setNameError(undefined)} />
                            ) : (
                              <StepContent />
                            )}
                          </Collapse>
                        </Box>
                      </Card>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Cell>
          <Cell span={4}>
            <Card>
              <Box direction="vertical" gap="medium" padding="large">
                <Box direction="vertical" gap="small">
                  <Text weight="bold" size="medium">
                    Preview
                  </Text>
                  <Preview
                    formData={
                      appearanceData?.data
                        ? {
                            displayType: appearanceData.data.displayType,
                            backgroundColor: appearanceData.data.backgroundColor,
                            textColor: appearanceData.data.textColor,
                            fontFamily: appearanceData.data.fontFamily,
                            textAlign: appearanceData.data.textAlign,
                            fontSize: appearanceData.data.fontSize,
                            customCss: appearanceData.data.customCss || '',
                          }
                        : undefined
                    }
                    rule={createRule}
                  />
                </Box>
              </Box>
            </Card>
          </Cell>
        </Layout>
      </Page.Content>
    </Page>
  );
}
