import { type SkillLevel } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FunnelSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

interface MatchFiltersProps {
  skillLevel: SkillLevel | 'all'
  onSkillLevelChange: (level: SkillLevel | 'all') => void
}

export function MatchFilters({ skillLevel, onSkillLevelChange }: MatchFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FunnelSimple size={20} weight="fill" className="text-primary" />
          <Label className="text-base font-semibold">Filtra per:</Label>
        </div>
        
        <div className="flex-1 max-w-xs">
          <Select value={skillLevel} onValueChange={(value) => onSkillLevelChange(value as SkillLevel | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Livello di gioco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i livelli</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzato">Avanzato</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
