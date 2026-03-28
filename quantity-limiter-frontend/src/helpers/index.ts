import { IToast } from '@/types/components/toast';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { stringify, uniq, uniqByKey } from './string';

declare let $crisp: any;

dayjs.extend(utc);
dayjs.extend(timezone);
export const openCrisp = () => {
  try {
    $crisp.push(['do', 'chat:open']);
  } catch (error) {
    console.log(error);
  }
};

export const sendCrispMessage = (message: string) => {
  try {
    $crisp.push(['do', 'chat:open']);
    $crisp.push(['do', 'message:send', ['text', message]]);
  } catch (err) {
    console.log(err);
  }
};

export function validateUrl(url: string) {
  // eslint-disable-next-line no-useless-escape
  const regex = /[(www\.)?a-zA-Z0-9@:%._\+\-~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
  const result = url?.toLowerCase().match(regex);
  return !!result;
}

export function validateEmail(email: string) {
  const regex = new RegExp(/^[\w.+-]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+$/);
  const result = email.match(regex);
  return !!result;
}

export const handleToggle = (value: number): number => (value === 0 ? 1 : 0);

export const numberToBoolean = (number: number) => {
  return !!number;
};

export const booleanToNumber = (value: boolean) => {
  return value ? 1 : 0;
};

export const checkShowErrorInline = (
  res: any,
): {
  status: boolean;
  msg: string;
} => {
  try {
    if ('data' in res) {
      return {
        status: res.data.code !== 200,
        msg: res.data.status,
      };
    }
    return {
      status: true,
      msg: res.error.data.message.toString() || 'something happened',
    };
  } catch (err) {
    return {
      status: true,
      msg: 'something happened',
    };
  }
};

export const handleToastMutation = (res: any): IToast => {
  try {
    if ('data' in res) {
      if (res.data.code !== 200) {
        return {
          isOpen: true,
          content: res.data.message || 'Failed',
          error: true,
        };
      }
      return {
        isOpen: true,
        content: res.data.message || 'Saved',
        error: false,
      };
    }
    return {
      isOpen: true,
      content: res.error.data.message.join(', ') || 'something happened',
      error: false,
    };
  } catch (err) {
    return {
      isOpen: true,
      content: 'something happened',
      error: true,
    };
  }
};

export function deepObjectEqual(object1: any, object2: any) {
  return stringify(object1) === stringify(object2);
}

export function deepCompareObjectEqual(obj1: any, obj2: any) {
  // Check if both inputs are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  // Check if both are null (since typeof null is 'object')
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Recursively compare all keys and values
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepCompareObjectEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export const convertNullToString = (obj: any) => {
  if (obj === undefined) {
    return undefined;
  }
  const res = { ...obj };
  Object.entries(res).forEach(([key, value]) => {
    if (value === null) {
      res[key] = '';
    }
  });
  return res;
};

export const checkArraysEqual = (array1: any[], array2: any[]) => {
  if (array1.length !== array2.length) {
    return false;
  }

  return array1.every((item) => array2.includes(item)) && array2.every((item) => array1.includes(item));
};

export function checkIfIsLightColor(color: string) {
  // Hàm chuyển đổi mã màu HEX sang RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    return [
      (bigint >> 16) & 255, // eslint-disable-line no-bitwise
      (bigint >> 8) & 255, // eslint-disable-line no-bitwise
      bigint & 255, // eslint-disable-line no-bitwise
    ];
  };
  // Hàm tính độ sáng tương đối
  const getLuminance = (r: number, g: number, b: number) => {
    // Chuyển đổi RGB (0-255) sang các giá trị từ 0-1
    const [R, G, B] = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    // Tính độ sáng tương đối
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  // Hàm kiểm tra màu là "dark" hay "light"
  const checkColorTheme = (hex: string) => {
    const [r, g, b] = hexToRgb(hex); // Chuyển thành RGB
    const luminance = getLuminance(r, g, b); // Tính độ sáng
    return luminance > 0.5 ? true : false; // So sánh với ngưỡng 0.5
  };

  const theme = checkColorTheme(color);

  return theme;
}

export const upperFirstCase = (text: string): string => {
  if (!text) return '';
  const trimmedText = String(text).trim();
  if (!trimmedText) return '';
  return trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1).toLowerCase();
};
