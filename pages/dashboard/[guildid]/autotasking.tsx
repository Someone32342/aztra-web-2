import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons'
import api from 'datas/api'

import { GetServerSideProps, NextPage } from 'next'
import Cookies from 'universal-cookie'
import Layout from 'components/Layout'
import DashboardLayout from 'components/DashboardLayout'
import useSWR from 'swr'
import urljoin from 'url-join'
import { TaskSet } from 'types/AutoTasking'
import { MemberMinimal, Role } from 'types/DiscordTypes'

interface AutoTaskingRouterProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<AutoTaskingRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

interface TaskListCardProps {
  onCheckChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
  checked?: boolean
  taskset: TaskSet
}

const AutoTasking: NextPage<AutoTaskingRouterProps> = ({ guildId }) => {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { data } = useSWR<TaskSet[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/autotasking`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
  )

  const { data: roles } = useSWR<Role[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/roles`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const TaskListCard: React.FC<TaskListCardProps> = ({ taskset, onCheckChange, checked }) => {
    let eventName = `(알 수 없는 이벤트: ${taskset.event})`

    switch (taskset.event) {
      case 'reaction_add':
        eventName = "메시지에 반응이 추가되었을 때"
        break
    }

    return (
      <tr>
        <td className="align-middle text-center">
          <Form.Check
            id={`taskset-check-${taskset.uuid}`}
            type="checkbox"
            custom
          />
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer font-weight-bold">
            {eventName}
          </span>
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <div className="mw-100 align-middle cursor-pointer font-weight-bold">
            {
              taskset.task.map(o => {
                switch (o.taskcode) {
                  case 'add_roles':
                    return <div>
                      <span></span>
                      - {o.data.members.map((id: string) => members?.find(o => o.user.id === id)?.user.username).join(', ')} 멤버로부터 {o.data.roles.join(', ')} 역할 추가하기
                    </div>
                  case 'remove_roles':
                    return <div>- {o.data.members.map((id: string) => members?.find(o => o.user.id === id)?.user.username).join(', ')} 멤버로부터 {o.data.roles.join(', ')} 역할 제거하기</div>
                  default:
                    return <div>- (알 수 없는 작업: {o.taskcode})</div>
                }
              })
            }
          </div>
        </td>
      </tr>
    )
  }

  return (
    <Layout>
      <DashboardLayout guildId={guildId}>
        {
          () => (
            <div>
              <Row className="dashboard-section">
                <div>
                  <h3>자동 작업 설정</h3>
                  <div className="py-2">
                    어떤 동작이 발생했을 때, 또는 주기적으로 여러가지 작업을 자동으로 수행할 수 있습니다.
                  </div>
                </div>
              </Row>
              <Row>
                <Col>
                  <Form noValidate>
                    <Row className="flex-column">
                      <Table id="warn-list-table" variant="dark" style={{
                        tableLayout: 'fixed'
                      }} >
                        <thead>
                          <tr>
                            <th className="align-middle text-center" style={{ width: 50 }}>
                              <Form.Check
                                id="warn-select-all"
                                custom
                                type="checkbox"
                              />
                            </th>
                            <th className="text-center text-md-left" style={{ width: '20%' }}>이벤트</th>
                            <th className="text-center text-md-left d-none d-md-table-cell">수행할 작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.map(one => <TaskListCard taskset={one} />)}
                        </tbody>
                      </Table>
                    </Row>

                    <Row className="justify-content-end">
                      <Button variant="aztra" size="sm" className="d-flex align-items-center mr-3">
                        <AddIcon className="mr-1" />
                        새로 추가
                      </Button>
                      <Button variant="danger" size="sm" className="d-flex align-items-center">
                        <DeleteIcon className="mr-1" />
                        선택 항목 삭제
                      </Button>
                    </Row>

                    <Row className="mt-4">
                      <Button
                        variant={saveError ? "danger" : "aztra"}
                        style={{
                          minWidth: 140
                        }}
                      >
                        {
                          saving
                            ? <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="pl-2">저장 중...</span>
                            </>
                            : <span>저장하기</span>
                        }
                      </Button>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </div>
          )
        }
      </DashboardLayout>
    </Layout>
  )
}

export default AutoTasking