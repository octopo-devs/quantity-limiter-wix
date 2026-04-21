import '@testing-library/jest-dom';

// jsdom (as shipped with Jest 29) does not define TextEncoder/TextDecoder on
// the global scope, but react-dom/server.browser (pulled in transitively by
// @wix/design-system's RichTextInputArea -> draft-convert) requires them at
// module load. Polyfill from Node's built-in util.
import { TextDecoder, TextEncoder } from 'util';

if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}
