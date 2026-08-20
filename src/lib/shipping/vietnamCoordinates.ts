// Coordinates dictionary for Vietnam provinces, cities and logistics hubs

export const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  'hà nội': [21.0285, 105.8542],
  'hồ chí minh': [10.8231, 106.6297],
  'hải phòng': [20.8449, 106.6881],
  'đà nẵng': [16.0544, 108.2022],
  'cần thơ': [10.0452, 105.7469],
  'bắc ninh': [21.1861, 106.0763],
  'hải dương': [20.9372, 106.3146],
  'hưng yên': [20.6464, 106.0511],
  'hà nam': [20.5841, 105.9224],
  'nam định': [20.4344, 106.1773],
  'thái bình': [20.4463, 106.3366],
  'ninh bình': [20.2506, 105.9745],
  'thanh hóa': [19.8067, 105.7852],
  'nghệ an': [19.2343, 104.9200],
  'hà tĩnh': [18.3428, 105.9059],
  'quảng bình': [17.4690, 106.6225],
  'quảng trị': [16.8164, 107.1002],
  'thừa thiên huế': [16.4637, 107.5909],
  'quảng nam': [15.5394, 108.0191],
  'quảng ngãi': [15.1205, 108.7923],
  'bình định': [14.1667, 108.9000],
  'phú yên': [13.0882, 109.0929],
  'khánh hòa': [12.2388, 109.1967],
  'ninh thuận': [11.6969, 108.9666],
  'bình thuận': [11.0903, 108.0721],
  'kon tum': [14.3497, 108.0005],
  'gia lai': [13.9833, 108.0000],
  'đắk lắk': [12.6667, 108.0500],
  'đắk nông': [12.0044, 107.6875],
  'lâm đồng': [11.9404, 108.4583],
  'bình phước': [11.7511, 106.9036],
  'tây ninh': [11.3351, 106.1099],
  'bình dương': [11.1667, 106.6667],
  'đồng nai': [11.0667, 107.0000],
  'bà rịa - vũng tàu': [10.5425, 107.2425],
  'long an': [10.6956, 106.2431],
  'tiền giang': [10.4283, 106.3421],
  'bến tre': [10.2433, 106.3756],
  'trà vinh': [9.9347, 106.3456],
  'vĩnh long': [10.2537, 105.9722],
  'đồng tháp': [10.4938, 105.6882],
  'an giang': [10.5216, 105.1259],
  'kiên giang': [10.0125, 105.0809],
  'hậu giang': [9.7844, 105.4701],
  'sóc trăng': [9.6033, 105.9800],
  'bạc liêu': [9.2941, 105.7278],
  'cà mau': [9.1769, 105.1524],
  'thái nguyên': [21.5928, 105.8442],
  'phú thọ': [21.3228, 105.2280],
  'vĩnh phúc': [21.3609, 105.5474],
  'bắc giang': [21.2819, 106.1946],
  'quảng ninh': [21.0064, 107.2925],
  'lạng sơn': [21.8537, 106.7622],
  'cao bằng': [22.6667, 106.2500],
  'hà giang': [22.8233, 104.9839],
  'tuyên quang': [21.8233, 105.2144],
  'yên bái': [21.7168, 104.8986],
  'lào cai': [22.4856, 103.9707],
  'sơn la': [21.3283, 103.9148],
  'hòa bình': [20.8172, 105.3380],
  'điện biên': [21.3869, 103.0231],
  'lai châu': [22.3964, 103.4583],
};

export const LOGISTICS_HUBS: Record<string, [number, number]> = {
  'kho_shoptik': [21.0168, 105.7840], // Mỹ Đình, Nam Từ Liêm, Hà Nội
  'kho_bac_ninh': [21.1450, 106.0520], // Kho tổng trung chuyển Bắc Ninh
  'kho_tan_trieu': [20.9780, 105.7980], // Kho trung chuyển Thanh Trì / Tân Triều
  'kho_tan_binh': [10.8010, 106.6530], // Kho tổng Tân Bình HCM
  'kho_da_nang': [16.0320, 108.1920], // Kho tổng Liên Chiểu Đà Nẵng
};

export function resolveCoordinates(
  text: string,
  fallbackProvince?: string,
  fallbackDistrict?: string
): [number, number] {
  const lower = (text + ' ' + (fallbackProvince || '') + ' ' + (fallbackDistrict || '')).toLowerCase();

  // 1. Check known specific logistics hubs
  if (lower.includes('bắc ninh') || lower.includes('kho trung chuyển tổng') || lower.includes('khai thác miền bắc')) {
    return LOGISTICS_HUBS.kho_bac_ninh;
  }
  if (lower.includes('kho shoptik') || lower.includes('mỹ đình') || lower.includes('nam từ liêm')) {
    return LOGISTICS_HUBS.kho_shoptik;
  }
  if (lower.includes('cầu giấy')) {
    return [21.0362, 105.7905];
  }
  if (lower.includes('ba đình')) {
    return [21.0341, 105.8242];
  }
  if (lower.includes('đống đa')) {
    return [21.0180, 105.8280];
  }
  if (lower.includes('hai bà trưng')) {
    return [21.0060, 105.8520];
  }
  if (lower.includes('hoàn kiếm')) {
    return [21.0290, 105.8540];
  }
  if (lower.includes('thanh xuân')) {
    return [20.9980, 105.8080];
  }
  if (lower.includes('hà đông')) {
    return [20.9720, 105.7760];
  }
  if (lower.includes('hoàng mai')) {
    return [20.9750, 105.8450];
  }
  if (lower.includes('long biên')) {
    return [21.0380, 105.8950];
  }
  if (lower.includes('tân bình') || lower.includes('sân bay tân sơn nhất')) {
    return LOGISTICS_HUBS.kho_tan_binh;
  }
  if (lower.includes('quận 1') && lower.includes('hồ chí minh')) {
    return [10.7769, 106.7009];
  }

  // 2. Check matched province
  for (const [prov, coords] of Object.entries(PROVINCE_COORDINATES)) {
    if (lower.includes(prov)) {
      return coords;
    }
  }

  // 3. Default fallback to Hanoi Central
  return [21.0285, 105.8542];
}
