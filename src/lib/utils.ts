import slugify from 'slugify';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
}

export function generateSlug(text: string): string {
  return slugify(text || '', {
    lower: true,
    strict: true,
    locale: 'vi',
  });
}

export function generateOrderCode(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ST${random}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}