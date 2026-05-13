// Scene orchestrator — fades between idle / search / results / trips.

import { AnimatePresence } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import IdleScene from '../scenes/IdleScene.jsx';
import SearchScene from '../scenes/SearchScene.jsx';
import ResultsScene from '../scenes/ResultsScene.jsx';
import TripsScene from '../scenes/TripsScene.jsx';

export default function SceneManager() {
  const scene = useFlightStore(s => s.scene);

  return (
    <AnimatePresence mode="wait">
      {scene === 'idle'    && <IdleScene    key="idle"    />}
      {scene === 'search'  && <SearchScene  key="search"  />}
      {scene === 'results' && <ResultsScene key="results" />}
      {scene === 'trips'   && <TripsScene   key="trips"   />}
    </AnimatePresence>
  );
}
