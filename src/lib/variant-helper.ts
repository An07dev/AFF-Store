export interface IProductOption {
  name: string;
  values: string[];
}

export interface IVariantItem {
  _id?: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
}

/**
 * Thuật toán sinh biến thể tự động bằng Tích Descartes (Cartesian Product)
 */
export function generateCartesianVariants(
  options: IProductOption[],
  basePrice: number,
  baseStock = 10,
  productCode = 'PROD'
): IVariantItem[] {
  const validOptions = options.filter((opt) => opt.name?.trim() && opt.values && opt.values.length > 0);
  if (validOptions.length === 0) return [];

  const cartesian = (arrays: string[][]): string[][] => {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
      [[]]
    );
  };

  const optionValues = validOptions.map((opt) => opt.values);
  const combinations = cartesian(optionValues);

  return combinations.map((combo, idx) => {
    const attributes: Record<string, string> = {};
    const skuParts: string[] = [
      productCode
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase() || 'SP',
    ];

    combo.forEach((val, i) => {
      const optName = validOptions[i].name;
      attributes[optName] = val;
      const cleanVal = val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      skuParts.push(cleanVal || `V${i + 1}`);
    });

    const title = combo.join(' / ');
    const sku = `${skuParts.join('-')}-${idx + 1}`;

    return {
      sku,
      title,
      attributes,
      price: basePrice || 0,
      salePrice: undefined,
      stock: baseStock || 10,
      image: '',
    };
  });
}

/**
 * Tìm biến thể khớp với lựa chọn
 */
export function findMatchingVariant(
  variants: IVariantItem[],
  selectedAttributes: Record<string, string>
): IVariantItem | null {
  if (!variants || variants.length === 0) return null;

  return (
    variants.find((v) => {
      const attrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
      const attrKeys = Object.keys(selectedAttributes);
      if (Object.keys(attrs).length !== attrKeys.length) return false;
      return attrKeys.every((key) => attrs[key] === selectedAttributes[key]);
    }) || null
  );
}
