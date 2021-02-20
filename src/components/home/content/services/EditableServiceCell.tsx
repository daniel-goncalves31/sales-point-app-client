import { ServiceModel } from '../../../../models/ServiceModel'
import { Input, Form } from 'antd'
import React from 'react'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType: 'number' | 'text'
  record: ServiceModel
  index: number
  children: React.ReactNode
}

const EditableServiceCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {

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
          {<Input />}
        </Form.Item>
      ) : (
          children
        )}
    </td>
  )
}

export default EditableServiceCell
