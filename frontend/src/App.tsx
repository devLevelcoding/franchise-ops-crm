import { useEffect, useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import ResourceView from './components/ResourceView'
import { listResource } from './api'
import type { Inspection, Shop, Task, Ticket } from './types'

const NAV: NavItem[] = [
  { key: 'shops', label: 'Shops' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'tasks', label: 'Checklists' },
  { key: 'tickets', label: 'Tickets' },
]

const shopName = (row: { shop?: Shop }) => row.shop ? row.shop.name : '—'

export default function App() {
  const [active, setActive] = useState('shops')
  const [shops, setShops] = useState<Shop[]>([])

  useEffect(() => {
    listResource<Shop>('shops').then(r => setShops(r.data)).catch(() => {})
  }, [active])

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          franchise<span className="text-txt2 font-normal">ops</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 1 &middot; Pure SassFactory reuse</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'shops' && (
            <ResourceView<Shop>
              resource="shops"
              title="Shops"
              quickAction={{ label: 'Open', action: 'open', showIf: r => r.status === 'opening' }}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'code', label: 'Code' },
                { key: 'city', label: 'City' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'name', label: 'Name', required: true },
                { key: 'code', label: 'Code', placeholder: 'CJ-01' },
                { key: 'address', label: 'Address' },
                { key: 'city', label: 'City' },
                { key: 'phone', label: 'Phone' },
                { key: 'notes', label: 'Notes' },
              ]}
            />
          )}

          {active === 'inspections' && (
            <ResourceView<Inspection>
              resource="inspections"
              title="Inspections"
              shops={shops}
              quickAction={{ label: 'Complete', action: 'complete', showIf: r => r.status !== 'completed' }}
              columns={[
                { key: 'shop', label: 'Shop', render: shopName },
                { key: 'type', label: 'Type' },
                { key: 'inspectorName', label: 'Inspector' },
                { key: 'scheduledAt', label: 'Scheduled', render: r => new Date(r.scheduledAt).toLocaleDateString() },
                { key: 'score', label: 'Score', render: r => r.score != null ? String(r.score) : '—' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'shopId', label: 'Shop', type: 'shop-select', required: true },
                { key: 'type', label: 'Type', placeholder: 'routine' },
                { key: 'inspectorName', label: 'Inspector' },
                { key: 'scheduledAt', label: 'Scheduled date', type: 'date', required: true },
              ]}
            />
          )}

          {active === 'tasks' && (
            <ResourceView<Task>
              resource="tasks"
              title="Checklists"
              shops={shops}
              quickAction={{ label: 'Complete', action: 'complete', showIf: r => r.status !== 'done' }}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'shop', label: 'Shop', render: shopName },
                { key: 'dueDate', label: 'Due', render: r => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'shopId', label: 'Shop', type: 'shop-select', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'description', label: 'Description' },
                { key: 'dueDate', label: 'Due date', type: 'date' },
              ]}
            />
          )}

          {active === 'tickets' && (
            <ResourceView<Ticket>
              resource="tickets"
              title="Tickets"
              shops={shops}
              quickAction={{ label: 'Close', action: 'close', showIf: r => r.status !== 'closed' }}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'shop', label: 'Shop', render: shopName },
                { key: 'priority', label: 'Priority' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'shopId', label: 'Shop', type: 'shop-select', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'body', label: 'Description', required: true },
                { key: 'priority', label: 'Priority (low/medium/high/urgent)', placeholder: 'medium' },
                { key: 'category', label: 'Category' },
              ]}
            />
          )}
        </main>
      </div>
    </div>
  )
}
