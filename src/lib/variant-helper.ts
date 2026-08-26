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
  originalPrice?: number;
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
  variants: any[],
  selectedAttributes: Record<string, string>
): any | null {
  if (!variants || variants.length === 0) return null;

  const selectedKeys = Object.keys(selectedAttributes).filter((k) => selectedAttributes[k]);
  if (selectedKeys.length === 0) return null;

  return (
    variants.find((v) => {
      const rawAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {});
      const attrs: Record<string, string> = { ...rawAttrs };

      // Fallback for direct color/size fields
      if (v.color && !attrs['Màu sắc'] && !attrs['Màu'] && !attrs['Color']) {
        attrs['Màu sắc'] = v.color;
      }
      if (v.size && !attrs['Kích cỡ'] && !attrs['Size'] && !attrs['Kích thước']) {
        attrs['Kích cỡ'] = v.size;
      }

      return selectedKeys.every((key) => {
        const selVal = selectedAttributes[key]?.trim();
        if (!selVal) return true;

        if (attrs[key]?.trim() === selVal) return true;

        // Case-insensitive key lookup
        const entry = Object.entries(attrs).find(
          ([k]) => k.trim().toLowerCase() === key.trim().toLowerCase()
        );
        if (entry && entry[1]?.trim() === selVal) return true;

        return false;
      });
    }) || null
  );
}
