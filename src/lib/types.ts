export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'pending' | 'paid' | 'cancelled'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  description: string
  amount: number
  occurred_on: string
  category_id: string | null
  account_id: string | null
  card_id: string | null
  payment_method: string | null
  status: TransactionStatus
  notes: string | null
  created_at: string
}
