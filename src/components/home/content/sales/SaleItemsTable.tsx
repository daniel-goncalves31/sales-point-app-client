import React from 'react'
import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { SaleModel } from '../../../../models/SaleModel'

export const saleItemsSubTable = (sales: SaleModel) => {
  const columns: ColumnsType<any> = [
    {
      title: 'Produto',
      dataIndex: 'productName',
      key: 'productName',
      showSorterTooltip: false,
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      showSorterTooltip: false,
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName)
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      showSorterTooltip: false,
      sorter: (a: any, b: any) => a.price - b.price,
      render: (value: any) =>
        parseFloat(value as any).toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        })
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      showSorterTooltip: false,
      sorter: (a: any, b: any) => a.quantity - b.quantity
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={sales.items?.map(item => ({
        ...item,
        key: item.id,
        brand: item.product?.brand || item.service?.brand,
        productName: item.product?.name || item.service?.name
      }))}
      pagination={false}
    />
  )
}
