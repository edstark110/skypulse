// Scene orchestrator — three scenes, no transitional "search" state.
// (The idle hero IS the search surface; the prior intermediate scene was
//  causing mid-click form unmount and a reset glitch.)

import { AnimatePresence } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import IdleScene from '../scenes/IdleScene.jsx';
import ResultsScene from '../scenes/ResultsScene.jsx';
import TripsScene from '../scenes/TripsScene.jsx';

export default function SceneManager() {
  const scene = useFlightStore(s => s.scene);

  return (
    <AnimatePresence mode="wait">
      {scene === 'idle'    && <IdleScene    key="idle"    />}
      {scene === 'results' && <ResultsScene key="results" />}
      {scene === 'trips'   && <TripsScene   key="trips"   />}
    </AnimatePresence>
  );
}
