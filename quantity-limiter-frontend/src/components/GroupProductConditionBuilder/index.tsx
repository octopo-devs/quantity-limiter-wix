import {
  groupProductOperatorOptions,
  groupProductTypeOptions,
} from '@/pages/Rules/components/CreateRule/components/Step2Content/config';
import { RuleGroupProductConditionOperator, RuleGroupProductConditionType } from '@/types/enum';
import { RuleGroupProductCondition } from '@/types/interface/rule.interface';
import { Box, Button, Dropdown, Input, IconButton, Text } from '@wix/design-system';
import { Delete } from '@wix/wix-ui-icons-common';
import { useCallback } from 'react';

interface GroupProductConditionBuilderProps {
  conditions: RuleGroupProductCondition[];
  onChange: (conditions: RuleGroupProductCondition[]) => void;
}

const createEmptyCondition = (): RuleGroupProductCondition => ({
  type: RuleGroupProductConditionType.TAG,
  operator: RuleGroupProductConditionOperator.EQUALS,
  value: '',
});

export default function GroupProductConditionBuilder({ conditions, onChange }: GroupProductConditionBuilderProps) {
  const handleAdd = useCallback(() => {
    onChange([...conditions, createEmptyCondition()]);
  }, [conditions, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(conditions.filter((_, i) => i !== index));
    },
    [conditions, onChange],
  );

  const handleFieldChange = useCallback(
    (index: number, field: keyof RuleGroupProductCondition, value: any) => {
      const updated = conditions.map((c, i) => (i === index ? { ...c, [field]: value } : c));
      onChange(updated);
    },
    [conditions, onChange],
  );

  return (
    <Box direction="vertical" gap="small">
      {conditions.map((condition, index) => (
        <Box key={index} direction="horizontal" gap="small" align="center" style={{ alignItems: 'center' }}>
          <Box style={{ width: '140px', flexShrink: 0 }}>
            <Dropdown
              size="small"
              options={groupProductTypeOptions}
              selectedId={condition.type}
              onSelect={(option) => handleFieldChange(index, 'type', option.id)}
            >
              <Button size="small" priority="secondary" style={{ width: '100%' }}>
                {groupProductTypeOptions.find((o) => o.id === condition.type)?.value || 'Select'}
              </Button>
            </Dropdown>
          </Box>
          <Box style={{ width: '160px', flexShrink: 0 }}>
            <Dropdown
              size="small"
              options={groupProductOperatorOptions}
              selectedId={condition.operator}
              onSelect={(option) => handleFieldChange(index, 'operator', option.id)}
            >
              <Button size="small" priority="secondary" style={{ width: '100%' }}>
                {groupProductOperatorOptions.find((o) => o.id === condition.operator)?.value || 'Select'}
              </Button>
            </Dropdown>
          </Box>
          <Box style={{ flex: 1 }}>
            <Input
              size="small"
              value={String(condition.value || '')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(index, 'value', e.target.value)}
              placeholder="Enter value"
            />
          </Box>
          <IconButton size="small" priority="secondary" onClick={() => handleRemove(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Box>
        <Button size="small" priority="secondary" onClick={handleAdd}>
          + Add Condition
        </Button>
      </Box>
    </Box>
  );
}
