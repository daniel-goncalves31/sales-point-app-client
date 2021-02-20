import React, { useState, useContext, useEffect } from 'react'
import { useFetchApi } from '../hooks/use-fetch-api'
import { ProductModel } from '../models/ProductModel'

interface IProduct {
  products: ProductModel[]
  setProducts: React.Dispatch<React.SetStateAction<ProductModel[]>>
  changeProductQuantity: (items: any[], decrement: boolean) => void
  isLoading: boolean
}

const ProductContext = React.createContext<IProduct>({
  products: [],
  setProducts: () => { },
  changeProductQuantity: () => { },
  isLoading: true
})

const useProductContext = () => useContext(ProductContext)

const ProductProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<ProductModel[]>([])
  const { isLoading, data } = useFetchApi('/product')

  useEffect(() => {
    if (data) {
      setProducts(data)
    }
  }, [data])

  const changeProductQuantity = (items: any[], decrement: boolean) => {
    const newData = products

    items.forEach(item => {
      const index = newData.findIndex(product => product.id === item.productId)
      if (index > -1) {
        newData[index].quantity += decrement
          ? item.quantity * -1
          : item.quantity
      }
    })

    setProducts(newData)
  }

  return (
    <ProductContext.Provider
      value={{ products, isLoading, setProducts, changeProductQuantity }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export { useProductContext, ProductProvider }
