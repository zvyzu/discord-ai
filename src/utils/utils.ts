import i18next from './i18n';

/**
 * @param { string } url convert image to base64
 * @returns { Promise<string> } string base64 image
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
}

/**
 * @param { string } text split text into chunks array
 * @returns { array<string> } Array chunks of text
 */
export function splitTextIntoChunks(text: string): string[] {
  const maxLength = 2000;
  const chunks = [];
  let currentChunk = '';

  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLength) {
      const sentences = paragraph.split('. ');
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = `${sentence}. `;
        } else {
          currentChunk += `${sentence}. `;
        }
      }
    } else if ((`${currentChunk}${paragraph}\n`).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = `${paragraph}\n`;
    } else {
      currentChunk += `${paragraph}\n`;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

export function days(): string | undefined {
  const date = new Date();
  const { t } = i18next;
  i18next.changeLanguage('en');

  switch (date.getDay()) {
    case 0:
      return t('days.sunday');
    case 1:
      return t('days.monday');
    case 2:
      return t('days.tuesday');
    case 3:
      return t('days.wednesday');
    case 4:
      return t('days.thursday');
    case 5:
      return t('days.friday');
    case 6:
      return t('days.saturday');
  }
}