import { TextAlign } from '@/types/enum';
import { Button } from '@wix/design-system';
import styled from 'styled-components';

export const MobileFrame = styled.div`
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ContactLink = styled.a`
  color: #4a90e2;
  text-decoration: underline;
  cursor: pointer;
`;

export const ActionButton = styled(Button)<{ isDisabled?: boolean }>`
  width: 100%;
  margin-top: 8px;
  opacity: ${(props) => (props.isDisabled ? 0.5 : 1)};
  cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
`;

export const ModalContent = styled.div<{
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  textAlign: TextAlign;
  fontFamily: string;
}>`
  padding: 24px;
  text-align: ${(props) => props.textAlign.toLowerCase()};
  font-size: ${(props) => props.fontSize}px;
  color: ${(props) => props.textColor};
  background-color: ${(props) => props.backgroundColor};
  border-radius: 8px;
  font-family: ${(props) => props.fontFamily || 'inherit'};
`;

export const ModalWarningIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WarningBox = styled.div<{
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  textAlign: TextAlign;
  fontFamily: string;
}>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: ${(props) => props.fontSize}px;
  text-align: ${(props) => props.textAlign.toLowerCase()};
  font-family: ${(props) => props.fontFamily || 'inherit'};
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;
