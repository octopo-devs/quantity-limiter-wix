/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */

// Extend the Window interface to include the Canny function
declare global {
  interface Window {
    Canny: (...args: any[]) => void; // Replace `any[]` with more specific argument types if known.
  }
}

const BOARD_TOKEN = process.env.CANNY_BOARD_TOKEN;
const APP_ID = process.env.REACT_APP_CANNY_APP_ID;

export const useCanny = () => {
  return { isLoading: false };
  // const { data } = apiCaller.useGetCannyTokenQuery();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   (function (w: Window & typeof globalThis, d: Document, i: string, s: string) {
  //     function l() {
  //       if (!d.getElementById(i)) {
  //         var f = d.getElementsByTagName(s)[0];
  //         var e = d.createElement(s) as HTMLScriptElement; // Type assertion here
  //         e.type = 'text/javascript';
  //         e.async = true;
  //         e.src = 'https://canny.io/sdk.js';
  //         f.parentNode!.insertBefore(e, f);
  //       }
  //     }
  //     if (typeof w.Canny !== 'function') {
  //       var c = function () {
  //         (c as any).q.push(arguments);
  //       } as any;
  //       c.q = [];
  //       w.Canny = c;
  //       if (d.readyState === 'complete') {
  //         l();
  //       } else {
  //         w.addEventListener('load', l, false);
  //       }
  //     }
  //   })(window, document, 'canny-jssdk', 'script');

  //   // Assuming the Canny global function has been correctly typed to accept these arguments
  //   if (!data?.data?.token) return;
  //   window.Canny('render', {
  //     boardToken: BOARD_TOKEN,
  //     basePath: '', // Set to an empty string if null is not allowed
  //     ssoToken: data?.data?.token || '', // Set to an empty string if null is not allowed
  //     theme: 'light', // options: light [default], dark, auto
  //     onLoadCallback: () => {
  //       setIsLoading(false);
  //     },
  //   });

  //   window.Canny('initChangelog', {
  //     appID: APP_ID,
  //     position: 'bottom',
  //     align: 'left',
  //     theme: 'light', // options: light [default], dark, auto
  //   });
  // }, [data?.data?.token]);

  // return { isLoading };
};
