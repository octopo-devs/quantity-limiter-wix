(() => {
  const BASE_URL = 'https://quantity-limiter-wix.synctrack.ioo/w/api';
  const scriptId = '#quantity-limiter-wix-crisp';
  const emailStorageKey = 'omega-email-est-instanceId';
  const setLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.log(err.message);
    }
  };
  const getLocalStorage = (key) => {
    try {
      localStorage.getItem(key);
    } catch (err) {
      console.log(err.message);
    }
  };
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let OTEmailShop;
  var getUrlParameter = function getUrlParameterFunc(sParam, url = window.location.search.substring(1)) {
    var sPageURL = url,
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };

  var customerTypeMapping = {
    basic: 'New Customers',
    standard: 'New Customers',
    pro: 'Premium Customers',
    plus: 'VIP Customers',
  };

  const InitPlugin = async () => {
    let shop = getUrlParameter('shop');
    if (!shop && document.querySelector(scriptId)?.src) {
      const url = new URL(document.querySelector(scriptId).src);
      shop = getUrlParameter('shop', url.search?.substring(1));
    }
    if (!shop && getLocalStorage('shop')) shop = getLocalStorage('shop');
    if (!shop) return;
    let response;
    try {
      const getShopData = await fetch(`${BASE_URL}/shop/crisp/data?shop=${shop}`);
      response = await getShopData.json();
    } catch (err) {
      console.log(err.message);
    }
    if (response && response.data) {
      let shopData = {
        country: '',
        emailShop: '',
        firstInstalledDate: '',
        lastInstalledDate: '',
        uninstalledDate: '',
        phone: '',
        wixPlan: '',
        timezone: '',
        appName: '',
        city: '',
        nameShop: '',
        siteUrl: '',
        plan: '',
      };
      if (response.data !== '') shopData = response.data;
      const customerType = customerTypeMapping[shopData?.appPlan || 'free'];
      OTEmailShop = shopData.emailShop;
      setLocalStorage(emailStorageKey, OTEmailShop);
      window.$crisp = [];
      window.CRISP_TOKEN_ID = window.btoa(shop + shopData.appName);
      window.CRISP_WEBSITE_ID = 'a4bdf13a-e64f-4660-9d3a-b282560b6427';
      const scope = getUrlParameter('scope');
      if (!scope || scope !== 'avada') {
        (function () {
          const saveTimestampFirstMessage = async () => {
            let email = OTEmailShop;
            if (!email && getLocalStorage(emailStorageKey)) email = getLocalStorage(emailStorageKey);
            window.$crisp.push(['set', 'user:email', [email]]);
            let timestamp = window.$crisp.get('session:data', 'timestamp');
            if (timestamp == null) {
              var objToday = new Date();
              const date = objToday.getDate();
              const month = MONTHS[objToday.getMonth()];
              const year = objToday.getFullYear();
              const dateEnder = (function () {
                if (date > 10 && date < 20) return 'th';
                const surplus = date % 10;
                if (surplus === 1) return 'st';
                if (surplus === 2) return 'nd';
                if (surplus === 3) return 'rd';
                return 'th';
              })();
              const dayOfMonth = ('0' + date).slice(-2) + dateEnder;
              const hour = ('0' + (objToday.getHours() > 12 ? objToday.getHours() - 12 : objToday.getHours())).slice(-2);
              const minute = ('0' + objToday.getMinutes()).slice(-2);
              const seconds = ('0' + objToday.getSeconds()).slice(-2);
              const meridiem = objToday.getHours() < 12 ? 'AM' : 'PM';
              var today = dayOfMonth + ' ' + month + ' ' + year + ' ' + hour + ':' + minute + ':' + seconds + '' + meridiem;
              window.$crisp.push(['set', 'session:data', [[['timestamp', today]]]]);
              // try {
              //   await fetch(`${BASE_URL}/shop/crisp/first-message`, {
              //     method: 'PUT',
              //     headers: { 'Content-Type': 'application/json' },
              //     body: JSON.stringify({ shop, timestamp: today }),
              //   });
              // } catch (err) {
              //   console.log(err.message);
              // }
            }
          };

          d = document;
          s = d.createElement('script');
          s.src = 'https://client.crisp.chat/l.js';
          s.async = 1;
          d.getElementsByTagName('head')[0].appendChild(s);
          window.$crisp.push(['set', 'user:phone', [shopData.phone]]);
          window.$crisp.push(['set', 'user:nickname', [shop]]);
          window.$crisp.push(['set', 'session:segments', [['Wix - Order limiter Delivery Date', customerType]]]);
          window.$crisp.push(['on', 'chat:closed', OTChatClosed]);
          window.$crisp.push(['on', 'user:phone:changed', OTChatClosed]);
          window.$crisp.push(['on', 'message:sent', saveTimestampFirstMessage]);
          $crisp.push([
            'set',
            'session:data',
            [
              [
                ['wix_plan', ''],
                ['store_url', shopData.siteUrl || ''],
                ['instance_id', shopData.instanceId || ''],
                ['app_plan', shopData.plan || ''],
                ['email_store', shopData.emailShop || ''],
                ['country', shopData.country || ''],
                ['date_installed', shopData.firstInstalledDate || ''],
                ['last_installed', shopData.lastInstalledDate || ''],
                ['store_name', shopData.nameShop || ''],
                ['store_created_at', shopData.storeCreatedAt || ''],
                ['instance_id', shopData.instanceId || ''],
                ['review_history', shopData.reviewHistory || ''],
              ],
            ],
          ]);
          crispPosition();
          // ban event holiday
          const timestamp = Date.now();
          const from = new Date(2022, 0, 29, 0, 0, 0).getTime();
          const to = new Date(2022, 1, 7, 7, 59, 59).getTime();
          if (timestamp >= from && timestamp <= to) window.$crisp.push(['set', 'session:event', ['omega_holiday']]);
        })();
      }
    }
  };

  function OTChatClosed() {
    let email = window.$crisp.get('user:email');
    if (!email) window.$crisp.push(['set', 'user:email', [OTEmailShop]]);
  }

  function crispPosition() {
    if (window.innerWidth < 600) window.$crisp.push(['config', 'position:reverse', [true]]);
    window.addEventListener('resize', () => {
      if (window.innerWidth < 600) window.$crisp.push(['config', 'position:reverse', [true]]);
      else window.$crisp.push(['config', 'position:reverse', [false]]);
    });
  }

  InitPlugin();
})();
