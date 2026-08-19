export interface SePayTransaction {
  id?: number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  transferType?: string;
  transferAmount?: number;
  content?: string;
  referenceCode?: string;
  orderCode?: string;
  code?: string;
}

export function extractOrderCode(content?: string): string | null {
  if (!content) return null;
  const match = content.match(/ST\d{4,8}/i);
  return match ? match[0].toUpperCase() : null;
}

export function generateQrUrl(
  bankAccount: string = '0528438642',
  bankCode: string = 'MBBank',
  amount: number = 0,
  content: string = '',
  accountName: string = 'LE VAN AN'
): string {
  const cleanBank = encodeURIComponent(bankCode || 'MBBank');
  const cleanAcc = encodeURIComponent(bankAccount || '0528438642');
  const cleanContent = encodeURIComponent(content || 'Thanh toan don hang');
  const cleanName = encodeURIComponent(accountName || 'LE VAN AN');
  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${amount}&addInfo=${cleanContent}&accountName=${cleanName}`;
}