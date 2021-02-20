import { SaleItemModel } from './SaleItemModel'

export interface SaleModel {
  id: number
  userId: string
  user: {
    name: string
  }
  items: SaleItemModel[]
  date: string
  total: number
}
