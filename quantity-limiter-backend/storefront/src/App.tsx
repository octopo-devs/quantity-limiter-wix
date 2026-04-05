import { useEffect, useMemo } from 'react';
import MainContainer from './components/MainContainer';
import useAppContext from './context/AppContext/useAppContext';
import { ClassEnum } from './shared/types/class.enum';
import { CustomStyled } from './styled/custom-styled';

function App() {
  const { shopGeneral, isAppEnabled, isAllApiCalled } = useAppContext();

  useEffect(() => {
    console.log('%c Quantity Limiter v1.0', 'color: red; background-color: black', 'Enabled:', isAppEnabled);
  }, [isAppEnabled]);

  const isNotRenderApp = useMemo(() => {
    return !shopGeneral || !isAllApiCalled;
  }, [shopGeneral, isAllApiCalled]);

  return isNotRenderApp ? (
    <></>
  ) : (
    <>
      <CustomStyled mainClass={ClassEnum.Main} shopGeneral={shopGeneral} />
      {isAppEnabled && <MainContainer />}
    </>
  );
}

export default App;
