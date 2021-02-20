import { PurchaseItemModel } from './PurchaseItemModel'

export interface PurchaseModel {
  id: number
  userId: string
  user: {
    name: string
  }
  items: PurchaseItemModel[]
  date: string
}
