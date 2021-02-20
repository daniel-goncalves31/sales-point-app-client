export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE = 2
}

export interface ProductModel {
  id: number
  name: string
  brand: string
  quantity: number
  minQuantity: number
  price: number
  status: ProductStatus
}
