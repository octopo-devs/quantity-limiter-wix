import * as qs from 'qs';

export const objectToQuerystring = (obj: Record<string, any>): string => {
  return qs.stringify(obj);
};

export const generateHmacKey = async (querystring: string, secret: string): Promise<string> => {
  if (!querystring || !secret) return '';

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    const data = encoder.encode(querystring);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error generating HMAC:', error);
    return '';
  }
};
