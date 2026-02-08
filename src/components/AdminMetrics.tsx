import { useEffect, useState } from 'react'
import { getMetricsLast7Days } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendUp, Users, CurrencyEuro, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MetricsData {
  publishedCount: number
  avgFillRate: number
  gmvCents: number
  conversion: number
}

function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function AdminMetrics() {
  const [kpi, setKpi] = useState<MetricsData | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getMetricsLast7Days()
        setKpi(data)
      } catch (e: any) {
        setError(e.message ?? String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">KPI ultimi 7 giorni</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">KPI ultimi 7 giorni</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!kpi) return null

  const kpiCards = [
    {
      title: 'Matches Published',
      value: kpi.publishedCount.toString(),
      description: 'Partite pubblicate',
      icon: TrendUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Fill Rate Medio',
      value: formatPercent(kpi.avgFillRate),
      description: 'Tasso di riempimento',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'GMV',
      value: formatEuro(kpi.gmvCents),
      description: 'Gross Merchandise Value',
      icon: CurrencyEuro,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Conversion Rate',
      value: formatPercent(kpi.conversion),
      description: 'Paid intent → Confirmed',
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">KPI ultimi 7 giorni</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    {card.title}
                  </CardDescription>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`${card.color}`} size={20} weight="bold" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Alert className="bg-muted/50 border-muted">
          <AlertDescription className="text-sm text-muted-foreground">
            <strong>Nota:</strong> GMV e conversion diventeranno "reali" quando attiviamo Stripe + webhook (Punti 5–7).
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  )
}
