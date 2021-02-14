import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios'
import { Card, Button, Row, Col, Container, Spinner, Modal } from 'react-bootstrap'
import { MemberMinimal } from 'types/DiscordTypes'
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

  const { data } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
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
            (guild) => guild && data ? (
              <div className="text-white" style={{
                fontFamily: 'NanumBarunGothic'
              }}>
                <Row>
                  <h3>서버 정보</h3>
                </Row>
                <Row className="dashboard-section">
                  <Col className="col-auto">
                    <Card className="flex-md-row my-3 shadow" bg="dark">
                      <Card.Body className="text-center text-md-left">
                        <div style={{
                          height: 120,
                          width: 120
                        }}>
                          {guild?.icon
                            ? <Card.Img
                              src={`https://cdn.discordapp.com/icons/${guild?.id}/${guild?.icon}.png?size=512`}
                            />
                            : <h1 className="d-flex justify-content-center align-items-center w-100 h-100 display-3">{guild?.name[0]}</h1>
                          }
                        </div>
                      </Card.Body>
                      <Card.Body className="pl-md-0 pr-md-5" style={{

                      }}>
                        <Card.Title className="font-weight-bold text-center text-md-left" style={{
                          fontFamily: 'NanumSquare'
                        }}>
                          {guild?.name}
                        </Card.Title>
                        <Card.Text as="div" className="lines">
                          <p>
                            전체 멤버 수: {data?.length} 명
                          </p>
                          <p>
                            전체 중 봇 멤버: {data?.filter(m => m.user.bot).length} 명
                          </p>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <h3>알림 센터</h3>
                  <div className="ml-4">
                    <Button variant="secondary" size="sm">더 보기</Button>
                  </div>
                </Row>
                <Row className="dashboard-section">
                  <Col xs={6} md={3}>
                    <Card className="Dashboard-card my-3 shadow" bg="dark">
                      <Card.Body>
                        <Card.Title>개발 중</Card.Title>
                        <Card.Text>
                          <span className="font-weight-bold">이 기능</span>은 개발 중입니다.
                        </Card.Text>
                        <Button variant="secondary" size="sm">자세히</Button>
                      </Card.Body>
                    </Card>
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
            <li>
              <p>
                <span>
                  <div>
                    명령어가 궁금하신가요?
                  </div>
                  <div>
                    <Link href="/docs" prefetch shallow><a className="font-weight-bold" style={{ color: 'deepskyblue' }}>봇 가이드로 이동하기</a></Link>
                  </div>
                </span>
              </p>
            </li>
            <li>
              <p>
                <span>
                  <div>
                    도움이 필요하시면 서포트서버에 문의해주세요! 봇 소식과 공지사항도 받으실 수 있습니다.
                  </div>
                  <div>
                    <a href={links.support} className="font-weight-bold" style={{ color: 'deepskyblue' }}>InfiniteTeam 서포트 서버 참여하기</a>
                  </div>
                </span>
              </p>
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