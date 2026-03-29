import { Droppable, Draggable } from '@hello-pangea/dnd'
import { STATUS_CONFIG } from '../lib/messages'
import Card from './Card'

export default function Column({ status, leads, onUpdate }) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className={`flex-shrink-0 w-64 rounded-2xl border-2 ${cfg.bg} ${cfg.border} flex flex-col`}>
      {/* Cabeçalho da coluna */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <span className="font-semibold text-sm text-gray-700">{cfg.label}</span>
        </div>
        <span className="bg-white text-gray-600 font-bold text-xs rounded-full px-2 py-0.5 border">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 pb-2 min-h-16 rounded-b-2xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-white/60' : ''
            }`}
          >
            {leads.map((lead, index) => (
              <Draggable key={String(lead.id)} draggableId={String(lead.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card
                      lead={lead}
                      onUpdate={onUpdate}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
