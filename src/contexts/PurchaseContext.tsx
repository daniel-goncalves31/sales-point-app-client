import React, { useState, useContext, useEffect } from 'react'
import { PurchaseModel } from '../models/PurchaseModel'
import { useFetchLazyApi } from '../hooks/use-fetch-lazy-api'
import { useCurrentUserContext } from './CurrentUserContext'

interface IPurchase {
  purchases: PurchaseModel[]
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseModel[]>>
  isLoading: boolean
  getPurchases: (date: string, filter: string) => any
}

const PurchaseContext = React.createContext<IPurchase>({
  purchases: [],
  setPurchases: () => { },
  isLoading: true,
  getPurchases: () => { }
})

const usePurchaseContext = () => useContext(PurchaseContext)

const PurchaseProvider: React.FC = ({ children }) => {
  const { isAuthorized } = useCurrentUserContext()
  const [purchases, setPurchases] = useState<PurchaseModel[]>([])
  const { isLoading, fetchLazyApi } = useFetchLazyApi()

  const getPurchases = async (
    date: string = '',
    filter: string = ''
  ): Promise<void> => {
    const data = await fetchLazyApi(`/purchase/?date=${date}&filter=${filter}`)
    if (data) {
      setPurchases(data)
    }
  }

  useEffect(() => {
    if (isAuthorized(['Admin', 'Admin Master'])) {
      getPurchases()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <PurchaseContext.Provider
      value={{ purchases, isLoading, setPurchases, getPurchases }}
    >
      {children}
    </PurchaseContext.Provider>
  )
}

export { usePurchaseContext, PurchaseProvider }
