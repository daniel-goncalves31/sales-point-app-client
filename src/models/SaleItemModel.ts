import { ServiceModel } from "./ServiceModel";

export interface SaleItemModel {
  id: number
  product?: {
    id: number
    name: string
    brand: string
  }
  service?: ServiceModel
  price: number
  quantity: number
}
