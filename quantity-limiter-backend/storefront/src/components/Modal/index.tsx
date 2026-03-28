import styled from 'styled-components';
import ReactDOM from 'react-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 80vw;

  @media (min-width: 810px) {
    width: 50vw;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.span`
  cursor: pointer;
  font-size: 30px;
  line-height: 30px;
`;

const Divider = styled.hr`
  margin: 10px 0;
  border: 0;
  border-top: 1px solid #ccc;
`;

interface IProps {
  children: React.ReactNode;
  handleClose: () => void;
  isModalOpen: boolean;
  titleCenter?: boolean;
  title?: string;
}

export const BaseModal = ({ children, handleClose, isModalOpen, titleCenter, title }: IProps) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) {
      handleClose();
    }
  };
  return (
    isModalOpen &&
    ReactDOM.createPortal(
      <ModalOverlay onClick={handleOverlayClick}>
        <ModalContent>
          <ModalHeader>
            <h2
              style={{ fontSize: '25px', fontWeight: 500, margin: 0, width: '100%', textAlign: titleCenter ? 'center' : 'left' }}
            >
              {title || ''}
            </h2>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
          </ModalHeader>
          <Divider />
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
        </ModalContent>
      </ModalOverlay>,
      document.body,
    )
  );
};
