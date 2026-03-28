import { config } from '@/config';
import { useMemo } from 'react';

const useScope = () => {
  // const profile = apiAdminCaller.useFetchProfileQuery(undefined, { skip: config.source !== 'admin' || !config.token });
  const rules = useMemo(() => {
    if (config.hmac) {
      return {
        isAccessApp: true,
        isViewOnly: false,
        isLoading: false,
      };
    }
    // return {
    //   isAccessApp: !!profile.data?.data.user.apps.includes(App.Synctrack),
    //   isViewOnly: !profile.data?.data.user.permissions.includes(UserPermission.Edit),
    //   isLoading: profile.isLoading,
    // };
  }, []);
  return {
    ...rules,
  };
};
export default useScope;
