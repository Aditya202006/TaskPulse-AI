import axios from 'axios';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extract text from a buffer (PDF, Image, TXT)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File mimetype
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (buffer, mimeType, originalName) => {
  try {
    // 1. If TXT file, read directly
    if (mimeType === 'text/plain' || originalName.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    // 2. If PDF, try pdf-parse offline first
    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(buffer);
        const text = pdfData.text ? pdfData.text.trim() : '';
        // If we got significant text, return it
        if (text && text.length > 30) {
          console.log(`[OCR] Offline PDF text extraction successful (${text.length} chars)`);
          return text;
        }
      } catch (pdfError) {
        console.warn(`[OCR] Offline PDF parsing failed, falling back to OCR.Space:`, pdfError.message);
      }
    }

    // 3. Fallback/Default: OCR.Space API for images and scanned PDFs
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      throw new Error('OCR_SPACE_API_KEY is not configured in environment variables.');
    }

    console.log(`[OCR] Sending image/document to OCR.Space API...`);
    const base64Str = buffer.toString('base64');
    const base64Image = `data:${mimeType};base64,${base64Str}`;

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('base64Image', base64Image);
    params.append('language', 'eng');
    params.append('isOverlayRequired', 'false');
    // If it's a PDF being processed by OCR.space
    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
      params.append('filetype', 'PDF');
    }

    const response = await axios.post('https://api.ocr.space/parse/image', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
      const extractedText = response.data.ParsedResults.map(r => r.ParsedText).join('\n');
      console.log(`[OCR] OCR.Space extraction successful (${extractedText.length} chars)`);
      return extractedText.trim();
    } else {
      console.error('[OCR] OCR.Space response:', response.data);
      const errorMessage = response.data?.ErrorMessage?.join(', ') || 'No text detected in the document.';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('[OCR] Text extraction error:', error.message);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};
