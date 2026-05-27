const API_BASE = 'http://127.0.0.1:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error || data.message || 'Erro desconhecido',
        code: data.code,
      };
    }
    
    return data;
  } catch (error) {
    // Don't force a full redirect on 401 here; let callers handle auth flows.
    if (error && error.status === 401 && token && !isAuthEndpoint) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Dispatch a global event so the SPA can redirect or show login UI gracefully
      try {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      } catch (e) {
        // ignore in non-browser environments
      }
    }
    throw error;
  }
};
