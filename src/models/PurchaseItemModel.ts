export interface PurchaseItemModel {
  id: number
  product: {
    id: number
    name: string
    brand: string
  }
  price: number
  quantity: number
}
