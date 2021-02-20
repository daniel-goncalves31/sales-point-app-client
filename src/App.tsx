import './App.css'
import 'moment/locale/pt-br'

import { ConfigProvider } from 'antd'
import { CurrentUserProvider } from './contexts/CurrentUserContext'
import { DialogProvider } from './contexts/DialogContext'
import React from 'react'
import Routes from './Routes'
import moment from 'moment'
import ptBr from 'antd/es/locale/pt_BR'

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
