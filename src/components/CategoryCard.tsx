import React, { forwardRef } from 'react'
import { TypeIcon as type, LucideIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
  estimatedTime: number
  peopleWaiting: number
  onClick: () => void
  className?: string
  isLoading?: boolean
}

type ColorMap = {
  blue: string
  green: string
  red: string
  purple: string
  indigo: string
  pink: string
  gray: string
}

const colors: ColorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  pink: 'bg-pink-50 border-pink-200 text-pink-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700'
}

const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(({
  icon: Icon,
  title,
  description,
  color,
  estimatedTime,
  peopleWaiting,
  onClick,
  className = '',
  isLoading = false,
}, ref) => {
  const baseColor = colors[color as keyof ColorMap] || colors.gray
  const iconColor = baseColor.replace('50', '100')

  const totalWaitTime = peopleWaiting === 0 ? '0' : `${estimatedTime * peopleWaiting}`

  return (
    <Card 
      ref={ref}
      className={`${baseColor} cursor-pointer transition-all duration-200 hover:shadow-lg border hover:scale-105 group ${className} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
      aria-label={`Seleccionar categoría ${title} - Tiempo de espera estimado: ${totalWaitTime} minutos`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{title}</h3>
            <p className="text-xs opacity-90 line-clamp-1">{description}</p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${baseColor} font-medium text-xs whitespace-nowrap ml-2`}
          >
            {peopleWaiting} en espera
          </Badge>
        </div>
        
        <div className="flex items-baseline justify-between mt-3 text-sm">
          <div>
            <p className="font-semibold">{totalWaitTime} min espera</p>
            <p className="text-xs opacity-75">~{estimatedTime} min/persona</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CategoryCard.displayName = 'CategoryCard'

export default CategoryCard

