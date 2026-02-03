import { type Match } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, CurrencyEur } from '@phosphor-icons/react'
import { SkillBadge } from './SkillBadge'
import { PlayerCount } from './PlayerCount'
import { formatDate, formatCurrency } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface MatchCardProps {
  match: Match
  onViewDetails: (match: Match) => void
  isJoined?: boolean
}

export function MatchCard({ match, onViewDetails, isJoined = false }: MatchCardProps) {
  const isFull = match.currentPlayers >= match.totalPlayers
  const canJoin = !isFull && !isJoined && match.status === 'open'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
        <CardHeader className="pb-3" onClick={() => onViewDetails(match)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-xl text-foreground mb-1">
                {match.venue.name}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin size={16} weight="fill" />
                <span>{match.venue.city}</span>
              </div>
            </div>
            <SkillBadge level={match.skillLevel} />
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4" onClick={() => onViewDetails(match)}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <Clock size={18} weight="fill" className="text-primary" />
              <span className="font-medium">
                {formatDate(match.date)} • {match.time}
              </span>
            </div>

            <Separator />

            <PlayerCount
              current={match.currentPlayers}
              total={match.totalPlayers}
              showProgress={true}
            />

            <div className="flex items-center gap-2 text-foreground">
              <CurrencyEur size={18} weight="fill" className="text-secondary" />
              <span className="font-semibold text-lg">
                {formatCurrency(match.price)}
              </span>
              <span className="text-sm text-muted-foreground">a giocatore</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {isJoined ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(match)}
            >
              Visualizza Dettagli
            </Button>
          ) : (
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              disabled={!canJoin}
              onClick={() => onViewDetails(match)}
            >
              {isFull ? 'Partita Completa' : 'Unisciti'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
