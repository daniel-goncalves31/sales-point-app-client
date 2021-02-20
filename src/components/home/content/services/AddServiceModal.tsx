import React from 'react'
import { Modal, Form, Input } from 'antd'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useServiceContext } from '../../../../contexts/ServiceContext'

interface Props {
  visible: boolean
  closeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const AddServiceModal: React.FC<Props> = ({ visible, closeModal }) => {
  const { setServices } = useServiceContext()
  const { isLoading, postApi } = usePostApi(
    '/service',
    'POST',
    'Dados inválidos',
    'Serviço Adicionado com sucesso'
  )
  const [form] = Form.useForm()

  const handleOnFinish = async (values: any) => {
    const data = await postApi(values)
    if (data) {
      setServices(prev => [...prev, data])
      closeModal(false)
    }
  }

  return (
    <Modal
      style={{ top: '20px' }}
      title='Adicionar Serviço'
      visible={visible}
      onCancel={() => closeModal(false)}
      afterClose={() => form.resetFields()}
      onOk={() => form.submit()}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleOnFinish}
      >
        <Form.Item
          label='Nome do Serviço'
          name='name'
          rules={[{ required: true }]}
        >
          <Input placeholder='Nome do Serviço' disabled={isLoading} />
        </Form.Item>

        <Form.Item label='Marca' name='brand' rules={[{ required: true }]}>
          <Input placeholder='Marca' disabled={isLoading} />
        </Form.Item>

      </Form>
    </Modal>
  )
}

export default AddServiceModal
