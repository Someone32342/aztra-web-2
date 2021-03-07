import React, { useEffect, useState } from 'react';

import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { ChannelMinimal, MemberMinimal } from 'types/DiscordTypes';
import { Row, Container, Spinner, Form, Table, Tab, Tabs, Card, Button, ButtonGroup, OverlayTrigger, Tooltip, Modal, Col } from 'react-bootstrap';
import { ErrorOutline as ErrorOutlineIcon, Check as CheckIcon, LockOutlined as LockIcon } from '@material-ui/icons'

import BackTo from 'components/BackTo';

import { Ticket, TicketSet } from 'types/dbtypes';

import { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router'
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Cookies from 'universal-cookie';

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import MemberCell from 'components/MemberCell';
dayjs.locale('ko')
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

interface TicketListProps {
  guildId: string
  ticketId: string
}

interface TicketListCardProps {
  onCheckChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
  checked?: boolean
  ticket: Ticket
}

export const getServerSideProps: GetServerSideProps<TicketListProps> = async context => {
  const { guildid, ticketid } = context.query
  return {
    props: {
      guildId: guildid as string,
      ticketId: ticketid as string
    }
  }
}

const TicketList: NextPage<TicketListProps> = ({ guildId, ticketId }) => {
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set)
  const [showSelectedClose, setShowSelectedClose] = useState(false)

  const { data, mutate } = useSWR<Ticket[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/tickets`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      refreshInterval: 5000
    }
  )

  const { data: ticketsets } = useSWR<TicketSet[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/ticketsets`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      refreshInterval: 5000
    }
  )

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      refreshInterval: 5000
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
  }, [])

  const TicketListCard: React.FC<TicketListCardProps> = ({ ticket, onCheckChange, checked }) => {
    const [showClose, setShowClose] = useState(false)

    const channel = channels?.find(o => o.id === ticket.channel)

    return (
      <tr>
        <td className="align-middle text-center">
          <Form.Check
            id={`ticket-check-${ticket.uuid}`}
            type="checkbox"
            custom
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td className="align-middle">
          <b>#{ticket.number}</b>
        </td>
        <td className="align-middle font-weight-bold">
          {channel ? `#${channel.name}` : <i>(존재하지 않는 채널)</i>}
        </td>
        <td className="align-middle">
          <MemberCell member={members?.find(o => o.user.id === ticket.opener)!} guildId={guildId} />
        </td>
        <td className="align-middle text-right">
          <ButtonGroup>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="task-list-row-remove-task">
                  티켓 닫기
                </Tooltip>
              }
            >
              <Button variant="dark" className="d-flex px-1 remove-before" onClick={() => setShowClose(true)}>
                <LockIcon />
              </Button>
            </OverlayTrigger>
          </ButtonGroup>

          <Modal className="modal-dark" show={showClose} onHide={() => setShowClose(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{
                fontFamily: "NanumSquare",
                fontWeight: 900,
              }}>
                티켓 닫기
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
              이 티켓을 닫으시겠습니까?
              <Card bg="dark" className="mt-3">
                <Card.Body>
                  <Row className="pb-1">
                    <Col xs={3} className="font-weight-bold">
                      티켓 번호
                    </Col>
                    <Col className="font-weight-bold">
                      {ticket.number}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={3} className="font-weight-bold">
                      티켓 채널
                    </Col>
                    <Col className="font-weight-bold">
                      {channel ? `#${channel.name}` : <i>(존재하지 않는 채널)</i>}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Modal.Body>
            <Modal.Footer className="justify-content-end">
              <Button variant="danger" onClick={async () => {
                setShowClose(false)
                axios.post(`${api}/servers/${guildId}/tickets/close`, {
                  tickets: [ticket.uuid]
                },
                  {
                    headers: {
                      Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
                    }
                  })
                  .then(() => {
                    mutate()
                  })
              }}>
                확인
              </Button>
              <Button variant="dark" onClick={() => setShowClose(false)}>
                닫기
              </Button>
            </Modal.Footer>
          </Modal>
        </td>
      </tr>
    )
  }

  const ListTable: React.FC<{ mode: 'open' | 'closed' }> = ({ mode }) => {
    return (
      <Table id={`ticket-${mode}-list-table`} variant="dark" style={{
        tableLayout: 'fixed'
      }} >
        <thead>
          <tr>
            <th className="align-middle text-center" style={{ width: 50 }}>
              <Form.Check
                id="tickets-select-all"
                custom
                type="checkbox"
                checked={!!data?.length && ticketsSet.size === finalSelectedSet.size && Array.from(ticketsSet).every(value => finalSelectedSet.has(value))}
                onChange={() => {
                  if (ticketsSet.size === finalSelectedSet.size && Array.from(ticketsSet).every(value => finalSelectedSet.has(value))) {
                    setSelectedTickets(new Set)
                  }
                  else {
                    setSelectedTickets(ticketsSet)
                  }
                }}
              />
            </th>
            <th>티켓번호</th>
            <th style={{ maxWidth: 400 }}>채널</th>
            <th>생성자</th>
            <th style={{ width: 100 }} />
          </tr>
        </thead>
        <tbody>
          {data?.filter(o => o.status === mode).sort((a, b) => b.number - a.number).map(one =>
            <TicketListCard key={one.uuid} ticket={one} checked={finalSelectedSet.has(one.uuid)}
              onCheckChange={() => {
                let sel = new Set(finalSelectedSet)

                if (sel.has(one.uuid)) {
                  sel.delete(one.uuid)
                }
                else {
                  sel.add(one.uuid)
                }

                setSelectedTickets(sel)
              }} />
          )}
        </tbody>
      </Table>
    )
  }

  const closeSelectedTickets = () => {
    axios.post(`${api}/servers/${guildId}/tickets/close`, {
      tickets: Array.from(finalSelectedSet)
    },
      {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
        }
      })
      .then(() => {
        setSelectedTickets(new Set)
        mutate()
      })
  }

  const ticketsSet = new Set(data?.map(o => o.uuid))
  const finalSelectedSet = new Set(Array.from(selectedTickets).filter(o => ticketsSet.has(o)))

  return (
    <>
      <Head>
        <title>세부 티켓 목록 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => data && ticketsets && members && channels
              ? (
                <>
                  <Row className="dashboard-section">
                    <div>
                      <BackTo className="pl-2 mb-4" name="티켓 설정" to={`/dashboard/${guildId}/tickets`} />
                      <h3>세부 티켓 목록</h3>
                    </div>
                  </Row>

                  <Row className="flex-column">
                    <Card bg="dark">
                      <Card.Body className="py-2 d-flex align-items-center">
                        티켓:
                        <h5 className="mb-0 pl-2" style={{ fontFamily: "NanumSquare" }}>{ticketsets?.find(o => o.uuid === ticketId)?.name}</h5>
                      </Card.Body>
                    </Card>
                  </Row>

                  <Row className="justify-content-end align-items-center mt-3">
                    <Button variant="danger" size="sm" className="d-flex align-items-center" disabled={!finalSelectedSet.size} onClick={() => setShowSelectedClose(true)}>
                      <LockIcon className="mr-1" />
                      선택 티켓 닫기
                    </Button>
                  </Row>

                  <Row className="flex-column mt-2 nav-tabs-dark">
                    <Tabs defaultActiveKey="open" id="ticket-list-tabs" transition={false}>
                      <Tab eventKey="open" title={<><ErrorOutlineIcon className="mr-2" />열린 티켓</>}>
                        <ListTable mode="open" />
                      </Tab>
                      <Tab eventKey="closed" title={<><CheckIcon className="mr-2" />닫힌 티켓</>}>
                        <ListTable mode="closed" />
                      </Tab>
                    </Tabs>
                  </Row>

                  <Row>
                    <Modal className="modal-dark" show={showSelectedClose} onHide={() => setShowSelectedClose(false)} centered>
                      <Modal.Header closeButton>
                        <Modal.Title style={{
                          fontFamily: "NanumSquare",
                          fontWeight: 900,
                        }}>
                          티켓 닫기
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="py-4">
                        <p className="font-weight-bold" style={{ fontSize: 17 }}>
                          선택한 티켓 {finalSelectedSet.size}개를 닫으시겠습니까?
                        </p>
                        <small>
                          - 티켓을 닫으면 <b>닫힌 티켓</b>으로 분류되며, 티켓 설정대로 카테고리, 채널 이름과 권한 등이 변경됩니다.
                        </small>
                      </Modal.Body>
                      <Modal.Footer className="justify-content-end">
                        <Button variant="danger" onClick={async () => {
                          setShowSelectedClose(false)
                          closeSelectedTickets()
                        }}>
                          확인
                        </Button>
                        <Button variant="dark" onClick={() => setShowSelectedClose(false)}>
                          닫기
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </Row>
                </>
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

export default TicketList