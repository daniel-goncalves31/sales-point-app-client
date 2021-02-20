import axios from 'axios'
import { useState } from 'react'
import { useDialogContext } from '../contexts/DialogContext'
import { log } from '../utils/log'

const axiosApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}api`,
  withCredentials: true
})

export const useFetchLazyApi = (successMessage?: string) => {
  const [isLoading, setIsLoading] = useState(true)
  const { showError, showSuccess } = useDialogContext()

  const fetchLazyApi = async (url: string): Promise<any> => {
    try {
      const res = await axiosApi({ method: 'GET', url })

      setIsLoading(false)
      if (res.status === 200 || res.status === 204) {
        successMessage && showSuccess(successMessage)
        return res.data || true
      } else {
        showError('Não foi possível completar a ação.')
        return null
      }
    } catch (err) {
      if (!err.response) {
        showError(
          'Problema ao tentar conectar com o servidor. Por favor tente novamente mais tarde.'
        )
      } else {
        const errStatus = err.response.status
        if (errStatus === 403) {
          showError('Acesso negado')
        } else if (errStatus === 400) {
          showError('Dados fornecidos inválidos.')
        } else {
          showError(
            'Houve um problema no servidor. Tente novamente mais tarde.'
          )
        }
        log(err.response)
      }
      setIsLoading(false)
      return null
    }
  }

  return { isLoading, fetchLazyApi }
}
