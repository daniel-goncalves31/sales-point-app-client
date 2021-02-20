import React from 'react'
import { Modal, Form, Input, InputNumber } from 'antd'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import CurrencyInput from '../../../global/CurrencyInput'
import { currencyToNumber } from '../../../../utils/currency-to-number'
import { usePurchaseContext } from '../../../../contexts/PurchaseContext'

interface Props {
  visible: boolean
  closeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const AddProductModal: React.FC<Props> = ({ visible, closeModal }) => {
  const { setProducts } = useProductContext()
  const { setPurchases } = usePurchaseContext()
  const { isLoading, postApi } = usePostApi(
    '/product',
    'POST',
    'Dados inválidos',
    'Produto Adicionado com sucesso'
  )
  const [form] = Form.useForm()

  const handleOnFinish = async (values: any) => {
    values.price = currencyToNumber(values.price)
    values.purchasePrice = currencyToNumber(values.purchasePrice)
    const { purchasePrice, ...product } = values
    const data = await postApi({ product, purchasePrice })
    if (data) {
      setProducts(prev => [...prev, data.product])
      setPurchases(prev => [...prev, data.purchase])
      closeModal(false)
    }
  }

  return (
    <Modal
      style={{ top: '20px' }}
      title='Adicionar Produto'
      visible={visible}
      onCancel={() => closeModal(false)}
      afterClose={() => form.resetFields()}
      onOk={() => form.submit()}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleOnFinish}
        initialValues={{ minQuantity: 2 }}
      >
        <Form.Item
          label='Nome do Produto'
          name='name'
          rules={[{ required: true }]}
        >
          <Input placeholder='Nome do Produto' disabled={isLoading} />
        </Form.Item>

        <Form.Item label='Marca' name='brand' rules={[{ required: true }]}>
          <Input placeholder='Marca' disabled={isLoading} />
        </Form.Item>

        <Form.Item
          label='Preço de Venda'
          name='price'
          rules={[{ required: true }]}
        >
          <CurrencyInput placeholder='Preço de Venda' disabled={isLoading} />
        </Form.Item>
        <Form.Item
          label='Preço de Custo'
          name='purchasePrice'
          rules={[{ required: true }]}
        >
          <CurrencyInput placeholder='Preço de Custo' disabled={isLoading} />
        </Form.Item>

        <Form.Item
          label='Quantidade Total de Produtos'
          name='quantity'
          rules={[{ required: true }]}
        >
          <InputNumber
            placeholder='Quantidade Total de Produtos'
            type='number'
            min={1}
            disabled={isLoading}
          />
        </Form.Item>

        <Form.Item
          label='Quantidade Mínima'
          name='minQuantity'
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (parseInt(value) > parseInt(getFieldValue('quantity'))) {
                  return Promise.reject(
                    'Quantitdade mínima não pode ser maior do que a quantidade'
                  )
                }
                return Promise.resolve()
              }
            })
          ]}
        >
          <InputNumber
            min={0}
            placeholder='Quantidade Mínima'
            type='number'
            disabled={isLoading}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddProductModal
