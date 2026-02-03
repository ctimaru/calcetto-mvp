import { type Transaction } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CreditCard, 
  ArrowCircleDown, 
  ArrowCircleUp, 
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle,
  Bank,
  Gift,
  MapPin,
  Calendar
} from '@phosphor-icons/react'
import { formatCurrency, formatTransactionType, formatTransactionStatus, getTransactionStatusColor, getRelativeTime } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface TransactionHistoryProps {
  transactions: Transaction[]
  onTransactionClick?: (transaction: Transaction) => void
}

export function TransactionHistory({ transactions, onTransactionClick }: TransactionHistoryProps) {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') return <XCircle size={24} weight="fill" className="text-red-500" />
    if (status === 'pending') return <Clock size={24} weight="fill" className="text-yellow-500" />
    
    switch (type) {
      case 'payment':
        return <ArrowCircleUp size={24} weight="fill" className="text-red-500" />
      case 'refund':
        return <ArrowCircleDown size={24} weight="fill" className="text-green-500" />
      case 'bonus':
        return <Gift size={24} weight="fill" className="text-accent" />
      case 'cancellation_fee':
        return <WarningCircle size={24} weight="fill" className="text-orange-500" />
      default:
        return <Receipt size={24} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getPaymentMethodDisplay = (transaction: Transaction) => {
    if (!transaction.paymentMethod) return null
    
    const methodLabels = {
      card: transaction.cardLast4 ? `Carta •••• ${transaction.cardLast4}` : 'Carta di Credito',
      paypal: 'PayPal',
      bank_transfer: 'Bonifico Bancario'
    }
    
    const methodIcons = {
      card: <CreditCard size={16} weight="duotone" />,
      paypal: <Bank size={16} weight="duotone" />,
      bank_transfer: <Bank size={16} weight="duotone" />
    }
    
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {methodIcons[transaction.paymentMethod]}
        <span>{methodLabels[transaction.paymentMethod]}</span>
      </div>
    )
  }

  const totalSpent = transactions
    .filter(t => (t.type === 'payment' || t.type === 'cancellation_fee') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalRefunded = transactions
    .filter(t => (t.type === 'refund' || t.status === 'refunded') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBonus = transactions
    .filter(t => t.type === 'bonus' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Receipt size={64} weight="thin" className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-semibold mb-2">Nessuna Transazione</p>
          <p className="text-sm text-muted-foreground">
            Le tue transazioni appariranno qui dopo aver partecipato alle partite
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Totale Speso</span>
              <ArrowCircleUp size={20} weight="duotone" className="text-red-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Totale Rimborsato</span>
              <ArrowCircleDown size={20} weight="duotone" className="text-green-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalRefunded)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Bonus Ricevuti</span>
              <Gift size={20} weight="duotone" className="text-accent" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalBonus)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt size={24} weight="duotone" className="text-primary" />
            Cronologia Transazioni
          </CardTitle>
          <CardDescription>
            Tutte le tue transazioni in ordine cronologico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {sortedTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div
                    className={`p-4 rounded-lg border transition-all ${
                      onTransactionClick 
                        ? 'cursor-pointer hover:border-primary/30 hover:shadow-md' 
                        : ''
                    }`}
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTransactionIcon(transaction.type, transaction.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {formatTransactionType(transaction.type)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs border ${getTransactionStatusColor(transaction.status)}`}
                              >
                                {formatTransactionStatus(transaction.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className={`font-bold text-lg ${
                              transaction.type === 'refund' || transaction.type === 'bonus'
                                ? 'text-green-600'
                                : transaction.status === 'failed'
                                ? 'text-muted-foreground'
                                : 'text-foreground'
                            }`}>
                              {(transaction.type === 'refund' || transaction.type === 'bonus') ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getRelativeTime(transaction.timestamp)}
                            </p>
                          </div>
                        </div>

                        {transaction.metadata && (
                          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                            {transaction.metadata.venueName && (
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} weight="duotone" />
                                <span>{transaction.metadata.venueName}</span>
                              </div>
                            )}
                            {transaction.metadata.matchDate && transaction.metadata.matchTime && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} weight="duotone" />
                                <span>
                                  {transaction.metadata.matchDate} • {transaction.metadata.matchTime}
                                </span>
                              </div>
                            )}
                            {transaction.metadata.refundReason && (
                              <div className="flex items-start gap-1.5 mt-2">
                                <WarningCircle size={14} weight="duotone" className="mt-0.5 flex-shrink-0" />
                                <span className="italic">{transaction.metadata.refundReason}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {getPaymentMethodDisplay(transaction) && (
                          <div className="pt-2">
                            {getPaymentMethodDisplay(transaction)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
