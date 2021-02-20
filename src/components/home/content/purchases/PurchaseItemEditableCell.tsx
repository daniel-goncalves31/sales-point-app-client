import { ProductModel } from '../../../../models/ProductModel'
import { Form, Select, InputNumber } from 'antd'
import React from 'react'
import { useProductContext } from '../../../../contexts/ProductContext'
import CurrencyInput from '../../../global/CurrencyInput'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  record: ProductModel
  index: number
  children: React.ReactNode
}

const PurchaseItemEditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  const { products } = useProductContext()

  const inputNode =
    dataIndex === 'productName' ? (
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder='Selecione um Produto'
        filterOption={(input, option: any) =>
          option.children
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        }
      >
        {products.map(product => (
          <Select.Option value={product.id} key={product.id}>
            {`${product.name} ${product.brand}`}
          </Select.Option>
        ))}
      </Select>
    ) : (dataIndex === 'price' ? (<CurrencyInput style={{ width: '90px' }} />) :
      (<InputNumber min={0} style={{ width: '90px' }} />)
      )

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: 'Campo Obrigatório'
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
          children
        )}
    </td>
  )
}

export default PurchaseItemEditableCell
