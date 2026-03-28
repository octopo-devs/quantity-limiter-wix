import { dataSettingsSelector, shopInfoSelector } from '@/redux/slice/settings.slice';
import { Plan } from '@/types/enum';
import { useSelector } from 'react-redux';

const useUserPlan = () => {
  const dataSettings = useSelector(dataSettingsSelector);
  const shopInfo = useSelector(shopInfoSelector);
  const planKey: 'free' | 'standard' = dataSettings.plan === Plan.FREE ? 'free' : 'standard';
  const isPlanLimited = dataSettings.plan === Plan.FREE || dataSettings.plan === Plan.STANDARD;
  const isFreePlan = dataSettings.plan === Plan.FREE;
  const isStandardPlan = dataSettings.plan === Plan.STANDARD;
  // const isShopifyPlanPlus = LIST_PLANS_ACTIVE_CHECKOUT_ACTIONS.includes(shopInfo.shopifyPlan);
  const isShopifyPlanPlus = false;

  const limitPlan = [Plan.FREE, Plan.STANDARD].includes(dataSettings.plan);

  const currentPlan = dataSettings.plan;

  return {
    planKey,
    isPlanLimited,
    limitPlan,
    isFreePlan,
    currentPlan,
    isStandardPlan,
    isShopifyPlanPlus,
  };
};

export default useUserPlan;
