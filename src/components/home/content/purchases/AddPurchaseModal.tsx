import React, { useState } from 'react'
import {
  Modal,
  Form,
  Space,
  Button,
  InputNumber,
  Select,
  Statistic,
  Typography,
  Spin
} from 'antd'
import { usePostApi } from '../../../../hooks/use-post-api'
import { usePurchaseContext } from '../../../../contexts/PurchaseContext'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useProductContext } from '../../../../contexts/ProductContext'
import { currencyToNumber } from '../../../../utils/currency-to-number'
import CurrencyInput from '../../../global/CurrencyInput'

interface Props {
  visible: boolean
  closeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const { Option } = Select
const { Title } = Typography

const AddPurchaseModal: React.FC<Props> = ({ visible, closeModal }) => {
  const { setPurchases } = usePurchaseContext()
  const { products, changeProductQuantity } = useProductContext()
  const [total, setTotal] = useState(0)
  const { isLoading, postApi } = usePostApi(
    '/purchase',
    'POST',
    'Dados inválidos',
    'Compra adicionada com sucesso'
  )

  const [form] = Form.useForm()

  const initialValues = { quantity: 1, productId: null, price: null }

  const handleOnFinish = async (values: any) => {
    if (!values.purchase_items.length) {
      return
    }
    const items = values.purchase_items.map((item: any) => ({
      ...item,
      price: currencyToNumber(item.price)
    }))

    const purchases = await postApi({ items })
    if (purchases) {
      changeProductQuantity(items, false)
      setPurchases(prev => [purchases, ...prev])
      closeModal(false)
    }
  }

  const changeTotal = () => {
    let total = 0
    const formValues = form.getFieldsValue().purchase_items
    formValues.forEach((row: any) => {
      if (row.price && row.quantity) {
        total += currencyToNumber(row.price) * row.quantity
      }
    })
    setTotal(total)
  }

  return (
    <Modal
      title='Adicionar Compra'
      visible={visible}
      onCancel={() => closeModal(false)}
      afterClose={() => form.resetFields()}
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      maskClosable={!isLoading}
      closable={!isLoading}
    >
      <Spin
        spinning={isLoading}
        tip='Adicionando venda...'
        size='large'
        delay={300}
      >
        <Form
          form={form}
          onFinish={handleOnFinish}
          autoComplete='off'
          validateTrigger='onSubmit'
          initialValues={{ purchase_items: [initialValues] }}
        >
          <Form.List name='purchase_items'>
            {(fields, { add, remove }) => (
              <div>
                {fields.map(field => (
                  <Space className='form-row' key={field.key}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'productId']}
                      fieldKey={[field.fieldKey, 'productId']}
                      rules={[{ required: true }]}
                    >
                      <Select
                        showSearch
                        disabled={isLoading}
                        style={{ width: '100%' }}
                        placeholder='Selecione um Produto'
                        onSelect={() => changeTotal()}
                        filterOption={(input, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {products.map(product => (
                          <Option value={product.id} key={product.id}>
                            {`${product.name} ${product.brand}`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'price']}
                      fieldKey={[field.fieldKey, 'price']}
                      rules={[{ required: true }]}
                    >
                      <CurrencyInput
                        placeholder='Preço de Custo'
                        readOnly={isLoading}
                        onChange={() => changeTotal()}
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      fieldKey={[field.fieldKey, 'quantity']}
                      rules={[{ required: true, message: '' }]}
                    >
                      <InputNumber
                        min={1}
                        readOnly={isLoading}
                        placeholder='Qtde'
                        onChange={() => changeTotal()}
                      />
                    </Form.Item>

                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name)
                        changeTotal()
                      }}
                    />
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    type='dashed'
                    onClick={() => {
                      add()
                      const values = form.getFieldsValue()
                      const lastIndex = values.purchase_items.length - 1
                      values.purchase_items[lastIndex] = initialValues
                      form.setFieldsValue(values)
                    }}
                    block
                  >
                    <PlusOutlined /> Add Item
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>

        <Space className='div-total'>
          <Title level={4}>Total: </Title>
          <Statistic
            value={total}
            prefix='R$ '
            decimalSeparator=','
            groupSeparator='.'
            precision={2}
          />
        </Space>
      </Spin>
    </Modal>
  )
}

export default React.memo(AddPurchaseModal)
