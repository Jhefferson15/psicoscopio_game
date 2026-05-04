import { useEffect, useRef } from 'react';

export const useBrowserHistorySync = ({
  currentScreen,
  setCurrentScreen,
  showModal,
  setShowModal,
  focusedCard,
  setFocusedCard,
  showCardHistory,
  setShowCardHistory,
  showDiary,
  setShowDiary,
  showLeaveConfirm,
  setShowLeaveConfirm
}) => {
  const isInternalNavigation = useRef(false);
  const lastPushedStateRef = useRef(null);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        isInternalNavigation.current = true;
        lastPushedStateRef.current = event.state;
        const { screen, hasModal, hasFocusedCard, hasCardHistory, hasDiary } = event.state;
        
        // Se estiver no jogo e tentar voltar para o menu, interceptamos
        if (currentScreen === 'game' && screen === 'menu' && !showLeaveConfirm) {
          setShowLeaveConfirm(true);
          const stateToResume = {
            screen: 'game',
            hasModal: !!showModal,
            hasFocusedCard: !!focusedCard,
            hasCardHistory: !!showCardHistory,
            hasDiary: !!showDiary
          };
          window.history.pushState(stateToResume, '');
          lastPushedStateRef.current = stateToResume;
          isInternalNavigation.current = false;
          return;
        }

        // Atualiza os estados baseado no histórico
        if (screen && screen !== currentScreen) setCurrentScreen(screen);
        if (!hasModal && showModal) setShowModal(null);
        if (!hasFocusedCard && focusedCard) setFocusedCard(null);
        if (!hasCardHistory && showCardHistory) setShowCardHistory(false);
        if (!hasDiary && showDiary) setShowDiary(false);
        
        setTimeout(() => { isInternalNavigation.current = false; }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    if (!window.history.state) {
      const initialState = { 
        screen: currentScreen,
        hasModal: !!showModal,
        hasFocusedCard: !!focusedCard,
        hasCardHistory: !!showCardHistory,
        hasDiary: !!showDiary
      };
      window.history.replaceState(initialState, '');
      lastPushedStateRef.current = initialState;
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen, showModal, focusedCard, showCardHistory, showDiary, showLeaveConfirm, setCurrentScreen, setShowModal, setFocusedCard, setShowCardHistory, setShowDiary, setShowLeaveConfirm]);

  useEffect(() => {
    if (isInternalNavigation.current) return;

    const currentState = {
      screen: currentScreen,
      hasModal: !!showModal,
      hasFocusedCard: !!focusedCard,
      hasCardHistory: !!showCardHistory,
      hasDiary: !!showDiary
    };

    const lastState = lastPushedStateRef.current;
    const isDifferent = !lastState || 
      lastState.screen !== currentState.screen ||
      lastState.hasModal !== currentState.hasModal ||
      lastState.hasFocusedCard !== currentState.hasFocusedCard ||
      lastState.hasCardHistory !== currentState.hasCardHistory ||
      lastState.hasDiary !== currentState.hasDiary;

    if (isDifferent) {
      window.history.pushState(currentState, '');
      lastPushedStateRef.current = currentState;
    }
  }, [currentScreen, showModal, focusedCard, showCardHistory, showDiary]);
};
