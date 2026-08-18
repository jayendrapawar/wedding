'use client'

import dynamic from 'next/dynamic'

const AdminUI = dynamic(() => import('./AdminUI'), { ssr: false, loading: () => null })

export default function AdminPage() {
  return <AdminUI />
}
