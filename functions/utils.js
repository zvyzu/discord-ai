/**
 * 
 * @param { string } url Mengkonversi gambar ke base64
 * @returns { Promise<string> } string base64 image
 */
export async function imageUrlToBase64(url) {
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
 * 
 * @param { string } text Memisahkan teks menjadi chunks array
 * @returns { array<string> } Array chunks teks
 */
export function splitTextIntoChunks(text) {
  const maxLength = 2000;
  const chunks = [];
  let currentChunk = '';

  // Split berdasarkan paragraf untuk menjaga konteks
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    // Jika paragraf tunggal lebih panjang dari maxLength
    if (paragraph.length > maxLength) {
      // Split berdasarkan kalimat
      const sentences = paragraph.split('. ');
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence + '. ';
        } else {
          currentChunk += sentence + '. ';
        }
      }
    }
    // Jika menambahkan paragraf baru melebihi maxLength
    else if ((currentChunk + paragraph + '\n').length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph + '\n';
    } else {
      currentChunk += paragraph + '\n';
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}