export const VIEWPORTS = {
  desktop: 'w-full h-full',
  tablet: 'w-[768px] h-[1024px] shadow-2xl my-8',
  mobile: 'w-[375px] h-[812px] shadow-2xl my-8',
} as const;

export type ViewportMode = keyof typeof VIEWPORTS;
