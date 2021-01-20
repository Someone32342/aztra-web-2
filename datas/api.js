const api = process.env.NODE_ENV === 'production'
  ? "https://api.aztra.xyz"
  : "http://localhost:3001"

export default api