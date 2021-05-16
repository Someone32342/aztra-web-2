import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios'
import { Button, Row, Col, Container, Spinner, Modal, Card, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {
  People as PeopleIcon,
  Router as RouterIcon,
  Menu as MenuIcon,
  PersonAdd as PersonAddIcon,
  DataUsage as DataUsageIcon,
  History as HistoryIcon,
  EventNote as EventNoteIcon,
  CreditCard as CreditCardIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@material-ui/icons';
import { ChannelMinimal, MemberMinimal } from 'types/DiscordTypes'
import { Warns as WarnsType, Greetings as GreetingsType, ServerData, LoggingSet as LoggingSetType, TicketSet } from 'types/dbtypes'
import urljoin from 'url-join';
import api from 'datas/api';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';

import Cookies from 'universal-cookie'
import { GetServerSideProps, NextPage } from 'next';
import useSWR from 'swr';
import Head from 'next/head';
import Link from 'next/link';
import links from 'datas/links';
import prefixes from 'datas/prefixes';
import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'
import { TaskSet } from 'types/autotask';
dayjs.locale('ko')
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

interface MainRouterProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<MainRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Main: NextPage<MainRouterProps> = ({ guildId }) => {
  const [isFirst, setIsFirst] = useState(false)

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
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

  const { data: serverdata } = useSWR<ServerData, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/serverdata`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: warns } = useSWR<WarnsType[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/warns`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: greetings } = useSWR<GreetingsType, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/greetings`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: logging } = useSWR<LoggingSetType | null, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/logging`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: autotasking } = useSWR<TaskSet[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/autotasking`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: ticketsets } = useSWR<TicketSet[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/ticketsets`) : null,
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
    if (localStorage.getItem('firstInvite') === 'true') {
      setIsFirst(true)
      localStorage.setItem('firstInvite', 'false')
    }
  }, [])

  return (
    <>
      <Head>
        <title>메인 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            (guild) => guild && members && channels && warns && greetings && serverdata && logging && autotasking && ticketsets ? (
              <div className="text-white" style={{
                fontFamily: 'NanumSquare'
              }}>
                <Row className="dashboard-section align-items-center">
                  <div
                    className="mr-4"
                    style={{
                      height: 90,
                      width: 90
                    }}>
                    {guild.icon
                      ? <img
                        className="rounded-circle"
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
                        style={{
                          height: 90,
                          width: 90
                        }}
                      />
                      : <h2 className="d-flex justify-content-center align-items-center w-100 h-100 display-3">{guild.name[0]}</h2>
                    }
                  </div>
                  <h1>{guild.name}</h1>
                </Row>

                <Row className="mt-5 mb-2">
                  <h4>서버 정보</h4>
                </Row>
                <Row>
                  <Col style={{ fontSize: 18 }}>
                    <div>
                      <PeopleIcon className="mr-2" />
                      <span className="pr-2">전체 멤버 수:</span>
                      <span>{members.length}</span>
                    </div>
                    <div>
                      <RouterIcon className="mr-2" />
                      <span className="pr-2">전체 봇 수:</span>
                      <span>{members.filter(o => o.user.bot).length}</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mt-5 mb-2">
                  <h4>기능 설정 상태</h4>
                </Row>

                <Row>
                  <Col className="mb-4 d-flex mh-100 w-100" xs={6} lg={3}>
                    <Card bg="dark" className="shadow mh-100 w-100">
                      <Card.Body className="pt-3">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center">
                          <span>
                            <PersonAddIcon className="mr-2" />
                            환영 메시지
                          </span>
                          <Link href={`/dashboard/${guild?.id}/greetings`} shallow>
                            <Button variant="dark" size="sm">관리하기</Button>
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          <div>
                            반기는 메시지:{" "}
                            {
                              greetings.join_title_format || greetings.join_desc_format
                                ? <><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" />사용중</>
                                : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />사용 안함</>
                            }
                          </div>
                          <div>
                            나가는 메시지:{" "}
                            {
                              greetings.leave_title_format || greetings.leave_desc_format
                                ? <><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" />사용중</>
                                : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />사용 안함</>
                            }
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col className="mb-4 d-flex mh-100 w-100" xs={6} lg={3}>
                    <Card bg="dark" className="shadow mh-100 w-100">
                      <Card.Body className="pt-3">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center">
                          <div>
                            <DataUsageIcon className="mr-2" />
                            레벨링
                          </div>
                          <Link href={`/dashboard/${guild?.id}/leveling`} shallow>
                            <Button variant="dark" size="sm">관리하기</Button>
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          {
                            serverdata.sendLevelMessage
                              ? <><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" />레벨이 올랐을 때 메시지를 보냅니다.</>
                              : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />레벨이 올랐을 때 메시지를 보내지 않습니다.</>
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col className="mb-4 d-flex mh-100 w-100" xs={6} lg={3}>
                    <Card bg="dark" className="shadow mh-100 w-100">
                      <Card.Body className="pt-3">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center">
                          <div>
                            <HistoryIcon className="mr-2" />
                            로깅
                          </div>
                          <Link href={`/dashboard/${guild?.id}/logging`} shallow>
                            <Button variant="dark" size="sm">관리하기</Button>
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          {
                            Number(logging.flags)
                              ? <>
                                <div><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" />로깅을 사용 중입니다.</div>
                                <div className="pl-4"><b>#{channels.find(c => c.id === logging.channel)?.name ?? "(알 수 없는 채널)"}</b> 에 로그 메시지를 전송합니다.</div>
                              </>
                              : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />로깅을 사용하고 있지 않습니다.</>
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col className="mb-4 d-flex mh-100 w-100" xs={6} lg={3}>
                    <Card bg="dark" className="shadow mh-100 w-100">
                      <Card.Body className="pt-3">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center">
                          <div>
                            <EventNoteIcon className="mr-2" />
                            자동 작업
                          </div>
                          <Link href={`/dashboard/${guild?.id}/autotasking`} shallow>
                            <Button variant="dark" size="sm">관리하기</Button>
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          {
                            autotasking.length
                              ? <>
                                <div><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" /><b>{autotasking.length}</b>개의 자동 작업 사용중</div>
                              </>
                              : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />자동 작업을 사용하고 있지 않습니다.</>
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col className="mb-4 d-flex mh-100 w-100" xs={6} lg={3}>
                    <Card bg="dark" className="shadow mh-100 w-100">
                      <Card.Body className="pt-3">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center">
                          <div>
                            <CreditCardIcon className="mr-2" />
                            티켓
                          </div>
                          <Link href={`/dashboard/${guild?.id}/tickets`} shallow>
                            <Button variant="dark" size="sm">관리하기</Button>
                          </Link>
                        </Card.Title>
                        <Card.Text>
                          {
                            ticketsets.length
                              ? <>
                                <div><CheckIcon className="mr-1" fontSize="small" htmlColor="limegreen" /><b>{ticketsets.length}</b>개의 티켓 사용중</div>
                              </>
                              : <><CloseIcon className="mr-1" fontSize="small" htmlColor="red" />티켓을 사용하고 있지 않습니다.</>
                          }
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-5">
                  <Col className="mb-5" xs={12} lg={6}>
                    <div className="d-flex justify-content-between">
                      <h4 className="mb-3">최근 경고 목록</h4>
                      <div>
                        <Link href={`/dashboard/${guildId}/warns/list`}>
                          <Button variant="aztra" className="shadow align-items-center d-flex" size="sm" >
                            <MenuIcon className="mr-2" />
                            모두 보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {
                      warns.length
                        ?
                        warns
                          ?.sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime())
                          .slice(0, 5)
                          .map(one => {
                            const target = members?.find(m => m.user.id === one.member)?.user
                            return (
                              <Card key={one.uuid} bg="dark" className="mb-2 shadow-sm shadow">
                                <Card.Body as={Row} className="py-1 d-flex justify-content-between">
                                  <Col xs={9} className="d-flex px-2">
                                    <div className="mr-2 my-auto" style={{
                                      height: 35,
                                      width: 35
                                    }}>
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={
                                          <Tooltip id={`warn-member-${one.member}`}>
                                            {target?.tag}
                                          </Tooltip>
                                        }
                                      >
                                        <Link href={`/dashboard/${guildId}/members/${target?.id}`}>
                                          <img
                                            src={target?.avatar ? `https://cdn.discordapp.com/avatars/${target?.id}/${target?.avatar}` : target?.defaultAvatarURL}
                                            alt={target?.tag!}
                                            className="rounded-circle no-drag"
                                            style={{
                                              height: 35,
                                              width: 35
                                            }}
                                          />
                                        </Link>
                                      </OverlayTrigger>
                                    </div>
                                    <div className="my-auto d-inline-block text-truncate">
                                      {one.reason}
                                    </div>
                                  </Col>
                                  <Col xs={3} className="d-flex px-2 align-items-center my-0 justify-content-end">
                                    <div className="my-auto small" style={{
                                      color: 'lightgrey'
                                    }}>
                                      <div className="text-right">
                                        {one.count}회
                                      </div>
                                      <div className="text-right">
                                        {dayjs.utc(one.dt).local().fromNow()}
                                      </div>
                                    </div>
                                  </Col>
                                </Card.Body>
                              </Card>
                            )
                          })
                        : <div className="d-flex align-items-center justify-content-center h-75">
                          <div className="my-4" style={{ color: 'lightgray' }}>경고가 하나도 없습니다! 평화롭네요.</div>
                        </div>
                    }
                  </Col>
                  <Col className="mb-5" xs={12} lg={6}>
                    <div className="d-flex justify-content-between">
                      <h4 className="mb-3">최근 새 멤버</h4>
                      <div>
                        <Link href={`/dashboard/${guildId}/members`}>
                          <Button variant="aztra" className="shadow align-items-center d-flex" size="sm" >
                            <MenuIcon className="mr-2" />
                            모두 보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {
                      members
                        .sort((a, b) => new Date(b.joinedAt!).getTime() - new Date(a.joinedAt!).getTime())
                        .slice(0, 5)
                        .map(one => {
                          return (
                            <Card key={one.user.id} bg="dark" className="mb-2 shadow-sm shadow">
                              <Card.Body as={Row} className="py-1 d-flex justify-content-between">
                                <Col xs={9} className="d-flex px-2">
                                  <div className="mr-2 my-auto" style={{
                                    height: 35,
                                    width: 35
                                  }}>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`warn-member-${one.user.id}`}>
                                          {one.user.tag}
                                        </Tooltip>
                                      }
                                    >
                                      <Link href={`/dashboard/${guildId}/members/${one.user.id}`}>
                                        <img
                                          src={one.user.avatar ? `https://cdn.discordapp.com/avatars/${one.user.id}/${one.user.avatar}` : one.user.defaultAvatarURL}
                                          alt={one.user.tag!}
                                          className="rounded-circle no-drag"
                                          style={{
                                            height: 35,
                                            width: 35
                                          }}
                                        />
                                      </Link>
                                    </OverlayTrigger>
                                  </div>
                                  <div className="my-auto d-inline-block text-truncate">
                                    {one.user.tag}
                                  </div>
                                </Col>
                                <Col xs={3} className="d-flex px-2 align-items-center my-0 justify-content-end">
                                  <div className="my-auto small text-right" style={{
                                    color: 'lightgrey'
                                  }}>
                                    {dayjs.utc(one.joinedAt!).local().fromNow()}
                                  </div>
                                </Col>
                              </Card.Body>
                            </Card>
                          )
                        })
                    }
                  </Col>
                </Row>

              </div>
            ) : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
              height: '500px'
            }}>
              <h3 className="pb-4">불러오는 중</h3>
              <Spinner animation="border" variant="aztra" />
            </Container>
          }
        </DashboardLayout>
      </Layout>

      <Modal className="modal-dark" show={isFirst} centered size="lg" onHide={() => setIsFirst(false)}>
        <Modal.Header>
          <Modal.Title style={{ fontFamily: "NanumSquare" }}>
            환영합니다!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            이곳에서 Aztra를 편리하게 설정하고 관리해보세요!
          </p>
          <ul>
            <li className="pb-3">
              <div className="font-weight-bold">명령어가 궁금하신가요?</div>
              <Link href="/docs" prefetch shallow><a className="font-weight-bold" style={{ color: 'deepskyblue' }}>봇 가이드로 이동하기</a></Link>
            </li>
            <li className="pb-3">
              <div className="font-weight-bold">공지 메시지를 받아보세요</div>
              <b>{prefixes}공지채널</b> 명령으로 봇으로부터 공지 메시지를 받을 채널을 선택할 수 있습니다.
            </li>
            <li className="pb-3">
              <div className="font-weight-bold">도움이 필요하시면 서포트서버에 문의해주세요! 봇 소식과 공지사항도 받으실 수 있습니다.</div>
              <a href={links.support} target="_blank" className="font-weight-bold" style={{ color: 'deepskyblue' }}>InfiniteTeam 서포트 서버 참여하기</a>
            </li>
            <li className="pb-3">
              시간이 되신다면 Aztra 봇에 <a href="https://koreanbots.dev/bots/751339721782722570" target="_blank" className="font-weight-bold" style={{ color: 'deepskyblue' }}>하트</a>를 눌러주시면 더욱 힘이 됩니다!
            </li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="aztra" onClick={() => setIsFirst(false)}>사용 시작하기!</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Main