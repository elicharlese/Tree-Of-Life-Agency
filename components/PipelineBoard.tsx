'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign,
  Calendar,
  User,
  MoreVertical,
  Plus,
  Target
} from 'lucide-react'
import { Deal } from '@/libs/shared-types/crm'
import { getPipelineData } from '@/lib/crm'

interface PipelineBoardProps {
  deals: Deal[]
  onDealUpdate?: (deal: Deal) => void
}

export default function PipelineBoard({ onDealUpdate }: PipelineBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const pipelineData = getPipelineData()

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragEnd = () => {
    setDraggedDeal(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (draggedDeal && onDealUpdate) {
      const updatedDeal = { ...draggedDeal, stage: stage as Deal['stage'] }
      onDealUpdate(updatedDeal)
    }
    setDraggedDeal(null)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'discovery': return 'bg-blue-600'
      case 'proposal': return 'bg-yellow-600'
      case 'negotiation': return 'bg-orange-600'
      case 'contract': return 'bg-purple-600'
      case 'closed_won': return 'bg-green-600'
      case 'closed_lost': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'discovery': return 'Discovery'
      case 'proposal': return 'Proposal'
      case 'negotiation': return 'Negotiation'
      case 'contract': return 'Contract'
      case 'closed_won': return 'Closed Won'
      case 'closed_lost': return 'Closed Lost'
      default: return stage
    }
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex space-x-6 min-w-max pb-6">
        {pipelineData.map((stageData) => (
          <div
            key={stageData.stage}
            className="w-80 bg-dark-700 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stageData.stage)}
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-dark-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(stageData.stage)}`}></div>
                  <h3 className="font-semibold">{getStageTitle(stageData.stage)}</h3>
                  <span className="bg-dark-600 px-2 py-1 rounded text-xs">{stageData.count}</span>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>${stageData.totalValue.toLocaleString()}</span>
                <span>{stageData.averageProbability.toFixed(0)}% avg</span>
              </div>
            </div>

            {/* Deals List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {stageData.deals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-dark-600 rounded-lg p-4 cursor-grab active:cursor-grabbing border-l-4 ${getStageColor(deal.stage)} ${
                      draggedDeal?.id === deal.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm leading-tight">{deal.name}</h4>
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">${deal.value.toLocaleString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          deal.probability >= 75 ? 'bg-green-600' :
                          deal.probability >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {deal.probability}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {deal.expectedCloseDate.toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{deal.assignedTo}</span>
                      </div>
                    </div>

                    {deal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {deal.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-dark-500 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {deal.tags.length > 2 && (
                          <span className="px-2 py-1 bg-dark-500 rounded text-xs">
                            +{deal.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {stageData.deals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No deals in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
