
export const performanceStats = {
  activeContexts: 0,
  activeRafs: 0,
  activePlanes: 0
};

export const trackContext = (delta: number) => {
  performanceStats.activeContexts += delta;
};

export const trackRaf = (delta: number) => {
  performanceStats.activeRafs += delta;
};

export const trackPlane = (delta: number) => {
  performanceStats.activePlanes += delta;
};
