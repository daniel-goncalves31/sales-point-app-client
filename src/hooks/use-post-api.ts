import axios from 'axios'
import { log } from '../utils/log'
import { useDialogContext } from '../contexts/DialogContext'
import { useState } from 'react'

const axiosApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}api`,
  withCredentials: true
})

export const usePostApi = (
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  errorMessage: string,
  successMessage?: string
) => {
  const [isLoading, setIsLoading] = useState(false)
  const { showError, showSuccess } = useDialogContext()

  const postApi = async (data: any): Promise<any> => {
    try {
      setIsLoading(true)
      const res = await axiosApi({ method, url, data })

      setIsLoading(false)
      if (res.status === 200 || res.status === 204) {
        successMessage && showSuccess(successMessage)
        return res.data || true
      } else {
        showError(errorMessage)
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
        } else if (errStatus === 502 && url === '/tvbox') {
          showError(
            'Nenhum código disponível. Cadastre um novo código para continuar.'
          )
        } else if (errStatus === 502 && url === '/code' && method === 'DELETE') {
          showError(
            'Código em uso. Exclua a tvbox relacionada para prosseguir.'
          )
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

  return { isLoading, postApi }
}
