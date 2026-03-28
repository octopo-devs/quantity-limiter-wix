import styled from 'styled-components';

interface SidebarWrapperProps {
  $isCollapsed?: boolean;
}

export const SidebarWrapper = styled.aside<SidebarWrapperProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.$isCollapsed ? '60px' : '210px')};
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e1e3e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;

  .sidebar-content {
    position: sticky;
    top: 0;
    align-items: ${(props) => (props.$isCollapsed ? 'center' : 'stretch')};
    z-index: 1000;
  }
`;
