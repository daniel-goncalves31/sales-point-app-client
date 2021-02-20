import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Tooltip,
  Typography
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

import CurrencyInput from '../../../global/CurrencyInput'
import { ProductStatus } from '../../../../models/ProductModel'
import React from 'react'
import { currencyToNumber } from '../../../../utils/currency-to-number'
import { useCurrentUserContext } from '../../../../contexts/CurrentUserContext'
import { useDialogContext } from '../../../../contexts/DialogContext'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useProductContext } from '../../../../contexts/ProductContext'
import { useSaleContext } from '../../../../contexts/SaleContext'
import { useServiceContext } from '../../../../contexts/ServiceContext'
import { useUserListContext } from '../../../../contexts/UserListContext'

interface Props {
  visible: boolean
  closeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const { Option } = Select

const AddSaleModal: React.FC<Props> = ({ visible, closeModal }) => {
  const { userList } = useUserListContext()
  const { currentUser } = useCurrentUserContext()
  const { setSales } = useSaleContext()
  const { products, changeProductQuantity } = useProductContext()
  const { services } = useServiceContext()
  const { showError } = useDialogContext()
  const { isLoading, postApi } = usePostApi(
    '/sale',
    'POST',
    'Dados inválidos',
    'Venda Adicionada com sucesso'
  )

  const [form] = Form.useForm()

  const initialValues = {
    quantity: 1,
    price: null,
    isService: false,
    productId: null
  }

  const handleOnFinish = async (values: any) => {
    if (!values.sale_items.length) {
      return
    }

    const items = values.sale_items.map((item: any) => {
      if (item.isService) {
        delete item.productId
        item.price = currencyToNumber(item.price)
        item.purchasePrice = currencyToNumber(item.purchasePrice)
      }
      delete item.isService
      return item
    })

    const userId = values.userId
    const total = currencyToNumber(values.total)

    const value1 = currencyToNumber(values.value_with_taxes_1)
    const value2 = currencyToNumber(values.value_with_taxes_2)

    if (value1 + value2 > total) {
      showError(
        'A soma dos valores divididos nos cartões está maior do que o valor total. Por favor corrija para continuar!'
      )
      return
    }

    const sales = await postApi({ items, total, userId, paymentType: 1 })
    if (sales) {
      changeProductQuantity(values.sale_items, true)
      setSales(prev => [sales, ...prev])
      closeModal(false)
    }
  }

  function onFormPaymentClear(formPaymentNum: string) {
    const formValues = form.getFieldsValue()

    formValues[`value_${formPaymentNum}`] = ''
    formValues[`value_with_taxes_${formPaymentNum}`] = ''

    form.setFieldsValue(formValues)
    changeTotal()
  }

  const changeTotal = (useTheTotal: boolean = false) => {
    const formValues = form.getFieldsValue()
    formValues.sale_items = formValues.sale_items.filter(
      (item: any) => item.productId !== undefined
    )

    let total = 0

    formValues.sale_items.forEach((row: any) => {
      if (row.isService && row.price) {
        total += currencyToNumber(row.price)
      } else if (row.price && row.quantity) {
        total += row.price * row.quantity
      }
    })
    const discount = formValues.discount
      ? currencyToNumber(formValues.discount) / 100
      : 0
    total -= total * discount

    total = useTheTotal ? currencyToNumber(formValues.total) : total

    // The 0 index is the debit card
    const machineCardTaxes1 = [1.99, 3.49, 7.47, 9.46, 11.45, 13.44, 15.43]
    const machineCardTaxes2 = [4, 7.5, 9, 12, 13, 16, 19]

    const taxas =
      formValues.machine_card === 0 ? machineCardTaxes1 : machineCardTaxes2

    // Payment method 1
    const paymentForm1 = formValues.form_payment_1
    let value1 = currencyToNumber(formValues.value_1)
    let taxes1 = 0
    if (paymentForm1) {
      // Débito
      if (paymentForm1 === 10) {
        if (formValues.entire_value_1) {
          taxes1 = (value1 / (100 - taxas[0])) * 100 - value1
        } else {
          taxes1 -= (value1 * taxas[0]) / 100
        }
      } else {
        if (formValues.entire_value_1) {
          taxes1 = (value1 / (100 - taxas[paymentForm1])) * 100 - value1
        } else {
          taxes1 -= (value1 * taxas[paymentForm1]) / 100
        }
      }
      total += taxes1

      formValues.value_with_taxes_1 = (value1 + taxes1).toLocaleString(
        'pt-br',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )
    } else {
      formValues.value_1 = ''
      formValues.value_with_taxes_1 = ''
      value1 = 0
    }

    // Payment method 2
    const paymentForm2 = formValues.form_payment_2
    let value2 = currencyToNumber(formValues.value_2)
    let taxes2 = 0

    if (paymentForm2) {
      if (value2) {
        // Débito
        if (paymentForm2 === 10) {
          if (formValues.entire_value_2) {
            taxes2 = (value2 / (100 - taxas[0])) * 100 - value2
          } else {
            taxes2 -= (value2 * taxas[0]) / 100
          }
        } else {
          if (formValues.entire_value_2) {
            taxes2 = (value2 / (100 - taxas[paymentForm2])) * 100 - value2
          } else {
            taxes2 -= (value2 * taxas[paymentForm2]) / 100
          }
        }
        total += taxes2

        formValues.value_with_taxes_2 = (value2 + taxes2).toLocaleString(
          'pt-br',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )
      }
    } else {
      formValues.value_2 = ''
      formValues.value_with_taxes_2 = ''
      value2 = 0
    }

    formValues.money_value = (
      total -
      (value1 + value2 + taxes1 + taxes2)
    ).toLocaleString('pt-br', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    formValues.total = total.toLocaleString('pt-br', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    form.setFieldsValue(formValues)
  }

  function setValueToCardOne() {
    const formValues = form.getFieldsValue()

    let total = 0

    formValues.sale_items.forEach((row: any) => {
      if (row.isService && row.price) {
        total += currencyToNumber(row.price)
      } else if (row.price && row.quantity) {
        total += row.price * row.quantity
      }
    })
    formValues['value_1'] = total
    form.setFieldsValue(formValues)
  }

  const paymentOptions = [
    {
      value: 10,
      label: 'Cartão de Débito'
    },
    {
      value: 1,
      label: 'Cartão de Crédito X1'
    },
    {
      value: 2,
      label: 'Cartão de Crédito X2'
    },
    {
      value: 3,
      label: 'Cartão de Crédito X3'
    },
    {
      value: 4,
      label: 'Cartão de Crédito X4'
    },
    {
      value: 5,
      label: 'Cartão de Crédito X5'
    },
    {
      value: 6,
      label: 'Cartão de Crédito X6'
    }
  ]

  return (
    <Modal
      title="Adicionar Venda"
      visible={visible}
      onCancel={() => closeModal(false)}
      afterClose={() => form.resetFields()}
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      maskClosable={!isLoading}
      closable={!isLoading}
      width="640px"
    >
      <Spin
        spinning={isLoading}
        tip="Adicionando venda..."
        size="large"
        delay={300}
      >
        <Form
          form={form}
          onFinish={handleOnFinish}
          autoComplete="off"
          validateTrigger="onSubmit"
          initialValues={{
            sale_items: [initialValues],
            total: '0,00',
            userId: currentUser?.id,
            machine_card: 0
          }}
        >
          <Form.List name="sale_items">
            {(fields, { add, remove }) => (
              <div>
                {fields.map(field => {
                  const formValues = form.getFieldsValue()
                  const isService = formValues?.sale_items
                    ? formValues?.sale_items[field.name].isService
                    : false
                  return (
                    <Space className="form-row" key={field.key}>
                      {isService ? (
                        <>
                          <Form.Item
                            {...field}
                            name={[field.name, 'serviceId']}
                            fieldKey={[field.fieldKey, 'serviceId']}
                            rules={[{ required: true }]}
                          >
                            <Select
                              showSearch
                              disabled={isLoading}
                              style={{ width: '100%' }}
                              placeholder="Selecione um Serviço"
                              filterOption={(input, option) =>
                                (option as any).children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {services.map(service => (
                                <Option value={service.id} key={service.id}>
                                  {`${service.name} ${service.brand}`}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'price']}
                            fieldKey={[field.fieldKey, 'price']}
                            rules={[{ required: true, message: '' }]}
                          >
                            <CurrencyInput
                              placeholder="Preço de Venda"
                              onKeyUp={() => changeTotal()}
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'purchasePrice']}
                            fieldKey={[field.fieldKey, 'purchasePrice']}
                            rules={[{ required: true, message: '' }]}
                          >
                            <CurrencyInput placeholder="Preço de Compra" />
                          </Form.Item>
                        </>
                      ) : (
                          <>
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
                                placeholder="Selecione um Produto"
                                filterOption={(input, option) =>
                                  (option as any).children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                onSelect={val => {
                                  const product = products.find(
                                    product => product.id === val
                                  )
                                  const values = form.getFieldsValue()
                                  values.sale_items[field.name].price =
                                    product?.price
                                  form.setFieldsValue(values)
                                  changeTotal()
                                }}
                              >
                                {products
                                  .filter(
                                    product =>
                                      product.status !== ProductStatus.INACTIVE
                                  )
                                  .map(product => (
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
                              rules={[{ required: false, message: '' }]}
                            >
                              <Input placeholder="Preço de Venda" readOnly />
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
                                placeholder="Qtde"
                                onChange={() => changeTotal()}
                              />
                            </Form.Item>
                          </>
                        )}

                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name)
                          changeTotal()
                        }}
                      />
                    </Space>
                  )
                })}
                <Form.Item style={{ display: 'inline-block', width: '50%' }}>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    type="dashed"
                    onClick={() => {
                      add()
                      const values = form.getFieldsValue()
                      const lastIndex = values.sale_items.length - 1
                      values.sale_items[lastIndex] = { ...initialValues }
                      form.setFieldsValue(values)
                    }}
                    block
                  >
                    <PlusOutlined /> Add Produto
                  </Button>
                </Form.Item>
                <Form.Item style={{ display: 'inline-block', width: '50%' }}>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    type="dashed"
                    onClick={() => {
                      add()
                      const values = form.getFieldsValue()
                      const lastIndex = values.sale_items.length - 1
                      values.sale_items[lastIndex] = {
                        ...initialValues,
                        serviceId: null,
                        isService: true
                      }
                      form.setFieldsValue(values)
                    }}
                    block
                  >
                    <PlusOutlined /> Add Serviço
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>

          <div className="div-row">
            <Form.Item name="form_payment_1" fieldKey="form_payment_1">
              <Select
                allowClear
                disabled={isLoading}
                style={{ width: '200px' }}
                placeholder="Forma de Pagamento 1"
                onClear={() => {
                  onFormPaymentClear('1')
                }}
                onSelect={() => {
                  setValueToCardOne()
                  changeTotal()
                }}
                options={paymentOptions}
              />
            </Form.Item>
            <Form.Item name="value_1" fieldKey="value_1">
              <CurrencyInput
                className="currency-input"
                readOnly={isLoading}
                placeholder="Valor 1"
                onKeyUp={() => changeTotal()}
              />
            </Form.Item>
            <Form.Item name="value_with_taxes_1" fieldKey="value_with_taxes_1">
              <CurrencyInput
                className="currency-input"
                readOnly={true}
                placeholder="Valor com juros 1"
                onKeyUp={() => changeTotal()}
              />
            </Form.Item>
            <Tooltip title={'Receber o valor inteiro da venda?'}>
              <Form.Item
                name="entire_value_1"
                fieldKey="entire_value_1"
                valuePropName="checked"
              >
                <Switch
                  style={{ width: '60px' }}
                  disabled={isLoading}
                  onChange={() => changeTotal()}
                  checkedChildren="Sim"
                  unCheckedChildren="Não"
                />
              </Form.Item>
            </Tooltip>
          </div>

          <div className="div-row">
            <Form.Item name="form_payment_2" fieldKey="form_payment_2">
              <Select
                allowClear
                disabled={isLoading}
                style={{ width: '200px' }}
                placeholder="Forma de Pagamento 2"
                onClear={() => {
                  onFormPaymentClear('2')
                }}
                onSelect={() => {
                  changeTotal()
                }}
                options={paymentOptions}
              />
            </Form.Item>
            <Form.Item name="value_2" fieldKey="value_2">
              <CurrencyInput
                className="currency-input"
                readOnly={isLoading}
                placeholder="Valor 2"
                onKeyUp={() => changeTotal()}
              />
            </Form.Item>
            <Form.Item name="value_with_taxes_2" fieldKey="value_with_taxes_2">
              <CurrencyInput
                className="currency-input"
                readOnly={true}
                placeholder="Valor com juros 2"
                onKeyUp={() => changeTotal()}
              />
            </Form.Item>
            <Tooltip title={'Receber o valor inteiro da venda?'}>
              <Form.Item
                name="entire_value_2"
                fieldKey="entire_value_2"
                valuePropName="checked"
              >
                <Switch
                  style={{ width: '60px' }}
                  disabled={isLoading}
                  onChange={() => changeTotal()}
                  checkedChildren="Sim"
                  unCheckedChildren="Não"
                />
              </Form.Item>
            </Tooltip>
          </div>

          <div
            className="div-row"
            style={{ justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <Typography.Title level={5} style={{ marginRight: '4px' }}>
              Dinheiro:{' '}
            </Typography.Title>

            <Form.Item name="money_value" fieldKey="money_value">
              <CurrencyInput
                readOnly={true}
                placeholder="Valor Dinheiro"
                onKeyUp={() => changeTotal()}
              />
            </Form.Item>
          </div>

          <div className="div-row">
            <Form.Item name="userId" fieldKey="userId">
              <Select
                style={{ width: '200px' }}
                showSearch
                disabled={isLoading}
                filterOption={(input, option) =>
                  (option as any).children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {userList?.map(user => (
                  <Option value={user.id} key={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="machine_card" fieldKey="machine_card">
              <Select
                disabled={isLoading}
                style={{ width: '200px' }}
                placeholder="Máquina de Cartão"
                onSelect={() => {
                  changeTotal()
                }}
                options={[
                  { value: 0, label: 'Máquina de Cartão 1' },
                  { value: 1, label: 'Máquina de Cartão 2' }
                ]}
              />
            </Form.Item>

            <div>
              <Form.Item name="discount" fieldKey="discount">
                <CurrencyInput
                  style={{ width: '140px' }}
                  min={0}
                  readOnly={isLoading}
                  placeholder="Desconto"
                  onKeyUp={() => changeTotal()}
                />
              </Form.Item>
              <Typography.Title level={4} style={{ paddingLeft: '8px' }}>
                {' '}
                %
              </Typography.Title>
            </div>
          </div>

          <div className="div-row" style={{ justifyContent: 'flex-end' }}>
            <Typography.Title level={4}>Total: R$ </Typography.Title>
            <Form.Item name="total" fieldKey="total">
              <CurrencyInput
                className="total-input"
                min={0}
                readOnly={isLoading}
                placeholder="Total"
              />
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </Modal>
  )
}

export default AddSaleModal
