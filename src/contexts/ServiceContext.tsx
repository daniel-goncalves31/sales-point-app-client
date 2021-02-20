import React, { useState, useContext, useEffect } from 'react'
import { useFetchApi } from '../hooks/use-fetch-api'
import { ServiceModel } from '../models/ServiceModel'

interface IService {
  services: ServiceModel[]
  setServices: React.Dispatch<React.SetStateAction<ServiceModel[]>>
  isLoading: boolean
}

const ServiceContext = React.createContext<IService>({
  services: [],
  setServices: () => { },
  isLoading: true
})

const useServiceContext = () => useContext(ServiceContext)

const ServiceProvider: React.FC = ({ children }) => {
  const [services, setServices] = useState<ServiceModel[]>([])
  const { isLoading, data } = useFetchApi('/service')

  useEffect(() => {
    if (data) {
      setServices(data)
    }
  }, [data])

  return (
    <ServiceContext.Provider
      value={{ services, isLoading, setServices }}
    >
      {children}
    </ServiceContext.Provider>
  )
}

export { useServiceContext, ServiceProvider }
