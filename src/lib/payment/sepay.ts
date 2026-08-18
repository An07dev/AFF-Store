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
  bankAccount: string = '0988123456',
  bankCode: string = 'MBBank',
  amount: number = 0,
  content: string = ''
): string {
  const cleanBank = encodeURIComponent(bankCode || 'MBBank');
  const cleanAcc = encodeURIComponent(bankAccount || '0988123456');
  const cleanContent = encodeURIComponent(content || 'Thanh toan don hang');
  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${amount}&addInfo=${cleanContent}&accountName=SHOPTIK%20STORE`;
}