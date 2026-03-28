import { upperFirstCase } from '@/helpers';
import { createRuleSelector, setCollapseSection, setCurrentStep, setRuleType } from '@/redux/slice/createRule.slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { RuleType } from '@/types/enum';
import { Box, Text } from '@wix/design-system';
import { useCallback } from 'react';
import RuleTypeIcon from '../../../RuleTypeIcon';
import { CreateRuleStep } from '../../config';
import { RuleTypeOption } from '../../styled';

const ENABLED_RULE_TYPES = [RuleType.PRODUCT, RuleType.COLLECTION, RuleType.CUSTOMER];

export default function Step1Content() {
  const dispatch = useAppDispatch();
  const createRule = useAppSelector(createRuleSelector);

  const handleRuleTypeSelect = useCallback(
    (ruleType: RuleType) => {
      dispatch(setRuleType(ruleType));
      dispatch(setCollapseSection({ step: CreateRuleStep.STEP_1, isOpen: false }));
      dispatch(setCollapseSection({ step: CreateRuleStep.STEP_2, isOpen: true }));
      dispatch(setCurrentStep(CreateRuleStep.STEP_2));
    },
    [dispatch],
  );

  return (
    <Box
      padding="medium"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
      }}
    >
      {ENABLED_RULE_TYPES.map((ruleType) => {
        const isSelected = createRule.type === ruleType;
        return (
          <RuleTypeOption key={ruleType} $isSelected={isSelected} onClick={() => handleRuleTypeSelect(ruleType)}>
            <RuleTypeIcon type={ruleType} isShowText={false} />
            <Box direction="vertical" gap="tiny">
              <Text weight="bold">{upperFirstCase(ruleType)} limit</Text>
              <Text size="small" secondary>
                Limit quantity for {ruleType.toLowerCase()} rules
              </Text>
            </Box>
          </RuleTypeOption>
        );
      })}
    </Box>
  );
}
