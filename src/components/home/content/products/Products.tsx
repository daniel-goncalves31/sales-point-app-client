import './products.styles.less'

import {
  Button,
  Divider,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import { ProductModel, ProductStatus } from '../../../../models/ProductModel'
import React, { useEffect, useState } from 'react'

import AddProductModal from './AddProductModal'
import EditableCell from './EditableCell'
import { currencyToNumber } from '../../../../utils/currency-to-number'
import { log } from '../../../../utils/log'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import { usePurchaseContext } from '../../../../contexts/PurchaseContext'
import { useSaleContext } from '../../../../contexts/SaleContext'

interface Props { }

const Products: React.FC<Props> = () => {
  const { products, isLoading, setProducts } = useProductContext()

  const { setSales } = useSaleContext()
  const { setPurchases } = usePurchaseContext()
  const [filtredProducts, setFiltredProducts] = useState<ProductModel[]>([])
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const { postApi, isLoading: updatingProduct } = usePostApi(
    '/product',
    'PUT',
    'Dados inválidos',
    'Produto atualizado com sucesso'
  )
  const { isLoading: deletingProduct, postApi: deleteProductApi } = usePostApi(
    '/product',
    'DELETE',
    'Dados inválidos',
    'Produto deletado com sucesso'
  )

  const handleOnDeleteProduct = async (product: ProductModel) => {
    const productId = product.id
    const res = await deleteProductApi({ id: productId })

    if (res) {
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId))
      setSales(prevSales => prevSales.filter(sale => {
        const items = sale.items.filter(item => item.product?.id !== productId)
        if (items.length) {
          return {
            ...sale,
            items
          }
        }
        return false
      }))
      setPurchases(prevPurchases => prevPurchases.filter(purchase => {
        const items = purchase.items.filter(item => item.product.id !== productId)
        if (items.length) {
          return {
            ...purchase,
            items
          }
        }
        return false
      }))
    }
  }
  const isEditing = (row: ProductModel) => row.id === editingKey

  const edit = (record: ProductModel) => {
    form.setFieldsValue({
      ...record,
      price: parseFloat(record.price as any).toLocaleString('pt-BR')
    })
    setEditingKey(record.id)
  }

  const cancel = () => {
    setEditingKey(0)
  }

  const save = async (key: React.Key) => {
    try {
      const updatedProduct = (await form.validateFields()) as ProductModel
      updatedProduct.price = currencyToNumber(updatedProduct.price as any)
      updatedProduct.status = (updatedProduct as any).situation
      delete (updatedProduct as any).situation
      const newData = [...filtredProducts]
      const index = newData.findIndex(item => key === item.id)
      const prevProduct = newData[index]
      const res = await postApi({ ...updatedProduct, id: prevProduct.id })

      if (res) {
        newData.splice(index, 1, {
          ...prevProduct,
          ...updatedProduct
        })
        setFiltredProducts(newData)
        setEditingKey(0)
      }
    } catch (error) {
      log(error, true)
    }
  }

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      showSorterTooltip: false,
      sorter: (a: ProductModel, b: ProductModel) => a.name.localeCompare(b.name)
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      showSorterTooltip: false,
      sorter: (a: ProductModel, b: ProductModel) =>
        a.brand.localeCompare(b.brand)
    },
    {
      title: 'Preço de Venda',
      dataIndex: 'price',
      key: 'price',
      showSorterTooltip: false,
      sorter: (a: ProductModel, b: ProductModel) => a.price - b.price,
      render: (val: string) =>
        parseFloat(val).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      showSorterTooltip: false,
      sorter: (a: ProductModel, b: ProductModel) => a.quantity - b.quantity
    },
    {
      title: 'Quantidade Mínima',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      showSorterTooltip: false,
      sorter: (a: ProductModel, b: ProductModel) =>
        a.minQuantity - b.minQuantity
    },
    {
      title: 'Situação',
      dataIndex: 'situation',
      key: 'situation',
      showSorterTooltip: false,
      align: 'center',
      sorter: (a: ProductModel, b: ProductModel) =>
        (a as any).situation - (b as any).situation,
      defaultSortOrder: 'ascend',
      render: (val: ProductStatus) =>
        val === ProductStatus.ACTIVE ? (
          <Tag color='green'>ATIVO</Tag>
        ) : (
            <Tag color='volcano'>INATIVO</Tag>
          )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      showSorterTooltip: false,
      align: 'center',
      sorter: (a: ProductModel, b: ProductModel) =>
        (a as any).status - (b as any).status,
      defaultSortOrder: 'ascend',
      render: (val: number) =>
        val <= 0 ? (
          <Tag color='volcano'>Baixo Estoque</Tag>
        ) : (
            <Tag color='green'>OK</Tag>
          )
    },
    {
      title: '#',
      key: '#',
      showSorterTooltip: false,

      align: 'center',
      render: (_: any, record: ProductModel) => {
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
              <Tooltip title='Editar Produto'>
                <EditOutlined
                  disabled={editingKey !== 0}
                  onClick={() => edit(record)}
                />
              </Tooltip>
              <Tooltip title='Excluir Produto'>
                <Popconfirm
                  title='Tem certeza que deseja excluir este produto?'
                  onConfirm={() => handleOnDeleteProduct(record)}
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
    }
  ]

  const mergedColumns = columns.map(col => {
    if (col.title === 'Status' || col.title === '#') {
      return col
    }
    return {
      ...col,
      onCell: (record: ProductModel) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  useEffect(() => {
    setFiltredProducts(products)
  }, [products])

  const handleOnSearch = (val: string) => {
    const newData = products.filter(
      product =>
        product.name.toLowerCase().includes(val) ||
        product.brand.toLowerCase().includes(val)
    )

    setFiltredProducts([...newData])
  }

  return (
    <>
      <AddProductModal closeModal={setShowModal} visible={showModal} />
      <Typography.Title style={{ marginBottom: '0', display: 'inline-block' }}>
        Produtos á Cadastrar
      </Typography.Title>
      <Typography.Text> (Produtos á cadastrar pela primeira vez)</Typography.Text>
      <Divider style={{ margin: '8px 0' }} />
      <Space align='center' style={{ marginBottom: '8px' }}>
        <Input.Search placeholder='Pesquise...' onSearch={handleOnSearch} />
        <Button type='primary' onClick={() => setShowModal(true)}>
          Adicionar Produto
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          size='small'
          columns={mergedColumns as any}
          dataSource={filtredProducts?.map((row: ProductModel) => ({
            ...row,
            key: row.id,
            status: row.quantity - row.minQuantity,
            situation: row.status
          }))}
          components={{
            body: {
              cell: EditableCell
            }
          }}
          loading={isLoading || updatingProduct || deletingProduct}
          pagination={{
            onChange: cancel
          }}
        />
      </Form>
    </>
  )
}

export default Products
