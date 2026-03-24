'use client'
import dynamic from 'next/dynamic'
const AlexAgent = dynamic(() => import('./AlexAgent'), { ssr: false })
export default function ClientAlexAgent() {
  return <AlexAgent />
}
