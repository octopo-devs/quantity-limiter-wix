import React from 'react';

export function replacePlaceholder(
  text: string,
  placeholder: string,
  replacement: React.ReactElement,
): React.ReactElement[] {
  if (!text || text.search(placeholder) === -1) {
    return [React.createElement(React.Fragment, { key: 'text' }, text)];
  }
  const parts = text.split(placeholder);
  return parts.map((part, index) =>
    React.createElement(React.Fragment, { key: index }, part, index < parts.length - 1 && replacement),
  );
}
