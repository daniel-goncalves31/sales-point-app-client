import './purchases.styles.css'

import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography
} from 'antd'
import React, { useState } from 'react'

import AddPurchaseModal from './AddPurchaseModal'
import { CloseOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import { PurchaseItemSubTable } from './PurchaseItemsTable'
import { PurchaseModel } from '../../../../models/PurchaseModel'
import { Store } from 'antd/lib/form/interface'
import moment from 'moment'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import { usePurchaseContext } from '../../../../contexts/PurchaseContext'

interface Props { }

const { RangePicker } = DatePicker

const Purchases: React.FC<Props> = () => {
  const {
    purchases,
    isLoading,
    getPurchases,
    setPurchases
  } = usePurchaseContext()
  const [showModal, setShowModal] = useState(false)
  const { isLoading: deletingPurchase, postApi } = usePostApi(
    '/purchase',
    'DELETE',
    'Dados inválidos'
  )

  const [getPurchasesForm] = Form.useForm()
  const { changeProductQuantity } = useProductContext()
  const handleOnDeletePurchase = async (purchase: PurchaseModel) => {
    const purchaseId = purchase.id
    const res = await postApi({ purchaseId })

    if (res) {
      const items = purchase.items.map(item => ({
        quantity: item.quantity,
        productId: item.product.id
      }))
      changeProductQuantity(items, true)
      setPurchases(prevPurchases =>
        prevPurchases.filter(purchase => purchase.id !== purchaseId)
      )
    }
  }

  const handleGetPurchasesFormOnFinish = (values: Store) => {
    let date = ''
    const filter = values.filter || ''

    const { range } = values
    if (range) {
      const startDate = range[0].format('YYYY-MM-DD')
      const endDate = range[1].format('YYYY-MM-DD')

      date = `${startDate} - ${endDate}`
    }

    getPurchases(date, filter)
  }

  const purchaseCols: ColumnsType<PurchaseModel> = [
    {
      title: 'Comprador',
      dataIndex: 'userName',
      key: 'userName',
      sorter: (a: PurchaseModel, b: PurchaseModel) =>
        a.user.name.localeCompare(b.user.name)
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      sorter: (a: PurchaseModel, b: PurchaseModel) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: value =>
        moment(value).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: value =>
        value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }),
      sorter: (a: PurchaseModel, b: PurchaseModel) =>
        (a as any).total - (b as any).total
    },
    {
      title: '#',
      key: '#',
      render: (_, purchase) => (
        <Tooltip title='Excluir Compra'>
          <Popconfirm
            title='Tem certeza que deseja excluir esta compra?'
            onConfirm={() => handleOnDeletePurchase(purchase)}
            okText='Sim'
            cancelText='Não'
            placement='topRight'
          >
            <CloseOutlined className='icon-delete-purchase' />
          </Popconfirm>
        </Tooltip>
      )
    }
  ]

  return (
    <>
      {showModal && (
        <AddPurchaseModal closeModal={setShowModal} visible={showModal} />
      )}
      <Typography.Title style={{ marginBottom: '0', display: 'inline-block' }}>
        Repor Estoque
      </Typography.Title>
      <Typography.Text> (Compras realizadas dos fornecedores)</Typography.Text>
      <Divider style={{ margin: '8px 0' }} />
      <Form
        form={getPurchasesForm}
        onFinish={handleGetPurchasesFormOnFinish}
        component={false}
      >
        <Space align='center' style={{ marginBottom: '8px' }}>
          <Form.Item name='filter' key='filter'>
            <Input.Search
              placeholder='Pesquise...'
              onSearch={() => getPurchasesForm.submit()}
            />
          </Form.Item>
          <Form.Item name='range' key='range'>
            <RangePicker
              onChange={() => getPurchasesForm.submit()}
              format='DD/MM/YYYY'
            />
          </Form.Item>
          <Button type='primary' onClick={() => setShowModal(true)}>
            Adicionar Compra
          </Button>
        </Space>
      </Form>
      <Form component={false}>
        <Table
          size='small'
          columns={purchaseCols}
          dataSource={purchases?.map(purchase => ({
            ...purchase,
            key: purchase.id,
            userName: purchase.user.name,
            total: purchase.items.reduce(
              (tot, item) => (tot += item.price * item.quantity),
              0
            )
          }))}
          loading={isLoading || deletingPurchase}
          expandable={{ expandedRowRender: (purchase) => <PurchaseItemSubTable purchase={purchase} /> }}
        />
      </Form>
    </>
  )
}

export default Purchases
