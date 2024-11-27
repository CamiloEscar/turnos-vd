import { forwardRef } from 'react'
import { FileQuestion, Clock, Wrench } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { COLORS, CATEGORY_CONFIGS } from '@/lib/constants'
import type { Category, CategoryType } from '@/lib/types'

interface CategoryCardProps {
  category: Category
  onClick: (category: Category) => void
  className?: string
  isLoading?: boolean
}

const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(({
  category,
  onClick,
  className = '',
  isLoading = false,
}, ref) => {
  const config = CATEGORY_CONFIGS[category.type as CategoryType] || CATEGORY_CONFIGS.information
  const colors = COLORS[config.color || 'gray']
  const Icon = config.icon || FileQuestion
  const isTechService = category.type?.includes('tech_support') || 
                       category.type === 'hardware' || 
                       category.type === 'network'

  return (
    <Card 
      ref={ref}
      className={`${colors.bg} ${colors.border} cursor-pointer transition-all duration-200 hover:shadow-lg border hover:scale-105 group ${className} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(category)
        }
      }}
      aria-label={`Seleccionar categoría ${category.name}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.icon} group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold truncate ${colors.text}`}>
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${colors.text} ${colors.bg}`}>
                <Clock className="h-3 w-3 mr-1" />
                {category.estimated_service_time} min
              </Badge>
              {isTechService && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <Wrench className="h-3 w-3 mr-1" />
                  Servicio Técnico
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CategoryCard.displayName = 'CategoryCard'

export default CategoryCard

