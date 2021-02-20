import './sales.styles.less'

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
import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import React, { useState } from 'react'

import AddSaleModal from './AddSaleModal'
import { ColumnsType } from 'antd/lib/table'
import SaleEditableCell from './SaleEditableCell'
import { SaleModel } from '../../../../models/SaleModel'
import { Store } from 'antd/lib/form/interface'
import { log } from '../../../../utils/log'
import moment from 'moment'
import { saleItemsSubTable } from './SaleItemsTable'
import { useCurrentUserContext } from '../../../../contexts/CurrentUserContext'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import { useSaleContext } from '../../../../contexts/SaleContext'
import { useUserListContext } from '../../../../contexts/UserListContext'

interface Props { }

const { RangePicker } = DatePicker

const Sales: React.FC<Props> = () => {
  const { sales, isLoading, getSales, setSales } = useSaleContext()
  const [showModal, setShowModal] = useState(false)
  const { isLoading: deletingSale, postApi: deleteSaleApi } = usePostApi(
    '/sale',
    'DELETE',
    'Dados inválidos',
    'Venda deletada com sucesso'
  )
  const { isLoading: updatingSale, postApi: updateSaleApi } = usePostApi(
    '/sale',
    'PUT',
    'Dados inválidos',
    'Venda atualizada com sucesso'
  )

  const { changeProductQuantity } = useProductContext()
  const [getSalesForm] = Form.useForm()
  const [updateSaleForm] = Form.useForm()
  const { isAuthorized } = useCurrentUserContext()
  const [editingKey, setEditingKey] = useState(0)
  const { userList } = useUserListContext()
  const authorized = isAuthorized(['Admin', 'Admin Master'])

  const handleOnDeleteSale = async (sale: SaleModel) => {
    const saleId = sale.id
    const res = await deleteSaleApi({ saleId })

    if (res) {
      const items = sale.items.map(item => ({
        quantity: item.quantity,
        productId: item.product?.id
      }))
      changeProductQuantity(items, false)
      setSales(prevSales => prevSales.filter(sale => sale.id !== saleId))
    }
  }

  const isEditing = (row: SaleModel) => row.id === editingKey

  const edit = (record: SaleModel) => {
    updateSaleForm.setFieldsValue({
      userName: record.userId,
      date: moment(record.date)
    })
    setEditingKey(record.id)
  }

  const cancel = () => {
    setEditingKey(0)
  }

  const save = async (key: React.Key) => {
    try {
      const updatedSale = await updateSaleForm.validateFields()
      const newData = sales
      const index = newData.findIndex(item => key === item.id)
      const prevSale = newData[index]

      const req = {
        userId: updatedSale.userName,
        date: updatedSale.date.toISOString(),
        id: prevSale.id
      }

      const res = await updateSaleApi(req)

      if (res) {
        const selectedUser = userList?.find(
          user => user.id === updatedSale.userName
        )
        newData.splice(index, 1, {
          ...prevSale,
          ...req,
          user: {
            ...prevSale.user,
            name: selectedUser!.name
          }
        })
        setSales(newData)
        setEditingKey(0)
      }
    } catch (error) {
      log(error, true)
    }
  }

  const handleGetSalesFormOnFinish = (values: Store) => {
    let date = ''
    const filter = values.filter || ''

    const { range } = values
    if (range) {
      const startDate = range[0].format('YYYY-MM-DD')
      const endDate = range[1].format('YYYY-MM-DD')

      date = `${startDate} - ${endDate}`
    }

    getSales(date, filter)
  }

  const saleCols: ColumnsType<SaleModel> = [
    {
      title: 'Vendedor',
      dataIndex: 'userName',
      key: 'userName',
      showSorterTooltip: false,
      sorter: (a: SaleModel, b: SaleModel) =>
        a.user.name.localeCompare(b.user.name)
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      showSorterTooltip: false,
      defaultSortOrder: 'descend',
      sorter: (a: SaleModel, b: SaleModel) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: value =>
        moment(value).format('DD/MM/YYYY HH:mm')

    },
    {
      title: 'Desconto',
      dataIndex: 'discount',
      key: 'discount',
      showSorterTooltip: false,
      render: value =>
        value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }),
      sorter: (a: SaleModel, b: SaleModel) =>
        (a as any).discount - (b as any).discount
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      showSorterTooltip: false,
      render: value =>
        (value * 1).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }),
      sorter: (a: SaleModel, b: SaleModel) =>
        a.total - b.total
    }
  ]

  if (authorized) {
    saleCols.push({
      title: '#',
      key: '#',
      showSorterTooltip: false,
      align: 'center',
      render: (_: any, record: SaleModel) => {
        const editable = isEditing(record)
        return editable ? (
          <Space>
            <Popconfirm
              title='Tem certeza que deseja salvar?'
              onConfirm={() => save(record.id)}
            >
              <span className='edit-option'>Salvar</span>
            </Popconfirm>
            <span className='edit-option' onClick={cancel}>
              Cancelar
            </span>
          </Space>
        ) : (
            <Space>
              <Tooltip title='Editar Venda'>
                <EditOutlined
                  disabled={editingKey !== 0}
                  onClick={() => edit(record)}
                />
              </Tooltip>
              <Tooltip title='Excluir Venda'>
                <Popconfirm
                  title='Tem certeza que deseja excluir esta venda?'
                  onConfirm={() => handleOnDeleteSale(record)}
                  okText='Sim'
                  cancelText='Não'
                  placement='topRight'
                >
                  <CloseOutlined className='icon-delete-sale' />
                </Popconfirm>
              </Tooltip>
            </Space>
          )
      }
    })
  }

  const mergedColumns = saleCols.map(col => {
    if (col.title === 'Total' || col.title === '#' || col.title === 'Desconto') {
      return col
    }
    return {
      ...col,
      onCell: (record: SaleModel) => ({
        record,
        dataIndex: (col as any).dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  return (
    <>
      {showModal && (
        <AddSaleModal closeModal={setShowModal} visible={showModal} />
      )}
      <Typography.Title style={{ marginBottom: '0', display: 'inline-block' }}>
        Vendas
      </Typography.Title>
      <Typography.Text> (Vendas realizadas para os clientes)</Typography.Text>
      <Divider style={{ margin: '8px 0' }} />
      <Form
        form={getSalesForm}
        onFinish={handleGetSalesFormOnFinish}
        component={false}
      >
        <Space align='center' style={{ marginBottom: '8px' }}>
          <Form.Item name='filter' key='filter'>
            <Input.Search
              placeholder='Pesquise...'
              onSearch={() => getSalesForm.submit()}
            />
          </Form.Item>
          <Form.Item name='range' key='range'>
            <RangePicker
              onChange={() => getSalesForm.submit()}
              format='DD/MM/YYYY'
            />
          </Form.Item>
          <Button type='primary' onClick={() => setShowModal(true)}>
            Adicionar Venda
          </Button>
        </Space>
      </Form>
      <Form form={updateSaleForm} component={false}>
        <Table
          size='small'
          columns={mergedColumns as any}
          dataSource={sales?.map(sale => ({
            ...sale,
            key: sale.id,
            userName: sale.user.name,
            discount: sale.total * ((sale.items.reduce((acc, item) => acc += item.quantity * item.price, 0) / sale.total) - 1)
          }))}
          components={{
            body: {
              cell: SaleEditableCell
            }
          }}
          pagination={{
            onChange: cancel
          }}
          loading={isLoading || deletingSale || updatingSale}
          expandable={{ expandedRowRender: saleItemsSubTable }}
        />
      </Form>
    </>
  )
}

export default Sales
