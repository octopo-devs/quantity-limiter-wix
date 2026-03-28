export interface WeightConversion {
  pounds: number;
  ounces: number;
}

export function convertGramsToPounds(grams: number): WeightConversion {
  const pounds = parseFloat(String(grams / 0.454));
  return {
    pounds,
    ounces: parseFloat(String((454 * pounds) / 28)),
  };
}

export function convertWeight(weight: number, unit: 'kg' | 'lb' | 'oz' | 'g'): number {
  switch (unit) {
    case 'kg':
      return weight / 1000;
    case 'lb':
      return convertGramsToPounds(weight / 1000).pounds;
    case 'oz':
      return convertGramsToPounds(weight / 1000).ounces;
    default:
      return weight;
  }
}
