import styled from 'styled-components';

export const HomeStyled = styled.div`
  .apps-title {
    display: flex;
    justify-content: space-between;
  }
  .apps-wrapper {
    .recommended-apps-container {
      display: flex;
      .recommend-app-logo {
        width: 50px;
        height: 50px;
        border-radius: 0.5rem;
      }
      .recommend-app-content {
        width: 100%;
        .Polaris-Text--root {
          line-height: 1.25rem;
        }
        .Polaris-Icon {
          svg {
            stroke: yellow;
            opacity: 0.6;
          }
          margin: 0;
          margin-right: 0.25rem;
          margin-top: -1px;
        }
      }
    }
    .recommend-app-banner {
      margin-top: 1rem;
      width: 100%;
    }
    .recommend-app-btn {
    }
    .Polaris-ShadowBevel {
      height: 100%;
      .Polaris-Box {
        display: flex;
      }
    }
  }
  .recommend-apps-controller {
    display: flex;
    cursor: pointer;
  }
  .bfs-badge {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    font-weight: 500;
    padding: 4px 8px 4px 8px;
    background-color: rgb(224, 240, 255);
    border-radius: 4px;
    gap: 4px;
  }
  .wrap-blockify-banner {
    .Polaris-Box {
      padding: 0;
      cursor: pointer;
    }
  }
  .img {
    width: 100%;
    border-radius: 0.75rem;
    cursor: pointer;
  }
`;
