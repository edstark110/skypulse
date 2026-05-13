// ATLAS · app shell — Lenis smooth scroll, lazy airports load, persistent header/ticker/toast.

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { loadFullAirports } from '../lib/airports.js';
import TopTicker from '../components/TopTicker.jsx';
import Header from '../components/Header.jsx';
import Toast from '../components/Toast.jsx';
import SceneManager from './SceneManager.jsx';

export default function App() {
  // Lazy-load the full 7K airports JSON on mount
  useEffect(() => { loadFullAirports(); }, []);

  // Smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let rafId;
    function raf(t) { lenis.raf(t); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <TopTicker />
      <Header />
      <main className="relative">
        <SceneManager />
      </main>
      <Toast />
    </div>
  );
}
