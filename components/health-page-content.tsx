'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Language, getTranslation } from '@/lib/i18n'
import { ArrowLeft, Activity, Heart, Loader2, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface HealthRecord {
  id: string
  date: string
  category: string
  symptom: string
  summary: string
}

const SPECIALTY_COLORS: Record<string, string> = {
  mental_health: 'bg-purple-100 text-purple-700',
  internal_medicine: 'bg-blue-100 text-blue-700',
  orthopedics: 'bg-teal-100 text-teal-700',
  pediatrics: 'bg-pink-100 text-pink-700',
  pharmacy: 'bg-indigo-100 text-indigo-700',
  nutrition: 'bg-orange-100 text-orange-700',
  dermatology: 'bg-rose-100 text-rose-700',
  ophthalmology: 'bg-sky-100 text-sky-700',
  ent: 'bg-amber-100 text-amber-700',
  urology: 'bg-cyan-100 text-cyan-700',
  gynecology: 'bg-fuchsia-100 text-fuchsia-700',
  cardiology: 'bg-red-100 text-red-700',
  neurology: 'bg-violet-100 text-violet-700',
  surgery: 'bg-emerald-100 text-emerald-700',
  dentistry: 'bg-slate-100 text-slate-700',
  general: 'bg-green-100 text-green-700',
}

export function HealthPageContent() {
  const { status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('ja')

  useEffect(() => {
    try {
      const saved = localStorage?.getItem?.('medimentor-lang')
      if (saved === 'en' || saved === 'ja' || saved === 'es' || saved === 'zh' || saved === 'ko') {
        setLanguage(saved)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/health-records')
        .then(r => r.json())
        .then(data => setRecords(data?.records ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const t = getTranslation(language)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      )
    } catch { return dateStr }
  }

  const getSpecialtyLabel = (cat: string) => {
    return (t?.specialty as any)?.[cat] ?? cat
  }

  // Group records by date (YYYY-MM-DD)
  const grouped = records.reduce((acc, rec) => {
    const day = rec.date?.slice(0, 10) ?? 'unknown'
    if (!acc[day]) acc[day] = []
    acc[day].push(rec)
    return acc
  }, {} as Record<string, HealthRecord[]>)

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <Activity className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold">{(t as any)?.healthHistory ?? 'Health History'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {records.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{(t as any)?.noHealthRecords ?? 'No health records yet'}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {language === 'ja' ? '\u30d4\u30d4\u3068\u76f8\u8ac7\u3059\u308b\u3068\u81ea\u52d5\u7684\u306b\u5065\u5eb7\u5c65\u6b74\u304c\u8a18\u9332\u3055\u308c\u307e\u3059' : 'Your health history is automatically recorded when you consult with Pipi'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-border/30 text-center">
                <p className="text-2xl font-bold text-primary">{records.length}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ja' ? '\u7dcf\u76f8\u8ac7\u6570' : 'Total Consultations'}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-border/30 text-center">
                <p className="text-2xl font-bold text-primary">{new Set(records.map(r => r.category)).size}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ja' ? '\u8a3a\u7642\u79d1\u6570' : 'Specialties'}</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-border/30 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-bold text-primary">{Object.keys(grouped).length}</p>
                <p className="text-[11px] text-muted-foreground">{language === 'ja' ? '\u65e5\u6570' : 'Days'}</p>
              </div>
            </motion.div>

            {/* Timeline */}
            {Object.entries(grouped).map(([day, dayRecords], gi) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {formatDate(day + 'T00:00:00')}
                  </h3>
                </div>
                <div className="space-y-2 ml-2 border-l-2 border-primary/20 pl-4">
                  {dayRecords.map((rec, i) => (
                    <div key={rec.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${SPECIALTY_COLORS[rec.category] ?? 'bg-gray-100 text-gray-700'}`}>
                          {getSpecialtyLabel(rec.category)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(rec.date)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 font-medium">
                        {language === 'ja' ? '\u76f8\u8ac7\u5185\u5bb9: ' : 'Concern: '}{rec.symptom}
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                        {rec.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
