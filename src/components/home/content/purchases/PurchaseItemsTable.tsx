import { Form, Popconfirm, Space, Table, Tooltip } from 'antd'
import React, { useState } from 'react'

import { ColumnsType } from 'antd/lib/table'
import { EditOutlined } from '@ant-design/icons'
import { ProductModel } from '../../../../models/ProductModel'
import PurchaseItemEditableCell from './PurchaseItemEditableCell'
import { PurchaseItemModel } from '../../../../models/PurchaseItemModel'
import { PurchaseModel } from '../../../../models/PurchaseModel'
import { currencyToNumber } from '../../../../utils/currency-to-number'
import { log } from '../../../../utils/log'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import { usePurchaseContext } from '../../../../contexts/PurchaseContext'

interface Props {
  purchase: PurchaseModel
}

export const PurchaseItemSubTable: React.FC<Props> = ({ purchase }) => {
  const { setPurchases } = usePurchaseContext()
  const { products, setProducts } = useProductContext()
  const [editingKey, setEditingKey] = useState(0)
  const [updateItemForm] = Form.useForm()

  const { isLoading, postApi } = usePostApi(
    '/purchase-item',
    'PUT',
    'Dados inválidos',
    'Item atualizado com sucesso'
  )

  const isEditing = (row: PurchaseItemModel) => row.id === editingKey

  const edit = (record: PurchaseItemModel) => {

    updateItemForm.setFieldsValue({
      productName: record.product.id,
      price: parseFloat(record.price as any).toLocaleString('pt-br'),
      quantity: record.quantity
    })
    setEditingKey(record.id)
  }

  const cancel = () => {
    setEditingKey(0)
  }

  const save = async (key: React.Key) => {
    try {
      const updatedPurchaseItem = await updateItemForm.validateFields()
      const newData = [...purchase.items]
      const index = newData.findIndex(item => key === item.id)
      const prevPurchaseItem = newData[index]

      const req = {
        productId: updatedPurchaseItem.productName,
        id: prevPurchaseItem.id,
        quantity: updatedPurchaseItem.quantity,
        price: currencyToNumber(updatedPurchaseItem.price)
      }

      const res = await postApi(req)

      let newProduct: ProductModel = {} as any

      const newProducts = products.map(product => {
        if (product.id === req.productId) {
          newProduct = product
          product.quantity += req.quantity
        }

        if (product.id === prevPurchaseItem.product.id) {
          product.quantity -= prevPurchaseItem.quantity
        }

        return product
      })

      setProducts([...newProducts])

      if (res) {
        newData.splice(index, 1, {
          ...prevPurchaseItem,
          ...req,
          product: {
            id: newProduct!.id,
            name: newProduct!.name,
            brand: newProduct!.brand
          }
        })

        purchase.items = newData

        setPurchases(prevPurchases => {
          const data = prevPurchases
          const index = data.findIndex(p => p.id === purchase.id)
          data.splice(index, 1, purchase)

          return [...data]
        })
        setEditingKey(0)
      }
    } catch (error) {
      log(error, true)
    }
  }


  const columns: ColumnsType<any> = [
    {
      title: 'Produto',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price * 1 - b.price * 1,
      render: (value: any) =>
        (value * 1).toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        })
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: any, b: any) => a.quantity - b.quantity
    },
    {
      title: 'SubTotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      sorter: (a: any, b: any) => a.subtotal - b.subtotal,
      render: (value: any) =>
        value.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        })
    },
    {
      title: '#',
      key: '#',
      render: (_: any, record: PurchaseItemModel) => {
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
            <Tooltip title='Editar Item'>
              <EditOutlined
                disabled={editingKey !== 0}
                onClick={() => edit(record)}
              />
            </Tooltip>
          )
      }
    }
  ]

  const mergedColumns = columns.map(col => {
    if (col.title === 'Marca' || col.title === '#' || col.title === 'SubTotal') {
      return col
    }
    return {
      ...col,
      onCell: (record: PurchaseItemModel) => ({
        record,
        dataIndex: (col as any).dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  return (
    <Form form={updateItemForm} component={false}>
      <Table
        loading={isLoading}
        columns={mergedColumns as any}
        dataSource={purchase.items?.map(item => ({
          ...item,
          key: item.id,
          brand: item.product.brand,
          productName: item.product.name,
          subtotal: item.quantity * item.price
        }))}
        components={{
          body: {
            cell: PurchaseItemEditableCell
          }
        }}
        pagination={false}
      />
    </Form>
  )
}
