'use client'
import { useConversation } from '@11labs/react'
import { useState } from 'react'

export default function AlexAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!

  const conversation = useConversation({
    onConnect: () => console.log('Alex connected'),
    onDisconnect: () => console.log('Alex disconnected'),
    onError: (message: string) => console.error('Alex error:', message),
  })

  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' })
    } catch (e) {
      console.error('Mic permission denied or error:', e)
    }
  }

  const endCall = async () => {
    await conversation.endSession()
  }

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1B4332] rounded-full shadow-xl flex items-center justify-center hover:bg-[#10B981] transition-all duration-200 hover:scale-110"
        aria-label="Alex Assistant FulFlo"
      >
        <span className="text-2xl">🎙️</span>
        {conversation.status === 'connected' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1B4332] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#10B981] rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Alex</p>
                <p className="text-[#A7F3D0] text-xs">Assistant FulFlo · Voix Anthony</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col items-center gap-4 min-h-36">
            {conversation.status === 'disconnected' && (
              <>
                <p className="text-gray-500 text-sm text-center leading-relaxed">
                  Bonjour ! Je suis Alex.<br/>
                  <span className="text-xs text-gray-400">Je peux vous aider à trouver les meilleures offres surplus.</span>
                </p>
                <button
                  onClick={startCall}
                  className="bg-[#1B4332] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#10B981] transition-colors flex items-center gap-2"
                >
                  🎙️ Parler à Alex
                </button>
              </>
            )}

            {conversation.status === 'connecting' && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Connexion en cours...</p>
              </div>
            )}

            {conversation.status === 'connected' && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${conversation.isSpeaking ? 'bg-[#10B981] animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {conversation.isSpeaking ? 'Alex parle...' : '🎤 À votre écoute'}
                  </span>
                </div>
                {/* Audio visualizer */}
                <div className="flex gap-1 h-8 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-[#10B981] rounded-full transition-all duration-100 ${conversation.isSpeaking ? 'animate-pulse' : ''}`}
                      style={{ height: conversation.isSpeaking ? `${(i % 3 + 1) * 8}px` : '4px' }}
                    />
                  ))}
                </div>
                <button
                  onClick={endCall}
                  className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors w-full"
                >
                  ✕ Terminer la conversation
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">
              Propulsé par ElevenLabs · FulFlo Pass Premium inclus
            </p>
          </div>
        </div>
      )}
    </>
  )
}
