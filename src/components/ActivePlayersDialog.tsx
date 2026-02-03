import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Trophy, TrendUp, Crown, Users } from '@phosphor-icons/react'
import { SkillBadge } from '@/components/SkillBadge'
import { type SkillLevel } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PlayerStats {
  id: string
  firstName: string
  lastName: string
  skillLevel: SkillLevel
  totalMatches: number
  totalPoints: number
  averagePoints: number
  matchHistory: {
    matchNumber: number
    points: number
    date: string
  }[]
  rank: number
}

interface ActivePlayersDialogProps {
  open: boolean
  onClose: () => void
}

const generateMockPlayers = (): PlayerStats[] => {
  const firstNames = ['Marco', 'Luca', 'Giovanni', 'Alessandro', 'Francesco', 'Andrea', 'Matteo', 'Lorenzo', 'Giuseppe', 'Antonio', 'Gabriele', 'Roberto', 'Paolo', 'Davide', 'Simone']
  const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Russo', 'Ferrari', 'Romano', 'Colombo', 'Bruno', 'Ricci', 'Marino', 'Greco', 'Conti', 'Costa', 'Gallo', 'Fontana']
  const skillLevels: SkillLevel[] = ['principiante', 'intermedio', 'avanzato']

  const players: PlayerStats[] = []

  for (let i = 0; i < 15; i++) {
    const totalMatches = Math.floor(Math.random() * 20) + 5
    const matchHistory: { matchNumber: number; points: number; date: string }[] = []
    let cumulativePoints = 0

    for (let j = 0; j < totalMatches; j++) {
      const points = Math.floor(Math.random() * 15) + 5
      cumulativePoints += points
      const date = new Date()
      date.setDate(date.getDate() - (totalMatches - j) * 3)
      
      matchHistory.push({
        matchNumber: j + 1,
        points: cumulativePoints,
        date: date.toISOString()
      })
    }

    const totalPoints = cumulativePoints
    const averagePoints = Math.round(totalPoints / totalMatches)

    players.push({
      id: `player-${i + 1}`,
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
      totalMatches,
      totalPoints,
      averagePoints,
      matchHistory,
      rank: 0
    })
  }

  players.sort((a, b) => b.totalPoints - a.totalPoints)
  players.forEach((player, index) => {
    player.rank = index + 1
  })

  return players
}

export function ActivePlayersDialog({ open, onClose }: ActivePlayersDialogProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null)

  useEffect(() => {
    if (open) {
      const mockPlayers = generateMockPlayers()
      setPlayers(mockPlayers)
      setSelectedPlayer(mockPlayers[0])
    }
  }, [open])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return 'text-muted-foreground'
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Crown size={20} weight="fill" className={getRankColor(rank)} />
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Trophy size={32} weight="duotone" className="text-primary" />
            Active Players Leaderboard
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy size={20} weight="duotone" className="text-primary" />
                  Top Players
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="px-6 pb-4 space-y-2">
                    {players.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Trophy size={48} weight="duotone" className="mx-auto mb-4 opacity-30" />
                        <p>No players found</p>
                      </div>
                    ) : (
                      players.map((player) => (
                        <div
                          key={player.id}
                          onClick={() => setSelectedPlayer(player)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                            selectedPlayer?.id === player.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-bold shrink-0">
                              {getRankIcon(player.rank) || `#${player.rank}`}
                            </div>
                            
                            <Avatar className="h-12 w-12 border-2 border-accent/30 shrink-0">
                              <AvatarFallback className="bg-accent/10 text-accent text-sm font-bold">
                                {`${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-semibold truncate">
                                  {player.firstName} {player.lastName}
                                </p>
                                <SkillBadge level={player.skillLevel} size="sm" />
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Trophy size={14} weight="duotone" />
                                  {player.totalPoints} pts
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{player.totalMatches} matches</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1">
                                  <TrendUp size={14} />
                                  {player.averagePoints} avg
                                </span>
                              </div>
                            </div>

                            {player.rank <= 3 && (
                              <Badge 
                                variant="outline" 
                                className={`shrink-0 ${
                                  player.rank === 1 
                                    ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' 
                                    : player.rank === 2
                                    ? 'bg-gray-400/10 text-gray-700 border-gray-400/30'
                                    : 'bg-amber-600/10 text-amber-700 border-amber-600/30'
                                }`}
                              >
                                Top {player.rank}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {selectedPlayer ? (
                <>
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
                        <Avatar className="h-14 w-14 border-2 border-accent shrink-0">
                          <AvatarFallback className="bg-accent/20 text-accent text-lg font-bold">
                            {`${selectedPlayer.firstName.charAt(0)}${selectedPlayer.lastName.charAt(0)}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xl font-bold">
                              {selectedPlayer.firstName} {selectedPlayer.lastName}
                            </span>
                            {getRankIcon(selectedPlayer.rank)}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <SkillBadge level={selectedPlayer.skillLevel} />
                            <Badge variant="outline" className="bg-background/50">
                              Rank #{selectedPlayer.rank}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-primary">
                            {selectedPlayer.totalPoints}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Total Points
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-secondary">
                            {selectedPlayer.totalMatches}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Matches Played
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-accent">
                            {selectedPlayer.averagePoints}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Avg Points
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendUp size={20} weight="duotone" className="text-accent" />
                        Points Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedPlayer.matchHistory} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 155)" opacity={0.3} />
                            <XAxis 
                              dataKey="matchNumber" 
                              label={{ value: 'Match Number', position: 'insideBottom', offset: -5, style: { fontSize: '12px' } }}
                              stroke="oklch(0.48 0.04 240)"
                              tick={{ fill: 'oklch(0.48 0.04 240)', fontSize: 12 }}
                            />
                            <YAxis 
                              label={{ value: 'Cumulative Points', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                              stroke="oklch(0.48 0.04 240)"
                              tick={{ fill: 'oklch(0.48 0.04 240)', fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'oklch(1 0 0)',
                                border: '1px solid oklch(0.88 0.01 155)',
                                borderRadius: '8px',
                                padding: '8px 12px'
                              }}
                              labelFormatter={(value) => `Match #${value}`}
                              formatter={(value: number) => [`${value} points`, 'Total']}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="points" 
                              name="Cumulative Points"
                              stroke="oklch(0.45 0.12 155)" 
                              strokeWidth={3}
                              dot={{ fill: 'oklch(0.82 0.18 130)', r: 4 }}
                              activeDot={{ r: 6, fill: 'oklch(0.62 0.14 45)' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Users size={48} weight="duotone" className="mx-auto mb-4 opacity-30" />
                    <p>Select a player to view their stats</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
