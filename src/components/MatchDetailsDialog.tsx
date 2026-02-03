import { type Match, type User } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Clock, CurrencyEur, Phone, CheckCircle } from '@phosphor-icons/react'
import { SkillBadge } from './SkillBadge'
import { PlayerCount } from './PlayerCount'
import { formatDate, formatCurrency } from '@/lib/helpers'
import { useState } from 'react'

interface MatchDetailsDialogProps {
  match: Match | null
  open: boolean
  onClose: () => void
  onJoin: (matchId: string) => void
  currentUser: User | null
}

export function MatchDetailsDialog({ match, open, onClose, onJoin, currentUser }: MatchDetailsDialogProps) {
  const [showPayment, setShowPayment] = useState(false)

  if (!match) return null

  const isJoined = currentUser?.joinedMatches.includes(match.id) ?? false
  const isFull = match.currentPlayers >= match.totalPlayers
  const canJoin = !isFull && !isJoined && match.status === 'open'

  const handleJoinClick = () => {
    if (canJoin) {
      setShowPayment(true)
    }
  }

  const handleConfirmPayment = () => {
    onJoin(match.id)
    setShowPayment(false)
    onClose()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (showPayment) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Conferma Pagamento</DialogTitle>
            <DialogDescription>
              Completa il pagamento per confermare la tua partecipazione
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partita</span>
                <span className="font-semibold">{match.venue.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data e Ora</span>
                <span className="font-semibold">{formatDate(match.date)} • {match.time}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Totale</span>
                <span className="font-bold text-primary">{formatCurrency(match.price)}</span>
              </div>
            </div>

            <div className="bg-accent/10 border-2 border-accent p-4 rounded-lg">
              <p className="text-sm text-center text-accent-foreground">
                <CheckCircle size={20} weight="fill" className="inline mr-2" />
                Pagamento sicuro elaborato da Stripe
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleConfirmPayment}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Conferma e Paga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-3xl mb-2">{match.venue.name}</DialogTitle>
                  <DialogDescription className="text-base">
                    {match.venue.address}
                  </DialogDescription>
                </div>
                <SkillBadge level={match.skillLevel} />
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <Clock size={20} weight="fill" className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Ora</p>
                      <p className="font-semibold">{formatDate(match.date)}</p>
                      <p className="font-semibold">{match.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <CurrencyEur size={20} weight="fill" className="text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Costo</p>
                      <p className="font-bold text-xl">{formatCurrency(match.price)}</p>
                      <p className="text-sm text-muted-foreground">per giocatore</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-lg mb-3">Giocatori</h4>
                <PlayerCount
                  current={match.currentPlayers}
                  total={match.totalPlayers}
                  showProgress={true}
                />
              </div>

              {match.participants.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Partecipanti Confermati</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {match.participants.map((participant) => (
                        <div
                          key={participant.userId}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(participant.firstName, participant.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {participant.firstName} {participant.lastName}
                            </p>
                            <SkillBadge level={participant.skillLevel} className="mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="font-semibold text-lg mb-3">Informazioni Campo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={18} weight="fill" className="text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{match.venue.address}</p>
                      <p className="text-muted-foreground">{match.venue.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} weight="fill" className="text-primary" />
                    <p>{match.venue.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              {isJoined ? (
                <div className="w-full text-center py-3 bg-primary/10 text-primary rounded-lg font-semibold">
                  <CheckCircle size={20} weight="fill" className="inline mr-2" />
                  Sei iscritto a questa partita
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Chiudi
                  </Button>
                  <Button
                    onClick={handleJoinClick}
                    disabled={!canJoin}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    {isFull ? 'Partita Completa' : 'Unisciti alla Partita'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
