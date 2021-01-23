import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Button, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
import api from 'datas/api'

import { ServerData } from 'types/dbtypes'
import { GetServerSideProps, NextPage } from 'next'
import Cookies from 'universal-cookie'
import Layout from 'components/Layout'
import DashboardLayout from 'components/DashboardLayout'
import useSWR from 'swr'
import urljoin from 'url-join'

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
  event: React.ReactNode
  task: React.ReactNode
}

const TaskListCard: React.FC<TaskListCardProps> = ({ event, task, onCheckChange, checked }) => {
  return (
    <tr>
      <td className="align-middle text-center">
        <Form.Check
          id={`warn-check-${event}`}
          type="checkbox"
          custom
        />
      </td>
      <td className="align-middle d-none d-md-table-cell">
        <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer">
          {event}
        </span>
      </td>
      <td className="align-middle d-none d-md-table-cell">
        <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer">
          {task}
        </span>
      </td>
    </tr>
  )
}

const AutoTasking: NextPage<AutoTaskingRouterProps> = ({ guildId }) => {
  const [useLevelupMessage, setUseLevelupMessage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

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
                          <TaskListCard
                            event={<>
                              <span className="font-weight-bold">
                                <u>메시지</u>
                              </span>
                              {" "}에 반응이 추가되었을 때
                            </>}
                            task={<>
                              <span className="font-weight-bold" style={{ color: "limegreen" }}>
                                @USER
                              </span>
                              {" "}역할 추가하기 외 2개
                            </>}
                          />
                        </tbody>
                      </Table>
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