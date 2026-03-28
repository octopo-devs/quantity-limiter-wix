import { Box, Text } from '@wix/design-system';
import { CreateRuleStep, getStepNumber, STEP_CONFIG } from '../../config';

interface StepHeaderProps {
  step: CreateRuleStep;
  isOpen: boolean;
  selectedText?: React.ReactNode;
}

export default function StepHeader({ step, isOpen, selectedText }: StepHeaderProps) {
  const stepNumber = getStepNumber(step);
  return (
    <Box direction="horizontal" align="left" justifyItems="center" gap="small" style={{ flex: 1 }}>
      <Text weight="bold">
        Step {stepNumber}: {STEP_CONFIG[step].title}
      </Text>
      {selectedText && !isOpen && (
        <Text size="small" secondary>
          {selectedText}
        </Text>
      )}
    </Box>
  );
}
