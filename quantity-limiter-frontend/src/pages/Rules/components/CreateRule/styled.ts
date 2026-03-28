import styled from 'styled-components';

export const StepLine = styled.div<{ $isActive: boolean }>`
  width: 2px;
  flex: 1;
  background-color: ${(props) => (props.$isActive ? '#4A90E2' : '#E0E0E0')};
  margin-top: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
`;

export const StepCircle = styled.div<{ $isCompleted: boolean; $isActive: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) => (props.$isCompleted ? '#4A90E2' : props.$isActive ? '#4A90E2' : '#E0E0E0')};
  color: ${(props) => (props.$isCompleted || props.$isActive ? '#FFFFFF' : '#999999')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
`;

export const StepHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const RuleTypeOption = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${(props) => (props.$isSelected ? '#4A90E2' : '#E0E0E0')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.$isSelected ? '#F0F7FF' : '#FFFFFF')};
  &:hover {
    border-color: #4a90e2;
    background-color: ${(props) => (props.$isSelected ? '#F0F7FF' : '#F5F5F5')};
  }
`;
