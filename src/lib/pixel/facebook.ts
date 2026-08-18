export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

export function pageview() {
  if (typeof window !== 'undefined' && (window as any).fbq && FB_PIXEL_ID) {
    (window as any).fbq('track', 'PageView');
  }
}

export function event(name: string, options = {}) {
  if (typeof window !== 'undefined' && (window as any).fbq && FB_PIXEL_ID) {
    (window as any).fbq('track', name, options);
  }
}