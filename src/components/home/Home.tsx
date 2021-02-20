import React from 'react'
import { Layout } from 'antd'
import Navbar from './navbar/Navbar'
import Sidemenu from './sidemenu/Sidemenu'
import LayoutContent from './content/Content'

interface Props {}
const Home: React.FC<Props> = () => {
  return (
    <Layout style={{ minHeight: '100%' }}>
      <Navbar />
      <Layout style={{ borderTop: '1px solid #e5e5e5' }}>
        <Sidemenu />
        <Layout style={{ padding: '12px' }}>
          <LayoutContent />
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Home
