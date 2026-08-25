export interface Shop {
  id: number
  name: string
  code?: string | null
  address?: string | null
  city?: string | null
  phone?: string | null
  status: string
  openedAt?: string | null
  closedAt?: string | null
  notes?: string | null
}

export interface Inspection {
  id: number
  shopId: number
  shop?: Shop
  type: string
  inspectorName?: string | null
  scheduledAt: string
  completedAt?: string | null
  score?: number | null
  status: string
  notes?: string | null
}

export interface Task {
  id: number
  shopId: number
  shop?: Shop
  title: string
  description?: string | null
  dueDate?: string | null
  status: string
}

export interface Ticket {
  id: number
  shopId: number
  shop?: Shop
  title: string
  body: string
  response?: string | null
  priority: string
  category?: string | null
  status: string
  closedAt?: string | null
}

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'shop-select'
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface ColumnDef<T> {
  key: string
  label: string
  render?: (row: T) => string
}
