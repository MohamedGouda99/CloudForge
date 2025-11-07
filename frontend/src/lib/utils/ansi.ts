import { AnsiUp } from 'ansi_up';

const ansiUp = new AnsiUp();
ansiUp.use_classes = false;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ansiToHtml(input: string): string {
  if (!input) {
    return '';
  }

  try {
    return ansiUp.ansi_to_html(input);
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.warn('Failed to parse ANSI sequence, falling back to plain text.', error, input);
    }
    return escapeHtml(input);
  }
}
