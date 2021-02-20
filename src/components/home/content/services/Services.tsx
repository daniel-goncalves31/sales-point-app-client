import './services.styles.css'

import {
  Button,
  Divider,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography
} from 'antd'
import { CloseOutlined, EditOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'

import AddServiceModal from './AddServiceModal'
import EditableServiceCell from './EditableServiceCell'
import { ServiceModel } from '../../../../models/ServiceModel'
import { log } from '../../../../utils/log'
import { useCurrentUserContext } from '../../../../contexts/CurrentUserContext'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useSaleContext } from '../../../../contexts/SaleContext'
import { useServiceContext } from '../../../../contexts/ServiceContext'

interface Props { }

const Services: React.FC<Props> = () => {
  const { services, isLoading, setServices } = useServiceContext()
  const { setSales } = useSaleContext()
  const [filtredServices, setFiltredServices] = useState<ServiceModel[]>([])
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const { isAuthorized } = useCurrentUserContext()
  const { postApi, isLoading: updatingService } = usePostApi(
    '/service',
    'PUT',
    'Dados inválidos',
    'Serviço atualizado com sucesso'
  )
  const { isLoading: deletingService, postApi: deleteServiceApi } = usePostApi(
    '/service',
    'DELETE',
    'Dados inválidos',
    'Serviço deletado com sucesso'
  )

  const authorized = isAuthorized(['Admin', 'Admin Master'])

  const handleOnDeleteService = async (service: ServiceModel) => {
    const serviceId = service.id
    const res = await deleteServiceApi({ id: serviceId })

    if (res) {
      setServices(prevServices => prevServices.filter(service => service.id !== serviceId))
      setSales(prevSales => prevSales.filter(sale => {
        const items = sale.items.filter(item => {
          if (item?.service?.id === serviceId) {
            return false
          }
          return true
        })
        if (items.length) {
          return {
            ...sale,
            items
          }
        }
        return false
      }))
    }
  }
  const isEditing = (row: ServiceModel) => row.id === editingKey

  const edit = (record: ServiceModel) => {
    form.setFieldsValue({
      ...record,
    })
    setEditingKey(record.id)
  }

  const cancel = () => {
    setEditingKey(0)
  }

  const save = async (key: React.Key) => {
    try {
      const updatedService = (await form.validateFields()) as ServiceModel
      const newData = [...filtredServices]
      const index = newData.findIndex(item => key === item.id)
      const prevService = newData[index]
      const res = await postApi({ ...updatedService, id: prevService.id })

      if (res) {
        newData.splice(index, 1, {
          ...prevService,
          ...updatedService
        })
        setFiltredServices(newData)
        setEditingKey(0)
      }
    } catch (error) {
      log(error, true)
    }
  }

  const columns = [
    {
      title: 'Serviço',
      dataIndex: 'name',
      key: 'name',
      showSorterTooltip: false,
      sorter: (a: ServiceModel, b: ServiceModel) => a.name.localeCompare(b.name)
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      showSorterTooltip: false,
      sorter: (a: ServiceModel, b: ServiceModel) =>
        a.brand.localeCompare(b.brand)
    },
    {
      title: '#',
      key: '#',
      showSorterTooltip: false,

      align: 'center',
      render: (_: any, record: ServiceModel) => {
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
              <Tooltip title='Editar Serviço'>
                <EditOutlined
                  disabled={editingKey !== 0}
                  onClick={() => edit(record)}
                />
              </Tooltip>
              {authorized && <Tooltip title='Excluir Serviço'>
                <Popconfirm
                  title='Tem certeza que deseja excluir este serviço?'
                  onConfirm={() => handleOnDeleteService(record)}
                  okText='Sim'
                  cancelText='Não'
                  placement='topRight'
                >
                  <CloseOutlined className='icon-delete-sale' />
                </Popconfirm>
              </Tooltip>}
            </Space>
          )
      }
    }
  ]

  const mergedColumns = columns.map(col => {
    if (col.title === '#') {
      return col
    }
    return {
      ...col,
      onCell: (record: ServiceModel) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  useEffect(() => {
    setFiltredServices(services)
  }, [services])

  const handleOnSearch = (val: string) => {
    const newData = services.filter(
      service =>
        service.name.toLowerCase().includes(val) ||
        service.brand.toLowerCase().includes(val)
    )

    setFiltredServices([...newData])
  }

  return (
    <>
      <AddServiceModal closeModal={setShowModal} visible={showModal} />
      <Typography.Title style={{ marginBottom: '0', display: 'inline-block' }}>
        Assistências Técnicas
      </Typography.Title>
      <Divider style={{ margin: '8px 0' }} />
      <Space align='center' style={{ marginBottom: '8px' }}>
        <Input.Search placeholder='Pesquise...' onSearch={handleOnSearch} />
        <Button type='primary' onClick={() => setShowModal(true)}>
          Adicionar Serviço
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          size='small'
          columns={mergedColumns as any}
          dataSource={filtredServices?.map((row: ServiceModel) => ({
            ...row,
            key: row.id,
          }))}
          components={{
            body: {
              cell: EditableServiceCell
            }
          }}
          loading={isLoading || updatingService || deletingService}
          pagination={{
            onChange: cancel
          }}
        />
      </Form>
    </>
  )
}

export default Services
