import { upperFirstCase } from '@/helpers';
import { RuleType } from '@/types/enum';
import { Box, Text } from '@wix/design-system';
import { RULE_TYPE_ICON_COLORS } from '../../config';
import { RULE_TYPE_ICONS } from '../CreateRule/config';

export default function RuleTypeIcon({ type, isShowText = true }: { type: RuleType; isShowText?: boolean }) {
  const IconComponent = RULE_TYPE_ICONS[type];
  return (
    <Box direction="horizontal" gap="tiny" align="left">
      <Box
        align="center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconComponent color={RULE_TYPE_ICON_COLORS[type]} size="24px" />
      </Box>
      {isShowText && <Text>{upperFirstCase(type)} limit</Text>}
    </Box>
  );
}
