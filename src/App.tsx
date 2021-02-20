import React from 'react'
import './App.less'
import { ConfigProvider } from 'antd'
import ptBr from 'antd/es/locale/pt_BR'
import 'moment/locale/pt-br'
import moment from 'moment'
import Routes from './Routes'
import { CurrentUserProvider } from './contexts/CurrentUserContext'
import { DialogProvider } from './contexts/DialogContext'

moment.locale('pt-br')

function App() {
  return (
    <ConfigProvider locale={ptBr}>
      <DialogProvider>
        <CurrentUserProvider>
          <Routes />
        </CurrentUserProvider>
      </DialogProvider>
    </ConfigProvider>
  )
}

export default App
