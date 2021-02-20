import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDialogContext } from '../contexts/DialogContext'
import { IError } from '../interfaces/IError'
import { log } from '../utils/log'

const axiosApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}api`,
  withCredentials: true
})

export const useFetchApi = (url: string) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<IError | null>(null)
  const { showError } = useDialogContext()

  useEffect(() => {
    async function fetchApi (): Promise<any> {
      try {
        const res = await axiosApi({ method: 'GET', url })

        setIsLoading(false)
        setData(res.data)
      } catch (err) {
        if (!err.response) {
          showError(
            'Problema ao tentar conectar com o servidor. Por favor tente novamente mais tarde.'
          )
        } else {
          const errStatus = err.response.status
          if (errStatus >= 500) {
            showError(
              'Houve um problema no servidor. Tente novamente mais tarde.'
            )
          }
          log(err.response)
          setError({ message: 'Houve um erro', status: errStatus })
        }
        setIsLoading(false)
      }
    }
    fetchApi()
  }, [url, showError])

  return { isLoading, error, data }
}
