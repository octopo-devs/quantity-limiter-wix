import store, { persistor } from '@/redux/store';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { WixDesignSystemProvider } from '@wix/design-system';
import App from './App';
import './index.css';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WixDesignSystemProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WixDesignSystemProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals((e) => {
//   const countReloadConfigShop = sessionStorage.getItem('countReloadConfigShop');
//   if (!config.shop && !countReloadConfigShop) {
//     sessionStorage.setItem('countReloadConfigShop', '1');
//     document.location.reload();
//   }

//   if (e.name === 'LCP') {
//     axios({
//       url: `${process.env.REACT_APP_API_END_POINT}admin/dashboard/performance-log`,
//       method: 'POST',
//       data: {
//         shop: config.shop,
//         value: e.value,
//         path: window.location.pathname,
//       },
//     }).catch((error) => {
//       console.log(error);
//     });
//   }

//   const countReloadFCP = localStorage.getItem('countReloadFCP');
//   if (e.name === 'FCP' && !Number(countReloadFCP)) {
//     if (e.value > 1800) {
//       localStorage.setItem('countReloadFCP', '1');
//       document.location.reload();
//     }
//   }
// });
