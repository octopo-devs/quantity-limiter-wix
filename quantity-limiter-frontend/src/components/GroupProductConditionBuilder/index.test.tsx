import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupProductConditionBuilder from './index';
import { RuleGroupProductConditionOperator, RuleGroupProductConditionType } from '@/types/enum';
import { RuleGroupProductCondition } from '@/types/interface/rule.interface';

describe('GroupProductConditionBuilder', () => {
  it('renders empty state with Add Condition button when conditions is empty', () => {
    render(<GroupProductConditionBuilder conditions={[]} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Add Condition/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Enter value/i)).not.toBeInTheDocument();
  });

  it('clicking Add Condition appends a default row (Tag / Equals / "")', async () => {
    const onChange = jest.fn();
    render(<GroupProductConditionBuilder conditions={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Add Condition/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledWith = onChange.mock.calls[0][0] as RuleGroupProductCondition[];
    expect(calledWith).toHaveLength(1);
    expect(calledWith[0]).toMatchObject({
      type: RuleGroupProductConditionType.TAG,
      operator: RuleGroupProductConditionOperator.EQUALS,
      value: '',
    });
  });

  it('clicking delete on a row calls onChange with that row removed', async () => {
    const onChange = jest.fn();
    const conditions: RuleGroupProductCondition[] = [
      { type: RuleGroupProductConditionType.TAG, operator: RuleGroupProductConditionOperator.EQUALS, value: 'a' },
      { type: RuleGroupProductConditionType.TITLE, operator: RuleGroupProductConditionOperator.CONTAINS, value: 'b' },
    ];
    const { container } = render(<GroupProductConditionBuilder conditions={conditions} onChange={onChange} />);

    const rows = Array.from(container.querySelectorAll('[class*="direction-10-horizontal"]')) as HTMLElement[];
    const firstRowDeleteBtn = rows[0].querySelector('button:last-of-type') as HTMLElement;
    await userEvent.click(firstRowDeleteBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledWith = onChange.mock.calls[0][0] as RuleGroupProductCondition[];
    expect(calledWith).toHaveLength(1);
    expect(calledWith[0].value).toBe('b');
  });

  it('typing in a value input calls onChange with updated row', async () => {
    const onChange = jest.fn();
    const conditions: RuleGroupProductCondition[] = [
      { type: RuleGroupProductConditionType.TAG, operator: RuleGroupProductConditionOperator.EQUALS, value: '' },
    ];
    render(<GroupProductConditionBuilder conditions={conditions} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/Enter value/i) as HTMLInputElement;
    await userEvent.type(input, 's');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as RuleGroupProductCondition[];
    expect(lastCall[0].value).toBe('s');
  });
});
