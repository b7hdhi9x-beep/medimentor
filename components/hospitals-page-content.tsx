'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Language, getTranslation } from '@/lib/i18n'
import { ArrowLeft, Building2, MapPin, ExternalLink, Award, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Hospital {
  rank: number
  name: string
  nameLocal: string
  region: string
  city: string
  globalRank?: number
  url?: string
  highlights: string[]
}

interface CountryHospitals {
  country: string
  countryLocal: string
  flag: string
  source: string
  hospitals: Hospital[]
}

// 🇯🇵 Japan - Newsweek 2025
const HOSPITALS_JA: CountryHospitals = {
  country: 'Japan', countryLocal: '日本', flag: '🇯🇵',
  source: 'Newsweek World\'s Best Hospitals 2025',
  hospitals: [
    { rank: 1, name: '東京大学医学部附属病院', nameLocal: 'The University of Tokyo Hospital', region: '東京', city: '文京区', globalRank: 16, url: 'https://www.h.u-tokyo.ac.jp/', highlights: ['5年連続日本1位', '世界16位'] },
    { rank: 2, name: '聖路加国際病院', nameLocal: 'St. Luke\'s International Hospital', region: '東京', city: '中央区', globalRank: 36, url: 'https://hospital.luke.ac.jp/', highlights: ['JCI認定', '英語対応可'] },
    { rank: 3, name: '亀田総合病院', nameLocal: 'Kameda Medical Center', region: '千葉', city: '鴨川市', globalRank: 58, url: 'https://www.kameda.com/', highlights: ['JCI認定', '先進的医療技術'] },
    { rank: 4, name: '九州大学病院', nameLocal: 'Kyushu University Hospital', region: '福岡', city: '福岡市', url: 'https://www.hosp.kyushu-u.ac.jp/', highlights: ['九州地方最高峰', '先端医療研究'] },
    { rank: 5, name: '名古屋大学医学部附属病院', nameLocal: 'Nagoya University Hospital', region: '愛知', city: '名古屋市', url: 'https://www.med.nagoya-u.ac.jp/hospital/', highlights: ['中部地方の中核', '高度先進医療'] },
    { rank: 6, name: '慶應義塾大学病院', nameLocal: 'Keio University Hospital', region: '東京', city: '新宿区', url: 'https://www.hosp.keio.ac.jp/', highlights: ['総合大学病院', '先進的研究'] },
    { rank: 7, name: '国立国際医療研究センター病院', nameLocal: 'National Center for Global Health and Medicine', region: '東京', city: '新宿区', url: 'https://www.ncgm.go.jp/', highlights: ['JMIP認定', '多言語対応'] },
    { rank: 8, name: '京都大学医学部附属病院', nameLocal: 'Kyoto University Hospital', region: '京都', city: '京都市', url: 'https://www.kuhp.kyoto-u.ac.jp/', highlights: ['iPS細胞研究の拠点', '世界的研究機関'] },
    { rank: 9, name: '虎の門病院', nameLocal: 'Toranomon Hospital', region: '東京', city: '港区', url: 'https://toranomon.kkr.or.jp/', highlights: ['消化器・がん治療に強み', '高度な専門医療'] },
    { rank: 10, name: '大阪大学医学部附属病院', nameLocal: 'Osaka University Hospital', region: '大阪', city: '吹田市', url: 'https://www.hosp.med.osaka-u.ac.jp/', highlights: ['JMIP認定', '関西トップクラス'] },
  ],
}

// 🇺🇸 USA - Newsweek 2025
const HOSPITALS_EN: CountryHospitals = {
  country: 'United States', countryLocal: 'United States', flag: '🇺🇸',
  source: 'Newsweek World\'s Best Hospitals 2025',
  hospitals: [
    { rank: 1, name: 'Mayo Clinic - Rochester', nameLocal: 'Mayo Clinic - Rochester', region: 'Minnesota', city: 'Rochester', globalRank: 1, url: 'https://www.mayoclinic.org/', highlights: ['#1 in the World', 'Top in 12+ specialties'] },
    { rank: 2, name: 'Cleveland Clinic', nameLocal: 'Cleveland Clinic', region: 'Ohio', city: 'Cleveland', globalRank: 2, url: 'https://my.clevelandclinic.org/', highlights: ['#2 globally', 'Cardiology leader'] },
    { rank: 3, name: 'The Johns Hopkins Hospital', nameLocal: 'The Johns Hopkins Hospital', region: 'Maryland', city: 'Baltimore', globalRank: 3, url: 'https://www.hopkinsmedicine.org/', highlights: ['#3 globally', 'Pioneering research'] },
    { rank: 4, name: 'Massachusetts General Hospital', nameLocal: 'Massachusetts General Hospital', region: 'Massachusetts', city: 'Boston', globalRank: 4, url: 'https://www.massgeneral.org/', highlights: ['Harvard-affiliated', 'Largest research hospital'] },
    { rank: 5, name: 'Ronald Reagan UCLA Medical Center', nameLocal: 'Ronald Reagan UCLA Medical Center', region: 'California', city: 'Los Angeles', url: 'https://www.uclahealth.org/', highlights: ['Top in West Coast', 'Leading transplant center'] },
    { rank: 6, name: 'Stanford Health Care', nameLocal: 'Stanford Health Care - Stanford Hospital', region: 'California', city: 'Stanford', url: 'https://stanfordhealthcare.org/', highlights: ['Innovation hub', 'Stanford Medicine'] },
    { rank: 7, name: 'The Mount Sinai Hospital', nameLocal: 'The Mount Sinai Hospital', region: 'New York', city: 'New York', url: 'https://www.mountsinai.org/', highlights: ['NYC flagship', 'Top research programs'] },
    { rank: 8, name: 'Brigham and Women\'s Hospital', nameLocal: 'Brigham and Women\'s Hospital', region: 'Massachusetts', city: 'Boston', url: 'https://www.brighamandwomens.org/', highlights: ['Harvard-affiliated', 'Women\'s health leader'] },
    { rank: 9, name: 'Cedars-Sinai Medical Center', nameLocal: 'Cedars-Sinai Medical Center', region: 'California', city: 'Los Angeles', url: 'https://www.cedars-sinai.org/', highlights: ['Top in LA', 'Heart care excellence'] },
    { rank: 10, name: 'Northwestern Memorial Hospital', nameLocal: 'Northwestern Memorial Hospital', region: 'Illinois', city: 'Chicago', url: 'https://www.nm.org/', highlights: ['Midwest leader', 'Academic excellence'] },
  ],
}

// 🇪🇸 Spain - Newsweek 2025
const HOSPITALS_ES: CountryHospitals = {
  country: 'España', countryLocal: 'España', flag: '🇪🇸',
  source: 'Newsweek World\'s Best Hospitals 2025',
  hospitals: [
    { rank: 1, name: 'Hospital Universitario La Paz', nameLocal: 'Hospital Universitario La Paz', region: 'Madrid', city: 'Madrid', url: 'https://www.comunidad.madrid/hospital/lapaz/', highlights: ['Nº1 en España', 'Hospital de referencia nacional'] },
    { rank: 2, name: 'Hospital Universitario 12 de Octubre', nameLocal: 'Hospital Universitario 12 de Octubre', region: 'Madrid', city: 'Madrid', url: 'https://www.comunidad.madrid/hospital/12octubre/', highlights: ['Top 2 en España', 'Investigación avanzada'] },
    { rank: 3, name: 'Hospital Clínic de Barcelona', nameLocal: 'Clínic Barcelona', region: 'Cataluña', city: 'Barcelona', url: 'https://www.clinicbarcelona.org/', highlights: ['Referencia internacional', 'Oncología y trasplantes'] },
    { rank: 4, name: 'Hospital Universitari Vall d\'Hebron', nameLocal: 'Hospital Universitari Vall d\'Hebron', region: 'Cataluña', city: 'Barcelona', url: 'https://www.vallhebron.com/', highlights: ['Mayor hospital de Cataluña', 'Investigación pediátrica'] },
    { rank: 5, name: 'Hospital Gregorio Marañón', nameLocal: 'Hospital General Universitario Gregorio Marañón', region: 'Madrid', city: 'Madrid', url: 'https://www.comunidad.madrid/hospital/gregoriomaranon/', highlights: ['Excelencia en cardiología', 'Hospital universitario'] },
    { rank: 6, name: 'Clínica Universidad de Navarra', nameLocal: 'Clínica Universidad de Navarra', region: 'Navarra', city: 'Pamplona', url: 'https://www.cun.es/', highlights: ['Mejor hospital privado', 'Medicina personalizada'] },
    { rank: 7, name: 'Hospital Virgen del Rocío', nameLocal: 'Hospital Universitario Virgen del Rocío', region: 'Andalucía', city: 'Sevilla', url: 'https://www.hospitalvirgendelrocio.es/', highlights: ['Referencia en Andalucía', 'Trasplantes'] },
    { rank: 8, name: 'Hospital Ramón y Cajal', nameLocal: 'Hospital Universitario Ramón y Cajal', region: 'Madrid', city: 'Madrid', url: 'https://www.comunidad.madrid/hospital/ramonycajal/', highlights: ['Neurociencias', 'Investigación biomédica'] },
    { rank: 9, name: 'Hospital La Fe de Valencia', nameLocal: 'Hospital Universitari i Politècnic La Fe', region: 'Valencia', city: 'Valencia', url: 'https://www.hospital-lafe.com/', highlights: ['Mayor de la C. Valenciana', 'Pediatría de referencia'] },
    { rank: 10, name: 'Hospital Clínico San Carlos', nameLocal: 'Hospital Clínico San Carlos', region: 'Madrid', city: 'Madrid', url: 'https://www.comunidad.madrid/hospital/clinicosancarlos/', highlights: ['Tradición y excelencia', 'Investigación clínica'] },
  ],
}

// 🇨🇳 China - Fudan University Hospital Ranking 2023 (published 2024)
const HOSPITALS_ZH: CountryHospitals = {
  country: '中国', countryLocal: 'China', flag: '🇨🇳',
  source: '复旦大学医院排行榜 2023（2024年发布）',
  hospitals: [
    { rank: 1, name: '北京协和医院', nameLocal: 'Peking Union Medical College Hospital', region: '北京', city: '北京市', url: 'https://www.pumch.cn/', highlights: ['全国最高评级A++++', '综合实力第一'] },
    { rank: 2, name: '四川大学华西医院', nameLocal: 'West China Hospital, Sichuan University', region: '四川', city: '成都市', url: 'https://www.wchscu.cn/', highlights: ['A++++级', '西部医学中心'] },
    { rank: 3, name: '中国人民解放军总医院', nameLocal: 'PLA General Hospital (301 Hospital)', region: '北京', city: '北京市', url: 'https://www.301hospital.com.cn/', highlights: ['A++++级', '军事医学最高学府'] },
    { rank: 4, name: '复旦大学附属中山医院', nameLocal: 'Zhongshan Hospital, Fudan University', region: '上海', city: '上海市', url: 'https://www.zs-hospital.sh.cn/', highlights: ['A++++级', '心脏外科领先'] },
    { rank: 5, name: '上海交通大学附属瑞金医院', nameLocal: 'Ruijin Hospital, Shanghai Jiao Tong University', region: '上海', city: '上海市', url: 'https://www.rjh.com.cn/', highlights: ['A++++级', '内分泌科全国第一'] },
    { rank: 6, name: '复旦大学附属华山医院', nameLocal: 'Huashan Hospital, Fudan University', region: '上海', city: '上海市', url: 'https://www.huashan.org.cn/', highlights: ['A++++级', '神经外科/感染科领先'] },
    { rank: 7, name: '华中科技大学附属同济医院', nameLocal: 'Tongji Hospital, Huazhong University', region: '湖北', city: '武汉市', url: 'https://www.tjh.com.cn/', highlights: ['A++++级', '中部地区龙头'] },
    { rank: 8, name: '北京大学第一医院', nameLocal: 'Peking University First Hospital', region: '北京', city: '北京市', url: 'https://www.pkufh.com/', highlights: ['A++++级', '肾脏内科顶尖'] },
    { rank: 9, name: '浙江大学附属第一医院', nameLocal: 'The First Affiliated Hospital, Zhejiang University', region: '浙江', city: '杭州市', url: 'https://www.zy91.com/', highlights: ['A++++级', '肝胆外科领先'] },
    { rank: 10, name: '中山大学附属第一医院', nameLocal: 'The First Affiliated Hospital, Sun Yat-sen University', region: '广东', city: '广州市', url: 'https://www.fahsysu.org.cn/', highlights: ['A++++级', '华南地区第一'] },
  ],
}

// 🇰🇷 South Korea - Newsweek 2025
const HOSPITALS_KO: CountryHospitals = {
  country: '대한민국', countryLocal: 'South Korea', flag: '🇰🇷',
  source: 'Newsweek World\'s Best Hospitals 2025',
  hospitals: [
    { rank: 1, name: '서울아산병원', nameLocal: 'Asan Medical Center', region: '서울', city: '서울특별시', globalRank: 25, url: 'https://www.amc.seoul.kr/', highlights: ['한국 1위', '세계 25위'] },
    { rank: 2, name: '삼성서울병원', nameLocal: 'Samsung Medical Center', region: '서울', city: '서울특별시', globalRank: 30, url: 'https://www.samsunghospital.com/', highlights: ['세계 30위', '암 치료 선도'] },
    { rank: 3, name: '서울대학교병원', nameLocal: 'Seoul National University Hospital', region: '서울', city: '서울특별시', url: 'https://www.snuh.org/', highlights: ['국립 대표 병원', '최고 수준 연구'] },
    { rank: 4, name: '세브란스병원', nameLocal: 'Severance Hospital - Yonsei University', region: '서울', city: '서울특별시', url: 'https://sev.severance.healthcare/', highlights: ['연세의료원', '국제 인증'] },
    { rank: 5, name: '분당서울대학교병원', nameLocal: 'Seoul National University Bundang Hospital', region: '경기', city: '성남시', url: 'https://www.snubh.org/', highlights: ['경기 지역 최고', 'IT 의료 선도'] },
    { rank: 6, name: '강남세브란스병원', nameLocal: 'Gangnam Severance Hospital', region: '서울', city: '서울특별시', url: 'https://gs.severance.healthcare/', highlights: ['강남 대표 병원', '로봇수술 선도'] },
    { rank: 7, name: '아주대학교병원', nameLocal: 'Ajou University Hospital', region: '경기', city: '수원시', url: 'https://www.ajoumc.or.kr/', highlights: ['경기 남부 거점', '응급의료센터'] },
    { rank: 8, name: '가톨릭대학교 서울성모병원', nameLocal: 'Seoul St. Mary\'s Hospital', region: '서울', city: '서울특별시', url: 'https://www.cmcseoul.or.kr/', highlights: ['조혈모세포이식 1위', '가톨릭의료원'] },
    { rank: 9, name: '인하대학교병원', nameLocal: 'Inha University Hospital', region: '인천', city: '인천광역시', url: 'https://www.inha.com/', highlights: ['인천 대표 병원', '지역 거점 의료'] },
    { rank: 10, name: '경희대학교병원', nameLocal: 'Kyung Hee University Hospital', region: '서울', city: '서울특별시', url: 'https://www.khmc.or.kr/', highlights: ['한방·양방 융합', '통합의학 선도'] },
  ],
}

const COUNTRY_DATA: Record<Language, CountryHospitals> = {
  ja: HOSPITALS_JA,
  en: HOSPITALS_EN,
  es: HOSPITALS_ES,
  zh: HOSPITALS_ZH,
  ko: HOSPITALS_KO,
}

export function HospitalsPageContent() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('ja')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  useEffect(() => {
    try {
      const saved = localStorage?.getItem?.('medimentor-lang')
      if (saved === 'en' || saved === 'ja' || saved === 'es' || saved === 'zh' || saved === 'ko') {
        setLanguage(saved)
      }
    } catch {}
  }, [])

  // Reset region filter when language changes
  useEffect(() => {
    setRegionFilter('all')
  }, [language])

  // Listen for language changes from other tabs/components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e?.key === 'medimentor-lang' && e?.newValue) {
        const v = e.newValue
        if (v === 'en' || v === 'ja' || v === 'es' || v === 'zh' || v === 'ko') {
          setLanguage(v)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const t = getTranslation(language)
  const data = COUNTRY_DATA[language] ?? COUNTRY_DATA.ja
  const hospitals = data.hospitals

  const regions = ['all', ...Array.from(new Set(hospitals.map(h => h.region)))]
  const filtered = regionFilter === 'all'
    ? hospitals
    : hospitals.filter(h => h.region === regionFilter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <Building2 className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold">{(t as any)?.hospitals ?? 'Find Hospitals'}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Country + Source badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 mb-3">
            <span className="text-lg">{data.flag}</span>
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">
              {(t as any)?.hospitalRanking ?? data.source}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {(t as any)?.hospitalNote ?? ''}
          </p>
        </div>

        {/* Region filter */}
        <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                regionFilter === r
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white/80 text-muted-foreground hover:bg-muted border border-border/50'
              }`}
            >
              {r === 'all' ? ((t as any)?.allRegions ?? 'All') : r}
            </button>
          ))}
        </div>

        {/* Hospital list */}
        <div className="space-y-3">
          {filtered.map((hospital, i) => (
            <motion.div
              key={`${language}-${hospital.rank}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  hospital.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md' : 'bg-primary/10 text-primary'
                }`}>
                  {hospital.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">
                    {hospital.name}
                  </h3>
                  {hospital.nameLocal !== hospital.name && (
                    <p className="text-[10px] text-muted-foreground">{hospital.nameLocal}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      {hospital.city}, {hospital.region}
                    </span>
                    {hospital.globalRank && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                        World #{hospital.globalRank}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hospital.highlights.map((h, j) => (
                      <span key={j} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />{h}
                      </span>
                    ))}
                  </div>
                </div>
                {hospital.url && (
                  <a
                    href={hospital.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
