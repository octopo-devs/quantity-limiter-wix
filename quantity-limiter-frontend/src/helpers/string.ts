export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const stringify = (input: any) => {
  return JSON.stringify(input);
};

export function uniq(a: Array<any>) {
  return Array.from(new Set(a.map((item) => stringify(item)))).map((item) => JSON.parse(item));
}

export function uniqByKey(a: Array<any>, key?: string) {
  try {
    if (!key) return Array.from(new Set(a.map((item) => stringify(item)))).map((item) => JSON.parse(item));
    return Array.from(new Set(a.map((item) => stringify(item[key])))).map((item) =>
      a.find((i) => i[key] === JSON.parse(item)),
    );
  } catch (error) {
    console.log(error);
    return a;
  }
}

export const checkCountryCodesEquals = (str1: string, str2: string) => {
  // Chuyển chuỗi thành mảng các phần tử, sử dụng trim() để loại bỏ khoảng trắng
  const arr1 = str1.split(',').map((item) => item.trim());
  const arr2 = str2.split(',').map((item) => item.trim());

  // Kiểm tra tất cả các phần tử của mảng arr1 có trong arr2 và ngược lại
  const allInArr2 = arr1.every((item) => arr2.includes(item));
  const allInArr1 = arr2.every((item) => arr1.includes(item));

  return allInArr1 && allInArr2;
};

export const checkCodesExists = (str1: string, str2: string) => {
  // Chuyển chuỗi thành mảng các phần tử, sử dụng trim() để loại bỏ khoảng trắng
  const arr1 = str1.split(',').map((item) => item.trim());
  const arr2 = str2.split(',').map((item) => item.trim());

  const someInArr1 = arr2.some((item) => arr1.includes(item));

  return someInArr1;
};

export const generateShortName = (name: string, separator?: string) => {
  const arrName = name.split(separator ?? ',');
  return arrName.length > 1 ? `${arrName[0]} + ${arrName.length - 1} more` : arrName[0];
};

export const splitStringByIndex = (str: string, index: number): string[] => {
  const firstPart = str.substring(0, index);
  const secondPart = str.substring(index);
  return [firstPart, secondPart];
};

export const removeHtmlTag = (input: string): string => input.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');

export function normalizeSpaces(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function interpolateMessage(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key];
    return value != null && value !== '' ? String(value) : match;
  });
}

export const convertVietnameseToEnglish = (text: string): string => {
  if (!text) return '';

  return (
    text
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      // Additional common Vietnamese characters (case-insensitive)
      .replace(/[àáạảãâầấậẩẫăằắặẳẵÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/gi, 'a')
      .replace(/[èéẹẻẽêềếệểễÈÉẸẺẼÊỀẾỆỂỄ]/gi, 'e')
      .replace(/[ìíịỉĩÌÍỊỈĨ]/gi, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/gi, 'o')
      .replace(/[ùúụủũưừứựửữÙÚỤỦŨƯỪỨỰỬỮ]/gi, 'u')
      .replace(/[ỳýỵỷỹỲÝỴỶỸ]/gi, 'y')
  );
};
