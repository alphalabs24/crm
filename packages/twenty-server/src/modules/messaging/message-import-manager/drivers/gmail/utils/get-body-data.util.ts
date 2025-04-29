import { gmail_v1 as gmailV1 } from 'googleapis';

export const getBodyData = (message: gmailV1.Schema$Message) => {
  let result: string | undefined;

  // Helper function to extract and decode content from parts
  const findContentInParts = (parts?: gmailV1.Schema$MessagePart[]) => {
    if (!parts) return;

    for (const part of parts) {
      // First try to find plain text content
      if (part.mimeType === 'text/plain' && part.body?.data) {
        // Use base64url decoding for Gmail data
        result = Buffer.from(part.body.data, 'base64url').toString('utf-8');

        return; // Exit once we find plain text
      }

      // Recursively check nested parts
      if (part.parts) {
        findContentInParts(part.parts);
        if (result) return; // Exit if we found content in nested parts
      }
    }

    // If no plain text was found, look for HTML content
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        // Use base64url decoding for Gmail data
        result = Buffer.from(part.body.data, 'base64url').toString('utf-8');

        return;
      }
    }
  };

  // First check if content is directly in the payload
  if (message.payload?.body?.data) {
    result = Buffer.from(message.payload.body.data, 'base64url').toString(
      'utf-8',
    );
  } else {
    // Otherwise search in parts
    findContentInParts(message.payload?.parts);
  }

  return result || '';
};
