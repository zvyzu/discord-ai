export async function imageUrlToBase64(url: string) {
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

export function splitTextIntoChunks(text: string) {
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