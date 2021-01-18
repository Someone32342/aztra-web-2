import React, { useEffect, useState } from 'react';

import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { MemberExtended } from 'types/DiscordTypes';
import { Row, Col, Card, Container, Spinner, Badge, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBug, faExclamationTriangle, faStream, faUserEdit, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import BackTo from 'components/BackTo';

import { calcLevel, getAccumulateExp, getRequiredEXP } from '@aztra/level-utils'
import { Exp } from 'types/dbtypes/exps';
import { Warns } from 'types/dbtypes/warns';

import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Cookies from 'universal-cookie';

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'
import useSWR from 'swr';
import urljoin from 'url-join';
dayjs.locale('ko')
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

interface MemberDashboardRouteProps {
  guildId: string
  memberId: string
}

export const getServerSideProps: GetServerSideProps<MemberDashboardRouteProps> = async context => {
  const { guildid, memberid } = context.query
  return {
    props: {
      guildId: guildid as string,
      memberId: memberid as string
    }
  }
}

const MemberDashboard: NextPage<MemberDashboardRouteProps> = ({ guildId, memberId }) => {
  const [showPercent, setShowPercent] = useState(false)

  const { data: member } = useSWR<MemberExtended, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members/${memberId}`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: warns } = useSWR<Warns[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/warns`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: exps } = useSWR<Exp[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/exps`) : null,
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

  var statusColor: string | null = null
  var statusName: string | null = null

  const isBot = member?.user.bot

  switch (member?.user.presence.status) {
    case 'online':
      statusColor = 'limegreen'
      statusName = '온라인'
      break
    case 'dnd':
      statusColor = 'rgb(255, 50, 50)'
      statusName = '다른 용무 중'
      break
    case 'idle':
      statusColor = 'gold'
      statusName = '자리 비움'
      break
    case 'offline':
    case 'invisible':
      statusColor = 'darkgrey'
      statusName = '오프라인'
      break
    default:
      break
  }

  const exp = exps?.find(m => m.id === member?.user.id)?.exp || 0
  const level = calcLevel(exp)
  const reqExp = getRequiredEXP(level)
  const accuExp = getAccumulateExp(level)
  const reqCompleted = (reqExp || 0) - accuExp + exp
  let expIndex = exps?.sort((a, b) => b.exp - a.exp).findIndex(m => m.id === member?.user.id)


  let expRank: number | undefined
  switch (expIndex) {
    case -1:
    case undefined:
      expRank = undefined
      break
    default:
      expRank = expIndex + 1
  }

  return (
    <Layout>
      <DashboardLayout guildId={guildId}>
        {
          () => member && exps && warns
            ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <BackTo className="pl-2 mb-4" name="멤버 목록" to={`/dashboard/${guildId}/members`} />
                    <h3>멤버 관리</h3>
                  </div>
                </Row>

                <Row className="justify-content-center justify-content-sm-start">
                  <div className="position-relative">
                    <div style={{
                      width: 128,
                      height: 128
                    }}>
                      <img
                        alt={member?.user.username!}
                        className="rounded-circle no-drag"
                        src={member?.user.avatar ? `https://cdn.discordapp.com/avatars/${member?.user.id}/${member?.user.avatar}` : member?.user.defaultAvatarURL}
                        style={{
                          width: 128,
                          height: 128
                        }}
                      />
                    </div>
                    {
                      statusColor && (
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="member-status-tooltip">
                              {statusName}
                            </Tooltip>
                          }
                        >
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            position: 'absolute',
                            bottom: 1,
                            right: 1,
                            border: '7px solid #252a2e',
                            backgroundClip: 'border-box'
                          }} />
                        </OverlayTrigger>
                      )
                    }
                  </div>
                  <div className="text-center text-sm-left mt-4 mt-sm-0 px-4">
                    <div style={{
                      fontSize: '24pt'
                    }}>
                      {member?.displayName}
                      {
                        member?.user.bot &&
                        <Badge variant="blurple" className="ml-2 font-weight-bold mt-2 align-text-top" style={{
                          fontSize: '11pt'
                        }}>
                          BOT
                        </Badge>
                      }
                    </div>
                    <div style={{
                      fontSize: '17pt'
                    }}>
                      {member?.user.username}
                      <span className="ml-1 font-weight-bold" style={{
                        color: '#8f8f8f',
                        fontSize: '13pt'
                      }}>
                        #{member?.user.discriminator}
                      </span>
                    </div>
                  </div>
                </Row>

                <Row className="my-5">
                  {
                    !isBot &&
                    <Col xs={12} xl={5} className="pt-4 pb-5 d-md-flex">
                      <div className="mx-auto mx-md-0" style={{
                        maxWidth: 200,
                        maxHeight: 200
                      }}>

                        <CircularProgressbarWithChildren value={showPercent ? reqExp ? reqCompleted / reqExp * 100 : 100 : 0} strokeWidth={5} styles={{
                          path: {
                            stroke: "#8c53c6",
                            strokeLinecap: "butt",
                          },
                          trail: {
                            stroke: "#4d3663"
                          }
                        }}>
                          <div className="text-center pt-2" style={{
                            color: "white",
                            fontFamily: "Teko"
                          }}>
                            <div style={{
                              fontSize: "4.5rem",
                              lineHeight: "3rem"
                            }}>
                              {level}
                              <span style={{
                                fontSize: '2rem'
                              }}>
                                LV
                            </span>
                            </div>
                            <div style={{
                              fontSize: "1.5rem"
                            }}>
                              {reqExp ? reqCompleted.toLocaleString() : '--'}/{reqExp ? reqExp.toLocaleString() : '--'} P
                          </div>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                      <div className="pl-md-5 mt-4 mt-md-0 d-flex align-items-center justify-content-center justify-content-md-left">
                        <div style={{
                          fontFamily: "NanumSquare",
                          fontSize: '13pt'
                        }}>
                          <div className="pb-2 font-weight-bold" style={{
                            fontSize: '20pt'
                          }}>
                            <FontAwesomeIcon icon={faStream} className="mr-3" />
                          서버 {expRank || '--'}위
                        </div>
                          <div>
                            총 경험치:{' '}
                            <span style={{
                              fontSize: '17pt'
                            }}>
                              {exp.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  }
                  <Col xs={12} xl={isBot ? 12 : 7}>
                    <div className={`d-flex ${!isBot && 'justify-content-between'}`}>
                      <h4 className="mb-3">최근 활동</h4>
                      <div className={`${isBot && 'ml-3'}`}>
                        <Button variant="aztra" size="sm">더보기</Button>
                      </div>
                    </div>
                    <Card bg="dark" className="mb-2 shadow-sm">
                      <Card.Body className="py-2 d-flex justify-content-between">
                        <div>
                          <FontAwesomeIcon icon={faBug} className="mr-2" />
                          버그나 오류를 발견하셨다면 개발팀에 알려주세요
                        </div>
                        <small style={{
                          color: 'lightgrey'
                        }}>
                          방금
                        </small>
                      </Card.Body>
                    </Card>
                    <Card bg="dark" className="mb-2 shadow-sm">
                      <Card.Body className="py-2 d-flex justify-content-between">
                        <div>
                          <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                          이 기능은 개발중입니다.
                        </div>
                        <small style={{
                          color: 'lightgrey'
                        }}>
                          금방
                        </small>
                      </Card.Body>
                    </Card>
                    <Card bg="dark" className="mb-2 shadow-sm">
                      <Card.Body className="py-2 d-flex justify-content-between">
                        <div>
                          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                          {member?.user.username} 이(가) 새로 들어왔습니다.
                        </div>
                        <small style={{
                          color: 'lightgrey'
                        }}>
                          {dayjs.utc(member?.joinedAt!).local().fromNow()}
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col className="pb-5" xs={12} xl={6}>
                    <div className="d-flex justify-content-between">
                      <h4 className="mb-3">받은 경고</h4>
                      <div>
                        <Link href={`/dashboard/${guildId}/warns/list?search=${encodeURIComponent(member?.user.tag || '')}&type=target`}>
                          <Button hidden={!warns?.length} variant="aztra" size="sm">
                            더보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {
                      warns?.length
                        ? warns
                          ?.filter(one => one.member === member?.user.id)
                          .sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime())
                          .map(one => (
                            <Card key={one.uuid} bg="dark" className="mb-2 shadow-sm shadow">
                              <Card.Body as={Row} className="py-1 d-flex justify-content-between">
                                <Col xs={9} className="d-flex">
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 my-auto" />
                                  <div className="my-auto d-inline-block text-truncate">
                                    {one.reason}
                                  </div>
                                </Col>
                                <Col xs={3} className="d-flex align-items-center my-0 justify-content-end">
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
                          ))
                        : <div className="d-flex align-items-center justify-content-center h-75">
                          <div className="my-4" style={{ color: 'lightgray' }}>경고가 하나도 없습니다! 평화롭네요.</div>
                        </div>
                    }
                  </Col>
                  <Col className="pb-5" xs={12} xl={6}>
                    <h4 className="mb-3">티켓</h4>
                    <Alert variant="aztra">
                      현재 이 멤버에 열린 티켓이 없습니다!
                    </Alert>
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
  )
}

export default MemberDashboard