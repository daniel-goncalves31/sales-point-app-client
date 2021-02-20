import { Form, Input, InputNumber, Select } from 'antd'
import { ProductModel, ProductStatus } from '../../../../models/ProductModel'

import CurrencyInput from '../../../global/CurrencyInput'
import React from 'react'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType: 'number' | 'text'
  record: ProductModel
  index: number
  children: React.ReactNode
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    dataIndex === 'price' ? (
      <CurrencyInput />
    ) : dataIndex === 'quantity' || dataIndex === 'minQuantity' ? (
      <InputNumber min={0} />
    ) : dataIndex === 'situation' ? <Select options={[{ value: ProductStatus.ACTIVE, label: 'ATIVO' }, { value: ProductStatus.INACTIVE, label: 'INATIVO' }]} /> : (
      <Input />
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

export default EditableCell
