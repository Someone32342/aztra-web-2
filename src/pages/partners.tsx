import React from 'react';
import axios, { AxiosError } from 'axios';
import Layout from 'components/Layout';
import api from 'datas/api';
import { NextPage } from 'next';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import useSWR from 'swr';
import { PartialGuildExtend } from 'types/DiscordTypes';
import Cookies from 'universal-cookie';
import urljoin from 'url-join';
import {
  NewReleases as NewReleasesIcon,
  Forum as ForumIcon,
  Share as ShareIcon,
  BusinessCenter as BusinessCenterIcon,
} from '@mui/icons-material';
import Head from 'next/head';

const Partners: NextPage = () => {
  /*
  const { data } = useSWR<PartialGuildExtend[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, '/discord/users/@me/guilds') : null,
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
  */

  return (
    <>
      <Head>
        <title>Aztra 파트너 서버</title>
      </Head>
      <Layout>
        <div style={{ minHeight: '80vh' }}>
          <Container
            fluid
            className="text-white my-4"
            style={{ padding: '100px 8% 20px 8%' }}
          >
            <Row className="text-center mb-5 pb-4">
              <Col>
                <h1 className="pb-3">Aztra 파트너 서버</h1>
                <div
                  className="mb-5 pb-4"
                  style={{ fontFamily: 'NanumBarunGothic' }}
                >
                  Aztra를 사용하는 멋진 서버들을 둘러보고, 여러분의 서버도
                  소개해보세요!
                </div>
                <Button
                  variant="aztra"
                  size="lg"
                  className="fw-bold"
                  style={{
                    fontFamily: 'NanumSquare',
                    width: 220,
                    boxShadow: '0 0 15px 7px rgba(111, 63, 173, 0.8)',
                  }}
                  href="https://forms.gle/DHEXxij9K3go7fBL8"
                  target="_blank"
                >
                  지금 신청하기
                </Button>
              </Col>
            </Row>
          </Container>
          <Container
            fluid
            className="text-white bg-aztra-dark py-4"
            style={{ padding: '0 8%' }}
          >
            <Row className="justify-content-center my-5 pb-5">
              <div className="text-center">
                <h3 className="pb-2" style={{ fontFamily: 'NanumSquare' }}>
                  파트너 서버로 등록되면 다음과 같은 혜택이 주어집니다!
                </h3>
                <div>혜택은 앞으로 계속해서 추가됩니다.</div>
              </div>
            </Row>
            <Row className="pb-5">
              {(
                [
                  [
                    '새 기능 체험 및 피드백',
                    '누구보다도 먼저 Aztra의 새 기능을 체험하세요! 개발자와 실시간으로 소통하고 오류 제보 또는 개선을 요청할 수 있습니다!',
                    NewReleasesIcon,
                  ],
                  [
                    'Aztra Partners 서버 초대',
                    'Aztra 개발자와 파트너 서버의 운영진들이 모인 서버에 초대해드립니다. 서로의 서버를 자랑하고, 개발자와 편하게 소통하세요!',
                    ForumIcon,
                  ],
                  [
                    '서버 홍보',
                    'Aztra 사이트에 서버가 등록되어 여러분의 서버를 소개하고 홍보할 수 있습니다!',
                    ShareIcon,
                  ],
                  [
                    '개발자 방문 서비스',
                    '봇 사용중 해결하기 어려운 문제 발생시 개발자가 직접 방문하여 원인 분석과 문제 해결을 진행합니다.',
                    BusinessCenterIcon,
                    3,
                  ],
                ] as Array<[string, string, any, number | undefined]>
              ).map((o, i) => (
                <Col
                  xs={12}
                  lg={6}
                  xl={3}
                  key={i}
                  className="px-4 mb-5"
                  style={{ fontFamily: 'NanumSquare' }}
                >
                  <Card
                    className="shadow h-100 p-1"
                    style={{
                      background: 'linear-gradient(210deg, #A566FF, #8041D9)',
                    }}
                  >
                    <Card.Body>
                      <Card.Title
                        className="d-flex align-items-center fw-bold mb-3"
                        style={{ fontFamily: 'NanumSquare' }}
                      >
                        {React.createElement(o[2], { className: 'me-2' })}
                        {o[0]}
                        {o[3] && (
                          <Badge bg="aztra" className="ms-2">
                            레벨{o[3]}↑
                          </Badge>
                        )}
                      </Card.Title>
                      <Card.Text>{o[1]}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row>
              {/* 
                data?.sort((a, b) => Number(b.bot_joined) - Number(a.bot_joined)).map(one => (
                  <Col key={one.id} xs={12} md={6} xl={4} className="mb-4 mb-xl-5 px-xl-4">
                    <Card bg="dark" className="shadow mh-100 w-100 px-3 pt-4">
                      <Row className="align-items-center pb-4">
                        <Col xs={12} sm="auto" className={`text-center pb-3 pb-sm-0 pr-0 ${one.icon ? 'pl-0 pl-sm-3' : 'pl-1'}`}>
                          <div style={{ height: 64 }}>
                            {one.icon && <Card.Img variant="top" src={`https://cdn.discordapp.com/icons/${one.id}/${one.icon}.png`} className="rounded-circle" style={{ height: 64, width: 64 }} />}
                          </div>
                        </Col>
                        <Col className="px-0">
                          <Card.Body className="py-0">
                            <Card.Title className="fw-bold text-center text-sm-left mb-1" style={{ fontFamily: 'NanumSquare', fontSize: 22 }}>
                              {one.name}
                            </Card.Title>
                            <Card.Text>
                              <div className="d-flex align-items-center justify-content-center justify-content-sm-start">
                                <div className="me-2 rounded-circle" style={{ width: 10, height: 10, backgroundColor: 'lime' }} />
                                <small>000 멤버 온라인, 000 멤버</small>
                              </div>
                            </Card.Text>
                          </Card.Body>
                        </Col>
                      </Row>
                      <Row className="px-2 pb-4" style={{ fontSize: 15, minHeight: 120 }}>
                        <Col>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget vestibulum elit, sed tempor erat. Suspendisse eu tellus venenatis diam suscipit auctor.
                        </Col>
                      </Row>
                      <Row>
                        <Button variant="aztra-dark" className="w-100">참가하기</Button>
                      </Row>
                    </Card>
                  </Col>
                ))
                */}
            </Row>
          </Container>
          <Container
            fluid
            className="text-white pt-4"
            style={{ padding: '0 12% 100px 12%' }}
          >
            <Row className="text-center my-5 pb-5">
              <h3 style={{ fontFamily: 'NanumSquare' }}>
                파트너 서버 요건 및 유의 사항
              </h3>
            </Row>
            <Row className="mb-5 justify-content-center">
              <Col xs="auto">
                <Card bg="dark" className="shadow p-1">
                  <Card.Body>
                    <Card.Title as="h4" className="text-center">
                      필수 조건
                    </Card.Title>
                    <hr
                      className="mt-0 mb-4"
                      style={{ borderColor: '#4e5058', borderWidth: 2 }}
                    />
                    <Row className="d-lg-flex justify-content-center">
                      <Col xs={12} lg={6}>
                        <p>
                          - 아래 조건을 <b>모두</b> 만족해야 합니다.
                        </p>
                        <ul style={{ lineHeight: 1.8 }}>
                          <li>
                            Aztra를 주 관리봇 또는 보조 관리봇으로 사용해야
                            합니다.
                          </li>
                          <li>
                            Aztra를 신청일로부터 적어도 1개월 이상 사용해야
                            합니다.
                          </li>
                          <li>
                            누구나 참여할 수 있는 공개 서버여야 하며, 서버의
                            방향성이 뚜렷하고 깨끗한 운영이 이루어져야 합니다.
                          </li>
                        </ul>
                      </Col>
                      <Col xs={12} lg={6}>
                        <p>
                          - 아래 <b>금지 사항에 해당하지 않아야</b> 합니다.
                        </p>
                        <ul style={{ lineHeight: 1.8 }}>
                          <li>
                            불법 프로그램(게임 핵 등)을 판매하거나 취급하는 서버
                          </li>
                          <li>불법 음란물을 판매하거나 유포하는 서버</li>
                          <li>
                            Aztra의 기능을 본래 목적과 다르게 악용하거나
                            버그/오류를 악용한 서버
                          </li>
                          <li>
                            <a
                              href="https://discord.com/terms"
                              rel="noreferrer"
                              target="_blank"
                              style={{ color: 'deepskyblue' }}
                            >
                              디스코드 약관(ToS)
                            </a>
                            이나{' '}
                            <a
                              href="https://discord.com/privacy"
                              rel="noreferrer"
                              target="_blank"
                              style={{ color: 'deepskyblue' }}
                            >
                              디스코드 개인정보 취급방침
                            </a>
                            을 위배하는 사항이 있는 서버
                          </li>
                          <li>
                            그 외 대한민국 현행법에 저촉되는 사항이 있는 서버
                          </li>
                        </ul>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={4} className="mb-4">
                <Card bg="aztra-dark" className="shadow h-100 p-1">
                  <Card.Body>
                    <Card.Title as="h4" className="pb-2">
                      파트너 레벨 1
                    </Card.Title>
                    <p>추가적으로 아래 조건을 모두 만족해야 합니다.</p>
                    <ul>
                      <li>
                        <p>
                          멤버 수:
                          <br />
                          <b>500 멤버 이상</b>이여야 합니다.
                        </p>
                      </li>
                      <li>
                        <p>
                          평균 성장세:
                          <br />
                          최근 일주일동안 멤버 증가량이 <b>25 멤버 이상</b>
                          이여야 합니다. (봇 제외)
                        </p>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4} className="mb-4">
                <Card bg="aztra-dark" className="shadow h-100 p-1">
                  <Card.Body>
                    <Card.Title as="h4" className="pb-2">
                      파트너 레벨 2
                    </Card.Title>
                    <p>추가적으로 아래 조건을 모두 만족해야 합니다.</p>
                    <ul>
                      <li>
                        <p>
                          멤버 수:
                          <br />
                          <b>3천 멤버 이상</b>이여야 합니다.
                        </p>
                      </li>
                      <li>
                        <p>
                          메시지 수:
                          <br />
                          <i>
                            아직 미정이며, 추후 심사를 통해 기준을 확정할
                            예정입니다.
                          </i>
                        </p>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} lg={4} className="mb-4">
                <Card bg="aztra-dark" className="shadow h-100 p-1">
                  <Card.Body>
                    <Card.Title as="h4" className="pb-2">
                      파트너 레벨 3
                    </Card.Title>
                    <p>추가적으로 아래 조건을 모두 만족해야 합니다.</p>
                    <ul>
                      <li>
                        <p>
                          멤버 수:
                          <br />
                          <b>1만 멤버 이상</b>이여야 합니다.
                        </p>
                      </li>
                      <li>
                        <p>
                          메시지 수:
                          <br />
                          <i>
                            아직 미정이며, 추후 심사를 통해 기준을 확정할
                            예정입니다.
                          </i>
                        </p>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Layout>
    </>
  );
};

export default Partners;
