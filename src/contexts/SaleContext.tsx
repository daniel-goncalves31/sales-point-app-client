import React, { useState, useContext, useEffect } from 'react'
import { SaleModel } from '../models/SaleModel'
import { useFetchLazyApi } from '../hooks/use-fetch-lazy-api'

interface ISale {
  sales: SaleModel[]
  setSales: React.Dispatch<React.SetStateAction<SaleModel[]>>
  isLoading: boolean
  getSales: (date: string, filter: string) => any
}

const SaleContext = React.createContext<ISale>({
  sales: [],
  setSales: () => {},
  isLoading: true,
  getSales: () => {}
})

const useSaleContext = () => useContext(SaleContext)

const SaleProvider: React.FC = ({ children }) => {
  const [sales, setSales] = useState<SaleModel[]>([])
  const { isLoading, fetchLazyApi } = useFetchLazyApi()

  const getSales = async (
    date: string = '',
    filter: string = ''
  ): Promise<void> => {
    const data = await fetchLazyApi(`/sale/?date=${date}&filter=${filter}`)
    if (data) {
      setSales(data)
    }
  }

  useEffect(() => {
    getSales()
    // eslint-disable-next-line
  }, [])

  return (
    <SaleContext.Provider value={{ sales, isLoading, setSales, getSales }}>
      {children}
    </SaleContext.Provider>
  )
}

export { useSaleContext, SaleProvider }
