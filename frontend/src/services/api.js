/**
 * API service client for Kiwi Chatbot backend.
 */

const API_BASE = '/api';

export async function sendChatMessage(message, conversationId, history = []) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        history: history.map(item => ({
          role: item.role,
          content: item.content
        }))
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error('API sendChatMessage error:', error);
    throw error;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'offline' };
    return await res.json();
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}

export async function testWebSearch(query) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return await res.json();
}

export async function testUrlReader(url) {
  const res = await fetch(`${API_BASE}/fetch-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return await res.json();
}
