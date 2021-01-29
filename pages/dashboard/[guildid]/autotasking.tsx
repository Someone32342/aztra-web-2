import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Button, ButtonGroup, Card, Col, Form, OverlayTrigger, Row, Spinner, Table, Tooltip } from 'react-bootstrap'
import { Add as AddIcon, Delete as DeleteIcon, RemoveCircleOutline, OpenInNew as OpenInNewIcon, Close as CloseIcon, Check as CheckIcon } from '@material-ui/icons'
import Twemoji from 'react-twemoji'
import api from 'datas/api'

import { GetServerSideProps, NextPage } from 'next'
import Cookies from 'universal-cookie'
import Layout from 'components/Layout'
import DashboardLayout from 'components/DashboardLayout'
import useSWR from 'swr'
import urljoin from 'url-join'
import { MemberMinimal, Role } from 'types/DiscordTypes'
import Head from 'next/head'
import { TaskSet } from 'types/autotask'
import { EmojiRoleData } from 'types/autotask/action_data'
import EmojiRole from 'components/autotasking/EmojiRole'

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
  const [addNew, setAddNew] = useState(false)
  const [taskType, setTaskType] = useState<string | number>(0)
  
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
    let eventName = `(알 수 없는 동작: ${taskset.type})`

    let taskContent: React.ReactNode

    switch (taskset.type) {
      case 'emoji_role':
        eventName = "반응했을 때 역할 추가/제거"
        let taskdata: EmojiRoleData[] = taskset.data
        taskContent = taskdata.map(o => (
          <>
            <div>{o.emoji} 로 반응했을 때:</div>
            {o.add && <div className="pl-3">- 역할 추가: {o.add.map(r => roles?.find(p => p.id === r)?.name).join(', ')}</div>}
            {o.remove && <div className="pl-3">- 역할 제거: {o.remove.map(r => roles?.find(p => p.id === r)?.name).join(', ')}</div>}
          </>
        ))
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
            <Twemoji options={{ className: "Twemoji" }}>
              {taskContent}
            </Twemoji>
          </div>
        </td>
        <td className="align-middle text-center">
          <ButtonGroup>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="warn-list-row-remove-warn">
                  이 작업 제거하기
                </Tooltip>
              }
            >
              <Button variant="dark" className="d-flex px-1 remove-before">
                <RemoveCircleOutline />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="warn-list-row-remove-warn">
                  작업 자세히 보기
                </Tooltip>
              }
            >
              <Button variant="dark" className="d-flex px-1 remove-before">
                <OpenInNewIcon />
              </Button>
            </OverlayTrigger>

          </ButtonGroup>
        </td>
      </tr>
    )
  }

  return (
    <>
      <Head>
        <title>자동 작업 설정 - Aztra 대시보드</title>
      </Head>
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
                      {
                        addNew &&
                        <Row className="mb-5">
                          <Col className="p-0">
                            <Card bg="dark" className="m-0 shadow">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span className="font-weight-bold" style={{ fontFamily: "NanumSquare", fontSize: 18 }}>새 작업 추가</span>
                                <Button variant="danger" size="sm" className="d-flex align-items-center" onClick={() => setAddNew(false)}><CloseIcon fontSize="small" /></Button>
                              </Card.Header>
                              <Card.Body>
                                <Form>
                                  <Form.Group className="d-flex">
                                    <Row className="align-items-center">
                                      <Form.Label column sm="auto">작업 유형 선택</Form.Label>
                                      <Col>
                                        <Form.Control className="shadow-sm" style={{ fontSize: 15 }} as="select" value={taskType} onChange={e => setTaskType(e.target.value)}>
                                          <option value={0}>유형 선택</option>
                                          <option value="emoji_role">반응했을 때 역할 추가/제거</option>
                                        </Form.Control>
                                      </Col>
                                    </Row>
                                  </Form.Group>
                                  {
                                    !!taskType &&
                                    <Form.Group className="mb-0">
                                      {taskType === "emoji_role" && <EmojiRole guildId={guildId} roles={roles ?? []} />}
                                    </Form.Group>
                                  }
                                  <hr className="mt-0" style={{ borderColor: '#4e5058', borderWidth: 2 }} />
                                  <Button variant="aztra" className="pl-2">
                                    <CheckIcon className="mr-1" />
                                    설정 완료하기
                                  </Button>
                                </Form>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      }

                      <Row className="justify-content-end">
                        <Button variant="aztra" size="sm" className="d-flex align-items-center mr-3" onClick={() => setAddNew(true)}>
                          <AddIcon className="mr-1" />
                          새로 추가
                        </Button>
                        <Button variant="danger" size="sm" className="d-flex align-items-center">
                          <DeleteIcon className="mr-1" />
                          선택 항목 삭제
                        </Button>
                      </Row>

                      <Row className="flex-column mt-4">
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
                              <th className="text-center text-md-left" style={{ width: '20%' }}>작업 유형</th>
                              <th className="text-center text-md-left d-none d-md-table-cell">작업 내용</th>
                              <th style={{ width: 100 }} />
                            </tr>
                          </thead>
                          <tbody>
                            {data?.map(one => <TaskListCard taskset={one} />)}
                          </tbody>
                        </Table>
                      </Row>

                      <Row className="mt-5">
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
    </>
  )
}

export default AutoTasking