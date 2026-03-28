import { validateUrl, validateEmail } from './index';

describe('validateUrl', () => {
  test('returns true for valid URLs', () => {
    expect(validateUrl('https://www.example.com')).toBe(true);
    expect(validateUrl('http://subdomain.example.co.uk')).toBe(true);
    expect(validateUrl('https://example.com/path/to/page?param=value')).toBe(true);
    expect(validateUrl('ftp://ftp.example.org')).toBe(true);
  });

  test('returns false for invalid URLs', () => {
    expect(validateUrl('not a url')).toBe(false);
    expect(validateUrl('http://')).toBe(false);
    expect(validateUrl('www.')).toBe(false);
    expect(validateUrl('example')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(validateUrl('')).toBe(false);
    expect(validateUrl('   ')).toBe(false);
    expect(validateUrl(undefined as unknown as string)).toBe(false);
    expect(validateUrl(null as unknown as string)).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(validateUrl('HTTP://WWW.EXAMPLE.COM')).toBe(true);
    expect(validateUrl('Https://Example.Com')).toBe(true);
  });
});

describe('validateEmail', () => {
  test('returns true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name@example.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
    expect(validateEmail('user-name@example.io')).toBe(true);
  });

  test('returns false for invalid email addresses', () => {
    expect(validateEmail('not an email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('user@example')).toBe(false);
  });

  test('handles edge cases', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('   ')).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(validateEmail('USER@EXAMPLE.COM')).toBe(true);
    expect(validateEmail('User@Example.Com')).toBe(true);
  });
});
