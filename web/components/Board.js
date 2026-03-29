import { useState, useRef } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { STATUS_ORDER } from '../lib/messages'
import { supabase } from '../lib/supabase'
import Column from './Column'

export default function Board({ initialLeads }) {
  const [leads, setLeads] = useState(initialLeads)
  const prevLeads = useRef(leads)

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId
    const leadId = Number(draggableId)

    // Atualiza UI imediatamente (otimístico)
    prevLeads.current = leads
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))

    // Persiste no Supabase
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)

    if (error) {
      // Reverte se falhar
      setLeads(prevLeads.current)
    }
  }

  const onUpdate = async (id, updates) => {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l))
    }
  }

  const grouped = {}
  STATUS_ORDER.forEach(s => { grouped[s] = [] })
  leads.forEach(l => { if (grouped[l.status]) grouped[l.status].push(l) })

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 p-4 overflow-x-auto min-h-[calc(100vh-64px)] items-start">
        {STATUS_ORDER.map(status => (
          <Column
            key={status}
            status={status}
            leads={grouped[status]}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
