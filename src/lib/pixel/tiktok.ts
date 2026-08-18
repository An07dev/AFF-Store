export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

export function pageview() {
  if (typeof window !== 'undefined' && (window as any).ttq && TIKTOK_PIXEL_ID) {
    (window as any).ttq.page();
  }
}

export function event(name: string, options = {}) {
  if (typeof window !== 'undefined' && (window as any).ttq && TIKTOK_PIXEL_ID) {
    (window as any).ttq.track(name, options);
  }
}