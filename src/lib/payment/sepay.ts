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
  const str = String(content).toUpperCase();
  // 1. Direct match: ST123456
  const directMatch = str.match(/ST\d{4,8}/i);
  if (directMatch) return directMatch[0].toUpperCase();

  // 2. Space/dash match: ST 123456 or ST-123456
  const spaceMatch = str.match(/ST[\s\-_]+(\d{4,8})/i);
  if (spaceMatch) return `ST${spaceMatch[1]}`;

  // 3. DH match: DH123456 -> ST123456
  const dhMatch = str.match(/DH[\s\-_]*(\d{4,8})/i);
  if (dhMatch) return `ST${dhMatch[1]}`;

  return null;
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