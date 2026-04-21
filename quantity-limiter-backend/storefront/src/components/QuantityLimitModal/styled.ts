import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
`;

export const ModalBox = styled.div<{
  $backgroundColor: string;
  $textColor: string;
  $fontSize: number;
  $textAlign: string;
  $fontFamily: string;
}>`
  position: relative;
  max-width: 400px;
  width: 90%;
  padding: 24px;
  border-radius: 8px;
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  font-size: ${(props) => props.$fontSize}px;
  text-align: ${(props) => props.$textAlign};
  font-family: ${(props) => props.$fontFamily};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const WarningIconCircle = styled.div`
  width: 48px;
  height: 48px;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

export const ContactLink = styled.a`
  color: #4a90e2;
  text-decoration: underline;
  cursor: pointer;
`;
