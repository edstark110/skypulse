// ATLAS · motion presets — driven by settings.motion (low | medium | high).

export const EASE = {
  outExpo:  [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOut:    [0.65, 0, 0.35, 1],
};

const DUR = {
  low:    { fast: 0.12, med: 0.20, slow: 0.30, cinematic: 0.40 },
  medium: { fast: 0.24, med: 0.52, slow: 0.88, cinematic: 1.20 },
  high:   { fast: 0.32, med: 0.72, slow: 1.10, cinematic: 1.60 },
};

export function dur(level = 'medium') {
  return DUR[level] || DUR.medium;
}

export function fadeIn(level = 'medium') {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: dur(level).med, ease: EASE.outExpo },
  };
}

export function revealUp(level = 'medium', delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -8 },
    transition: { duration: dur(level).slow, ease: EASE.outExpo, delay },
  };
}

export function staggerChildren(delayStep = 0.06) {
  return { animate: { transition: { staggerChildren: delayStep } } };
}

export function sceneTransition(level = 'medium') {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: dur(level).cinematic, ease: EASE.outExpo },
  };
}
