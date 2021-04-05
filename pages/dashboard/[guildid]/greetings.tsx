import React, { useEffect, useRef, useState } from 'react';
import { Button, Row, Col, Form, Spinner, Container, Card, Alert, Modal, Table } from 'react-bootstrap'
import TextareaAutosize from 'react-textarea-autosize'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHashtag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { Code as CodeIcon } from '@material-ui/icons'

import axios, { AxiosError } from 'axios'

import { Greetings as GreetingsType } from 'types/dbtypes'
import api from 'datas/api'
import { ChannelMinimal } from 'types/DiscordTypes';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import { GetServerSideProps, NextPage } from 'next';

import Cookies from 'universal-cookie'
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import filterChannels from 'utils/filterChannels';

interface GreetingsRouterProps {
  guildId: string
}

type handleFieldChangeTypes = 'incomingTitle' | 'incomingDesc' | 'outgoingTitle' | 'outgoingDesc' | 'channel'

export const getServerSideProps: GetServerSideProps<GreetingsRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Greetings: NextPage<GreetingsRouterProps> = ({ guildId }) => {
  const [useJoin, setUseJoin] = useState(false)
  const [useLeave, setUseLeave] = useState(false)

  const incomingTitle = useRef<HTMLTextAreaElement>(null)
  const incomingDesc = useRef<HTMLTextAreaElement>(null)
  const outgoingTitle = useRef<HTMLTextAreaElement>(null)
  const outgoingDesc = useRef<HTMLTextAreaElement>(null)

  const [validIT, setValidIT] = useState<boolean | null>(null)
  const [validID, setValidID] = useState<boolean | null>(null)
  const [validOT, setValidOT] = useState<boolean | null>(null)
  const [validOD, setValidOD] = useState<boolean | null>(null)
  const [validChannel, setValidChannel] = useState<boolean | null>(null)

  const [channelSearch, setChannelSearch] = useState('')
  const [newChannel, setNewChannel] = useState<ChannelMinimal | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const [showFormattings, setShowFormattings] = useState(false)

  const { data, mutate } = useSWR<GreetingsType, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/greetings`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      onSuccess: data => {
        setUseJoin(!!(data.join_title_format || data.join_desc_format))
        setUseLeave(!!(data.leave_title_format || data.leave_desc_format))
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
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

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
    if (data) {
      setUseJoin(!!(data.join_title_format || data.join_desc_format))
      setUseLeave(!!(data.leave_title_format || data.leave_desc_format))
    }
  }, [])

  const setValidate = (type?: handleFieldChangeTypes) => {
    const All = [
      0 < incomingTitle.current!.value.length && incomingTitle.current!.value.length <= 256 ? null : useJoin ? false : null,
      0 < outgoingTitle.current!.value.length && outgoingTitle.current!.value.length <= 256 ? null : useLeave ? false : null,
      0 < incomingDesc.current!.value.length && incomingDesc.current!.value.length <= 2048 ? null : useJoin ? false : null,
      0 < outgoingDesc.current!.value.length && outgoingDesc.current!.value.length <= 2048 ? null : useLeave ? false : null,
      useJoin || useLeave ? (!!data?.channel || !!newChannel ? null : false) : null
    ]
    const [IT, OT, ID, OD, CH] = All

    switch (type) {
      case 'incomingTitle':
        setValidIT(IT)
        break
      case 'outgoingTitle':
        setValidOT(OT)
        break
      case 'incomingDesc':
        setValidID(ID)
        break
      case 'outgoingDesc':
        setValidOD(OD)
        break
      case 'channel':
        setValidChannel(CH)
        break
      default:
        for (let x of ['incomingTitle', 'incomingDesc', 'outgoingTitle', 'outgoingDesc', 'channel']) {
          setValidate(x as handleFieldChangeTypes)
        }
    }
    return All
  }

  const checkValidate = () => {
    return (
      setValidate()?.every(o => o === null) ?? false
    )
  }

  const save = async () => {
    setSaving(true)
    let saveData: GreetingsType = {
      guild: guildId,
      channel: newChannel?.id || data?.channel!,
      join_title_format: useJoin ? incomingTitle.current?.value : '',
      join_desc_format: useJoin ? incomingDesc.current?.value : '',
      leave_title_format: useLeave ? outgoingTitle.current?.value : '',
      leave_desc_format: useLeave ? outgoingDesc.current?.value : ''
    }

    try {
      await axios.post(`${api}/servers/${guildId}/greetings`, saveData, {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
        },
      })
      mutate(saveData)
    }
    catch (e) {
      setSaveError(true)
    }
    finally {
      setSaving(false)
    }
  }

  const handleSubmit = () => {
    if (checkValidate()) {
      save()
    }
  }

  const isChanged = () => {
    if (!data || !channels) {
      return false
    }

    return (
      (data.channel !== newChannel?.id && newChannel !== null)
      || ((data.join_title_format || '') !== incomingTitle.current?.value && useJoin)
      || ((data.join_desc_format || '') !== incomingDesc.current?.value && useJoin)
      || ((data.leave_title_format || '') !== outgoingTitle.current?.value && useLeave)
      || ((data.leave_desc_format || '') !== outgoingDesc.current?.value && useLeave)
      || (!!data.join_title_format || !!data.join_desc_format) !== useJoin
      || (!!data.leave_title_format || !!data.leave_desc_format) !== useLeave
    )
  }

  return (
    <>
      <Head>
        <title>환영 메시지 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => data && channels ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>환영 메시지</h3>
                    <div className="py-2">
                      멤버가 서버에 들어오거나 나갈 때 자동으로 특정 채널에 환영 메시지를 보냅니다.
                    </div>
                  </div>
                </Row>

                <Modal className="modal-dark" show={showFormattings} onHide={() => setShowFormattings(false)} centered size="lg">
                  <Modal.Header closeButton>
                    <Modal.Title style={{
                      fontFamily: "NanumSquare",
                      fontWeight: 900,
                    }}>
                      서식문자 목록
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="py-4">
                    <Table variant="dark">
                      <thead>
                        <tr>
                          <th>코드</th>
                          <th>설명</th>
                          <th>예시</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          [
                            ['username', '대상 멤버의 이름', 'Aztra'],
                            ['usertag', '대상 멤버의 태그', '2412'],
                            ['userid', '대상 멤버의 ID', '751339721782722570'],
                            ['guild', '서버의 이름', "Arpa's Server"],
                            ['membercount', '서버의 멤버 수', '904'],
                            ['usermention', '유저를 멘션', '@Aztra'],
                          ].map(([c, d, e]) => <tr key={c as string}>
                            <td>${`{${c}}`}</td>
                            <td>{d}</td>
                            <td>{e}</td>
                          </tr>)
                        }
                      </tbody>
                    </Table>
                  </Modal.Body>
                  <Modal.Footer className="justify-content-end">
                    <Button variant="dark" onClick={() => setShowFormattings(false)}>
                      닫기
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Row>
                  <Col>
                    <Form noValidate>
                      <Row className="pb-2 align-items-center">
                        <h4>반기는 메시지</h4>
                        <Button variant="dark" className="ml-auto d-flex align-items-center mb-2" size="sm" onClick={() => setShowFormattings(true)} >
                          <CodeIcon className="mr-2" fontSize="small" />서식문자 목록
                        </Button>
                      </Row>

                      <Form.Group controlId="incomingUse">
                        <Form.Check
                          type="switch"
                          label="반기는 메시지 사용"
                          checked={useJoin}
                          onChange={() => setUseJoin(!useJoin)}
                          aria-controls="incomingForm"
                          aria-expanded={!!useJoin}

                        />
                      </Form.Group>

                      <div className={!useJoin ? "d-none" : undefined}>
                        <Form.Group controlId="incomingTitle">
                          <Form.Label>메시지 제목</Form.Label>
                          <Form.Control
                            ref={incomingTitle}
                            className="shadow"
                            isInvalid={validIT === false}
                            as={TextareaAutosize}
                            type="text"
                            placeholder="예) ${username}님, 안녕하세요!"
                            defaultValue={data?.join_title_format || undefined}
                            onChange={async (e) => {
                              setValidate("incomingTitle")
                            }}
                          />
                          <Form.Control.Feedback type="invalid">빈칸일 수 없으며 최대 256자를 초과할 수 없습니다!</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="incomingDesc">
                          <Form.Label>메시지 내용</Form.Label>
                          <Form.Control
                            ref={incomingDesc}
                            className="shadow"
                            isInvalid={validID === false}
                            as={TextareaAutosize}
                            type="text"
                            placeholder="예) ${guild}에 오신 것을 환영합니다."
                            defaultValue={data?.join_desc_format || undefined}
                            onChange={async (e) => {
                              setValidate("incomingDesc")
                            }}
                          />
                          <Form.Control.Feedback type="invalid">빈칸일 수 없으며 최대 2048자를 초과할 수 없습니다!</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <Row className="pt-4 pb-2 align-items-center">
                        <h4>나가는 메시지</h4>
                        <Button variant="dark" className="ml-auto d-flex align-items-center mb-2" size="sm" onClick={() => setShowFormattings(true)} >
                          <CodeIcon className="mr-2" fontSize="small" />서식문자 목록
                        </Button>
                      </Row>

                      <Form.Group controlId="outgoingUse">
                        <Form.Check
                          type="switch"
                          label="나가는 메시지 사용"
                          checked={useLeave}
                          onChange={() => setUseLeave(!useLeave)}
                          aria-controls="outgoingForm"
                          aria-expanded={!!useLeave}
                        />
                      </Form.Group>

                      <div className={!useLeave ? "d-none" : undefined}>
                        <Form.Group controlId="outgoingTitle">
                          <Form.Label>메시지 제목</Form.Label>
                          <Form.Control
                            ref={outgoingTitle}
                            className="shadow"
                            isInvalid={validOT === false}
                            as={TextareaAutosize}
                            type="text"
                            placeholder="예) ${username}님, 안녕히가세요"
                            defaultValue={data?.leave_title_format || undefined}
                            onChange={async (e) => {
                              setValidate("outgoingTitle")
                            }}
                          />
                          <Form.Control.Feedback type="invalid">빈칸일 수 없으며 최대 256자를 초과할 수 없습니다!</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="outgoingDesc">
                          <Form.Label>메시지 내용</Form.Label>
                          <Form.Control
                            ref={outgoingDesc}
                            className="shadow"
                            isInvalid={validOD === false}
                            as={TextareaAutosize}
                            type="text"
                            placeholder="예) ${username}님이 나갔습니다."
                            defaultValue={data?.leave_desc_format || undefined}
                            onChange={async (e) => {
                              setValidate("outgoingDesc")
                            }}
                          />
                          <Form.Control.Feedback type="invalid">빈칸일 수 없으며 최대 2048자를 초과할 수 없습니다!</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <Row className="pt-4 pb-2">
                        <h4 className="pr-5">전송 채널</h4>
                      </Row>
                      <Row>
                        <Col md={8}>
                          {
                            useJoin || useLeave
                              ? <Form.Group>
                                <Container fluid>
                                  <Row className="mb-3 flex-column">
                                    {
                                      newChannel || channels?.find(one => one.id === data?.channel)
                                        ? <>
                                          <h5 className="pr-2">현재 선택됨: </h5>
                                          <Card bg="secondary">
                                            <Card.Header className="py-1 px-3" style={{
                                              fontFamily: 'NanumSquare',
                                              fontSize: '13pt'
                                            }}>
                                              <FontAwesomeIcon icon={faHashtag} className="mr-2 my-auto" size="sm" />
                                              {newChannel?.name || channels?.find(one => one.id === data?.channel)?.name}
                                            </Card.Header>
                                          </Card>
                                        </>
                                        : <Form.Label as="h5" className={validChannel === false ? "text-danger font-weight-bold" : ""}>선택된 채널이 없습니다!</Form.Label>
                                    }

                                  </Row>
                                  <Row className="pb-2">
                                    <input hidden={true} />
                                    <Form.Control type="text" placeholder="채널 검색" onChange={(e) => setChannelSearch(e.target.value)} />
                                    <Form.Text className="py-1">
                                      {channels?.length}개 채널 찾음
                                    </Form.Text>
                                  </Row>
                                  <Row style={{
                                    maxHeight: 220,
                                    overflow: 'auto',
                                    borderRadius: '10px',
                                    display: 'block'
                                  }}>
                                    {
                                      channels
                                        ? filterChannels(channels, channelSearch)
                                          .map(one =>
                                            <ChannelSelectCard
                                              key={one.id}
                                              selected={newChannel === one || (!newChannel && one.id === data?.channel)}
                                              channelData={{
                                                channelName: one.name,
                                                parentChannelName: channels?.find(c => c.id === one.parentID)?.name
                                              }}
                                              onClick={() => setNewChannel(one)}
                                            />
                                          )
                                        : <h4>불러오는 중</h4>
                                    }
                                  </Row>

                                </Container>
                              </Form.Group>
                              : <Alert variant="warning" className="d-flex">
                                <FontAwesomeIcon icon={faExclamationTriangle} color="darkorange" size="lg" className="my-auto mr-2" />
                              채널을 선택하려면 먼저 반기는 메시지 또는 나가는 메시지를 사용해야 합니다.
                          </Alert>
                          }
                        </Col>
                      </Row>

                      <Row className="mt-4">
                        <Button
                          variant={saveError ? "danger" : "aztra"}
                          disabled={saving || saveError || !isChanged()}
                          onClick={handleSubmit}
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
                              : <span>{saveError ? "오류" : isChanged() ? "저장하기" : "저장됨"}</span>
                          }
                        </Button>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </div>
            )
              : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
                height: '500px'
              }}>
                <h3 className="pb-4">불러오는 중</h3>
                <Spinner animation="border" variant="aztra" />
              </Container>
          }
        </DashboardLayout>
      </Layout>
    </>
  )
}

export default Greetings
