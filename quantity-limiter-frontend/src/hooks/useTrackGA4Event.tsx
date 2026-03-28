import { config } from '@/config';
import { apiCaller } from '@/redux/query';
import sessionSlice, { ga4EventSelector } from '@/redux/slice/session.slice';
import { Ga4Event, Plan, Subscription } from '@/types/enum';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useTrackGA4Event = () => {
  const dispatch = useDispatch();
  const [sendGA4Event] = apiCaller.useSendGA4EventMutation();
  const ga4Event = useSelector(ga4EventSelector);

  const trackGA4Event = useCallback(
    (event: Ga4Event, plan?: Plan, type?: Subscription) => {
      if (config.embedded && !ga4Event[event]) {
        sendGA4Event({ event, plan, type });
        dispatch(sessionSlice.actions.handleGa4Event(event));
      }
    },
    [dispatch, ga4Event, sendGA4Event],
  );

  return trackGA4Event;
};

export default useTrackGA4Event;
