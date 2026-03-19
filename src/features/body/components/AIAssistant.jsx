import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, RotateCcw, Bot, User } from 'lucide-react'
import { useAIChat } from '../hooks/useAIChat'

const SUGGESTIONS = [
  'What should I eat today to hit my goal?',
  'Which menu items are best for losing weight?',
  'Build me a high-protein day from the menu.',
  'Am I eating too many calories today?',
  'What are good pre-workout options from the menu?',
  'Explain my macros in simple terms.',
]

function buildSystemPrompt(profile, calc, catalog) {
  const goalLabel = { lose: 'lose weight (−500 kcal/day deficit)', maintain: 'maintain weight', gain: 'gain muscle (+300 kcal/day surplus)' }

  const menuList = catalog.length
    ? catalog.map(i => `  - ${i.name} | ${i.calories} kcal | ${i.price.toFixed(2)} RON${i.category ? ` | ${i.category}` : ''}${i.description ? ` | ${i.description}` : ''}`).join('\n')
    : '  (no items yet)'

  return `You are a friendly nutrition and fitness assistant embedded in a company food-ordering app.

USER PROFILE:
  Weight: ${profile.weight_kg ?? '?'} kg | Height: ${profile.height_cm ?? '?'} cm | Age: ${profile.age ?? '?'} | Gender: ${profile.gender ?? '?'}
  Activity: ${profile.activity_level ?? 'sedentary'} | Goal: ${goalLabel[profile.goal] ?? 'maintain'}
${calc ? `
CALCULATED TARGETS (Mifflin-St Jeor):
  BMR: ${calc.bmr} kcal | TDEE: ${calc.tdee} kcal | Daily target: ${calc.dailyTarget} kcal
  Protein: ${calc.protein_g}g | Carbs: ${calc.carbs_g}g | Fat: ${calc.fat_g}g
` : '  (targets not yet calculated — profile incomplete)\n'}
AVAILABLE MENU ITEMS:
${menuList}

INSTRUCTIONS:
- Give practical, specific advice using ONLY the menu items above when suggesting food.
- If asked to build a meal plan, pick actual items from the list and show calories + price.
- Keep responses concise (3–6 sentences max unless building a full plan).
- Be friendly and occasionally funny, but always accurate.
- Do not invent food items not in the menu.
- Currency is RON. Calories are kcal.`
}

export default function AIAssistant({ profile, calc, catalog }) {
  const { messages, loading, error, send, reset } = useAIChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const systemPrompt = buildSystemPrompt(profile, calc, catalog)

  async function handleSend(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    await send(msg, systemPrompt)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="bg-food-card border border-food-border rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: 420 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-food-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-food-accent-d flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-food-accent" />
          </div>
          <div>
            <p className="text-food-text font-bold text-sm">AI Nutrition Assistant</p>
            <p className="text-food-text-m text-[11px]">Gemini · knows your profile & menu</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-food-text-m hover:text-food-text text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[240px] max-h-[400px]">

        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-food-text-m text-xs text-center pt-2">
              Ask me anything about your nutrition goals or what to order today.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs text-food-text-s border border-food-border hover:border-food-accent/50 hover:text-food-text bg-food-elevated hover:bg-food-accent-d rounded-xl px-3 py-2.5 transition-all leading-snug"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              m.role === 'user' ? 'bg-food-accent' : 'bg-food-elevated border border-food-border'
            }`}>
              {m.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-food-accent" />
              }
            </div>
            {/* Bubble */}
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-food-accent text-white rounded-tr-sm'
                : 'bg-food-elevated text-food-text border border-food-border rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-food-elevated border border-food-border flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-food-accent" />
            </div>
            <div className="bg-food-elevated border border-food-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="px-4 py-2 text-food-crimson text-xs bg-food-crimson-d border-t border-food-crimson/20">
          {error}
        </p>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-food-border shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your goals, today's menu, macros…"
            rows={1}
            disabled={loading}
            className="flex-1 bg-food-elevated border border-food-border rounded-xl px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors resize-none disabled:opacity-50 leading-relaxed"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-food-accent hover:bg-food-accent-h text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-food-text-m text-[10px] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
