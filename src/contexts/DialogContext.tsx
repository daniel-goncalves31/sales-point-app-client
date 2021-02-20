import React, { useContext } from 'react'
import { Modal, notification } from 'antd'

interface IDialog {
  showError: (content: string) => void
  showSuccess: (content: string) => void
}

const DialogContext = React.createContext<IDialog>({
  showError: () => {},
  showSuccess: () => {}
})

const useDialogContext = () => useContext(DialogContext)

const DialogProvider: React.FC = ({ children }) => {
  const showError = (content: string) => {
    Modal.error({ content })
  }

  const showSuccess = (description: string) => {
    notification.success({
      message: 'Sucesso',
      duration: 3,
      placement: 'bottomRight',
      description
    })
  }

  return (
    <DialogContext.Provider value={{ showError, showSuccess }}>
      {children}
    </DialogContext.Provider>
  )
}

export { useDialogContext, DialogProvider }
