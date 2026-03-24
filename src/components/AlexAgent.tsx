'use client'
import { useConversation } from '@11labs/react'
import { useState } from 'react'

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!

export default function AlexAgent() {
  const [isOpen, setIsOpen] = useState(false)

  const conversation = useConversation({
    onConnect: () => console.log('Alex connected'),
    onDisconnect: () => console.log('Alex disconnected'),
    onError: (error) => console.error('Alex error:', error),
  })

  const startCall = async () => {
    await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' })
  }

  const endCall = async () => {
    await conversation.endSession()
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1B4332] rounded-full shadow-lg flex items-center justify-center hover:bg-[#10B981] transition-colors"
        aria-label="Alex — Assistant FulFlo"
      >
        <span className="text-white text-2xl">🎙️</span>
        {conversation.status === 'connected' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1B4332] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
              <div>
                <p className="text-white font-semibold text-sm">Alex</p>
                <p className="text-[#A7F3D0] text-xs">Assistant FulFlo</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-lg">×</button>
          </div>

          {/* Body */}
          <div className="p-4 min-h-32 flex flex-col items-center justify-center gap-3">
            {conversation.status === 'disconnected' && (
              <>
                <p className="text-gray-500 text-sm text-center">
                  Bonjour ! Je suis Alex, votre assistant FulFlo.<br/>
                  <span className="text-xs text-gray-400">Cliquez sur le micro pour parler.</span>
                </p>
                <button
                  onClick={startCall}
                  className="bg-[#1B4332] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#10B981] transition-colors flex items-center gap-2"
                >
                  🎙️ Parler à Alex
                </button>
              </>
            )}

            {conversation.status === 'connecting' && (
              <p className="text-gray-400 text-sm animate-pulse">Connexion en cours...</p>
            )}

            {conversation.status === 'connected' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">
                    {conversation.isSpeaking ? 'Alex parle...' : 'En écoute...'}
                  </span>
                </div>
                <button
                  onClick={endCall}
                  className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Terminer
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">
              Voix CITERE · Propulsé par ElevenLabs · FulFlo Pass Premium
            </p>
          </div>
        </div>
      )}
    </>
  )
}
