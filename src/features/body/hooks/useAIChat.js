import { useState, useCallback } from 'react'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

export function useAIChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const send = useCallback(async (userText, systemPrompt) => {
    setError(null)
    const next = [...messages, { role: 'user', content: userText }]
    setMessages(next)
    setLoading(true)

    try {
      const contents = next.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 600, temperature: 0.75 },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (e) {
      setError(`AI error: ${e?.message || String(e)}`)
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach AI right now.' }])
    } finally {
      setLoading(false)
    }
  }, [messages])

  const reset = useCallback(() => { setMessages([]); setError(null) }, [])

  return { messages, loading, error, send, reset }
}
