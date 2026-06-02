// Chatbot service for MedBot backend integration
// Backend: https://hpiatrht-medbot-backend.hf.space
// POST /get  →  { msg: string }  →  plain text response

const MEDBOT_BASE_URL = 'https://hpiatrht-medbot-backend.hf.space';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

/**
 * Sends a message to the MedBot backend and returns the assistant's response.
 * @param message - The user's message text
 * @returns The assistant's plain-text response
 * @throws Error if the network request fails or the server returns an error
 */
export const sendChatMessage = async (message: string): Promise<string> => {
  if (!message.trim()) {
    throw new Error('Message cannot be empty.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30 s timeout

  try {
    const response = await fetch(`${MEDBOT_BASE_URL}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ msg: message.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    const text = await response.text();

    if (!text || text.trim() === '') {
      throw new Error('The assistant returned an empty response. Please try again.');
    }

    return text.trim();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The MedBot server may be slow — please try again.');
    }
    throw err;
  }
};

/**
 * Creates a new chat message object.
 */
export const createMessage = (
  role: 'user' | 'assistant',
  content: string,
  isError = false
): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  content,
  timestamp: new Date(),
  isError,
});
