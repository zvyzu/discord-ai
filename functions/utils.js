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

/**
 * 
 * @returns { string } Hari saat ini
 */
export function hari() {
  const date = new Date();

  switch (date.getDay()) {
    case 0:
      return "Minggu";
    case 1:
      return "Senin";
    case 2:
      return "Selasa";
    case 3:
      return "Rabu";
    case 4:
      return "Kamis";
    case 5:
      return "Jumat";
    case 6:
      return "Sabtu";
  }
}

/**
 * 
 * @returns { string } Bulan saat ini
 */
export function bulan() {
  const date = new Date();

  switch (date.getMonth()) {
    case 0:
      return "Januari";
    case 1:
      return "Februari";
    case 2:
      return "Maret";
    case 3:
      return "April";
    case 4:
      return "Mei";
    case 5:
      return "Juni";
    case 6:
      return "Juli";
    case 7:
      return "Agustus";
    case 8:
      return "September";
    case 9:
      return "Oktober";
    case 10:
      return "November";
    case 11:
      return "Desember";
  }
}