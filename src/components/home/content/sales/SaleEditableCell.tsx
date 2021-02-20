import { ProductModel } from '../../../../models/ProductModel'
import { Form, Select, DatePicker } from 'antd'
import React from 'react'
import { useUserListContext } from '../../../../contexts/UserListContext'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType: 'number' | 'text'
  record: ProductModel
  index: number
  children: React.ReactNode
}

const SaleEditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const { userList } = useUserListContext()

  const options = userList?.map(user => ({ value: user.id, label: user.name }))

  const inputNode =
    dataIndex === 'userName' ? (
      <Select options={options} />
    ) : (
      <DatePicker showTime format='DD/MM/YYYY HH:mm' />
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

export default SaleEditableCell
