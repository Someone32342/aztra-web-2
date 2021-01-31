import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Button, ButtonGroup, Card, Col, Container, Form, Modal, OverlayTrigger, Row, Spinner, Table, Tooltip } from 'react-bootstrap'
import { Add as AddIcon, Delete as DeleteIcon, RemoveCircleOutline, OpenInNew as OpenInNewIcon, Close as CloseIcon } from '@material-ui/icons'
import Twemoji from 'react-twemoji'
import api from 'datas/api'
import { animateScroll } from 'react-scroll'

import { GetServerSideProps, NextPage } from 'next'
import Cookies from 'universal-cookie'
import Layout from 'components/Layout'
import DashboardLayout from 'components/DashboardLayout'
import useSWR from 'swr'
import urljoin from 'url-join'
import { ChannelMinimal, MemberMinimal, Role } from 'types/DiscordTypes'
import Head from 'next/head'
import { TaskSet } from 'types/autotask'
import { EmojiRoleData } from 'types/autotask/action_data'
import EmojiRole from 'components/autotasking/EmojiRole'
import { EmojiRoleParams } from 'types/autotask/params'
import RoleBadge from 'components/forms/RoleBadge'
import { Emoji } from 'emoji-mart'

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

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set)
  const [showSelectedDel, setShowSelectedDel] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { data, mutate } = useSWR<TaskSet[], AxiosError>(
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

  const { data: channels } = useSWR<ChannelMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/channels`) : null,
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
          <div key={o.emoji}>
            <div className="py-1 font-weight-bold d-flex align-items-center">
              <Emoji emoji={o.emoji} set="twitter" size={22} />
              <span className="pl-2">{" "}로 반응했을 때:</span>
            </div>
            {
              o.add &&
              <div className="d-flex pb-1">
                <span className="font-weight-bold pl-3 pr-2">- 역할 추가:</span>
                {o.add.map(r => {
                  const role = roles?.find(one => one.id === r)
                  return <RoleBadge key={r} name={role?.name ?? '(알 수 없음)'} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} />
                })}
              </div>
            }
            {
              o.remove &&
              <div className="d-flex pb-1">
                <span className="font-weight-bold pl-3 pr-2">- 역할 제거:</span>
                {o.remove.map(r => {
                  const role = roles?.find(one => one.id === r)
                  return <RoleBadge key={r} name={role?.name ?? '(알 수 없음)'} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} />
                })}
              </div>
            }
          </div>
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
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer font-weight-bold">
            {eventName}
          </span>
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <div className="mw-100 align-middle cursor-pointer">
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
                <Tooltip id="task-list-row-remove-task">
                  이 작업 제거하기
                </Tooltip>
              }
            >
              <Button variant="dark" className="d-flex px-1 remove-before" onClick={() => {
                axios.delete(`${api}/servers/${guildId}/autotasking`, {
                  data: {
                    tasks: [taskset.uuid]
                  },
                  headers: {
                    Authorization: `Bearer ${new Cookies().get("ACCESS_TOKEN")}`
                  }
                })
                  .then(() => mutate())
              }}>
                <RemoveCircleOutline />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="task-list-row-remove-task">
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

  const delSelectedTasks = () => {
    axios.delete(`${api}/servers/${guildId}/autotasking`, {
      data: {
        tasks: Array.from(selectedTasks)
      },
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(() => {
        setSelectedTasks(new Set)
        mutate()
      })
  }

  const tasksSet = new Set(data?.map(o => o.uuid))

  console.log(selectedTasks)

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
                      어떤 동작이 발생했을 때 여러가지 작업을 자동으로 수행할 수 있습니다.
                    </div>
                  </div>
                </Row>
                <Row>
                  <Col>
                    {
                      data && members && roles && channels
                        ? <Form noValidate>
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
                                          {taskType === "emoji_role" && <EmojiRole guildId={guildId} channels={channels ?? []} roles={roles ?? []} saving={saving} saveError={saveError} onSubmit={({ data, params }) => {
                                            const postData: Omit<TaskSet<EmojiRoleParams, EmojiRoleData[]>, 'uuid'> = {
                                              type: taskType,
                                              params: params,
                                              data: data
                                            }
                                            setSaving(true)
                                            axios.post(`${api}/servers/${guildId}/autotasking`, postData,
                                              {
                                                headers: {
                                                  Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
                                                }
                                              }
                                            )
                                              .then(() => {
                                                mutate()
                                                  .then(() => {
                                                    animateScroll.scrollToTop({
                                                      isDynamic: true
                                                    })
                                                    setTaskType(0)
                                                    setAddNew(false)
                                                    setSaving(false)
                                                  })
                                              })
                                              .catch(() => setSaveError(true))
                                          }}
                                          />}
                                        </Form.Group>
                                      }
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
                            <Button variant="danger" size="sm" className="d-flex align-items-center" disabled={!selectedTasks.size} onClick={() => setShowSelectedDel(true)}>
                              <DeleteIcon className="mr-1" />
                              선택 항목 삭제
                            </Button>
                          </Row>

                          <Row>
                            <Modal className="modal-dark" show={showSelectedDel} onHide={() => setShowSelectedDel(false)} centered>
                              <Modal.Header closeButton>
                                <Modal.Title style={{
                                  fontFamily: "NanumSquare",
                                  fontWeight: 900,
                                }}>
                                  작업 제거하기
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body className="py-4">
                                선택한 작업 {selectedTasks.size}개를 제거하시겠습니까?
                              </Modal.Body>
                              <Modal.Footer className="justify-content-end">
                                <Button variant="danger" onClick={async () => {
                                  setShowSelectedDel(false)
                                  delSelectedTasks()
                                }}>
                                  확인
                                </Button>
                                <Button variant="dark" onClick={() => setShowSelectedDel(false)}>
                                  닫기
                                </Button>
                              </Modal.Footer>
                            </Modal>
                          </Row>

                          <Row className="flex-column mt-4">
                            <Table id="task-list-table" variant="dark" style={{
                              tableLayout: 'fixed'
                            }} >
                              <thead>
                                <tr>
                                  <th className="align-middle text-center" style={{ width: 50 }}>
                                    <Form.Check
                                      id="task-select-all"
                                      custom
                                      type="checkbox"
                                      checked={!!data?.length && tasksSet.size === selectedTasks.size && Array.from(tasksSet).every(value => selectedTasks.has(value))}
                                      onChange={() => {
                                        if (tasksSet.size === selectedTasks.size && Array.from(tasksSet).every(value => selectedTasks.has(value))) {
                                          setSelectedTasks(new Set)
                                        }
                                        else {
                                          setSelectedTasks(tasksSet)
                                        }
                                      }}
                                    />
                                  </th>
                                  <th className="text-center text-md-left" style={{ width: 250 }}>작업 유형</th>
                                  <th className="text-center text-md-left d-none d-md-table-cell">작업 내용</th>
                                  <th style={{ width: 100 }} />
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  data?.map(one =>
                                    <TaskListCard
                                      key={one.uuid}
                                      taskset={one}
                                      checked={selectedTasks.has(one.uuid)}
                                      onCheckChange={() => {
                                        console.log(selectedTasks.has(one.uuid))
                                        let sel = new Set(selectedTasks)

                                        if (sel.has(one.uuid)) {
                                          sel.delete(one.uuid)
                                        }
                                        else {
                                          sel.add(one.uuid)
                                        }

                                        setSelectedTasks(sel)
                                      }} />
                                  )
                                }
                              </tbody>
                            </Table>
                          </Row>
                        </Form>
                        : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
                          height: '500px'
                        }}>
                          <h3 className="pb-4 text-center">경고 목록을 가져오고 있습니다...</h3>
                          <Spinner animation="border" variant="aztra" />
                        </Container>
                    }
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