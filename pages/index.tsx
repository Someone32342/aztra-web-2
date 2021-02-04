import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link as ScrollLink } from 'react-scroll'

import styles from 'styles/Home.module.scss'
import classNames from 'classnames/bind';
import Layout from 'components/Layout';
import Link from 'next/link';
import Image from 'next/image'
import Head from 'next/head';
import React from 'react';
import useSWR from 'swr';
import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import numberWithCommas from 'utils/numberWithCommas';
import links from 'datas/links';

const cx = classNames.bind(styles)

export default function Home() {
  const { data } = useSWR<{ servers: number, days: number }, AxiosError>(
    `${api}/aztra/info`,
    url => axios.get(url).then(r => r.data),
    {
      refreshInterval: 10000
    }
  )

  return (
    <>
      <Head>
        <title>Aztra - 미래를 바꿀 디스코드 관리봇</title>
      </Head>
      <Layout>
        <Container fluid="sm">
          <div className={cx("MainIntro", "d-flex", "align-items-center")}>
            <div>
              <h1 className={cx("no-drag", "text-white", "text-center", "text-md-left")} style={{
                fontSize: '27pt',
                wordBreak: 'keep-all'
              }}>
                미래를 바꿀 디스코드 관리봇, Aztra
            </h1>
              <h2 className={cx("no-drag", "text-white", "pt-2", "pb-5", "font-weight-lighter", "text-center", "text-md-left")} style={{
                fontSize: '15pt'
              }}>
                다채롭고 깔끔한 디스코드 서버를 만들 수 있도록 도와드리겠습니다.
            </h2>
              <div className="text-center text-md-left">
                <Link href="/servers">
                  <Button variant="aztra" size="lg" className={cx("MainButton", "shadow-lg", "mr-md-3")}>
                    초대하기
                </Button>
                </Link>
                <Button className={cx("MainButton", "shadow-lg", "mx-2")} as={ScrollLink} to="features-begin" spy={true} smooth={true} offset={50} duration={500} variant="dark" size="lg">
                  자세히 알아보기
              </Button>
              </div>
            </div>
          </div>
        </Container>
        <div id="features-begin" style={{ marginTop: '-58px', marginBottom: 58 }} />
        <div id="statistics" className={cx("MainStatistics")}>
          <div style={{ background: "linear-gradient(210deg, #6799FF, #4375DB)", height: '60vh' }}>
            <Container className="h-100">
              <Row className="justify-content-center align-items-center h-100 py-5">
                <Col className="text-center" sm={12} lg="auto">
                  <div className={cx("font-weight-bold", "text-white", "MainStatisticsTitle")}>계속해서 성장하는 Aztra를 살펴보세요</div>
                </Col>
                <Col lg={{ offset: 1 }} className="text-center text-lg-left">
                  <div>
                    <div className="py-4">
                      <div className={cx("UsingServersTitle")}>사용 중인 서버</div>
                      <div className={cx("UsingServersCount")}>{numberWithCommas(data?.servers ?? 0)}</div>
                    </div>
                    <div className="py-4">
                      <div className={cx("UsingServersTitle")}>Aztra 출시일로부터</div>
                      <div className={cx("UsingServersCount")}>{data?.days}일</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
        <div style={{ height: '40vh' }}>
          <Container className="h-100">
            <Row className="h-100 justify-content-center align-items-center">
              <div className="d-md-flex align-items-center">
                <img className="d-none d-md-block" src="/assets/images/discord-logo-white.png" style={{ width: 100 }} />
                <div className="text-white px-4" style={{ fontFamily: "NanumSquare", fontSize: 30 }}>
                  <div className="font-weight-bold">도움이 필요하신가요?</div>
                  <div style={{ fontSize: 16, color: "darkgray" }}>문의 처리, 봇 소식 등을 확인하실 수 있습니다.</div>
                </div>
                <Button className="mx-4 my-3" variant="blurple" size="lg" style={{ fontFamily: "NanumSquare", fontWeight: 'bold' }} href={links.support}>서포트 서버 참여하기</Button>
              </div>
            </Row>
          </Container>
        </div>
        <div id="main-features" className={cx("MainFeatures")} >
          <div className={cx("MainFeaturesItem")} style={{
            background: "linear-gradient(210deg, #A566FF, #8041D9)"
          }}>
            <Container className="d-lg-flex align-items-center justify-content-between">
              <div className="d-flex justify-content-center">
                <Image className="shadow mx-auto" alt="경고 설정" src="/assets/images/Home/feat-warn.png" priority width={366} height={284} />
              </div>
              <div className={cx("MainFeaturesItemContent")}>
                <h1>국내 최초 대시보드 지원 관리봇</h1>
                <p>기존의 헷갈리고 복잡한 관리봇이 아닌, 사용자 친화적으로 설계된 쉬운 사용법으로 여러분의 서버를 더 성장시킬 수 있습니다.</p>
              </div>
            </Container>
          </div>
          <div className={cx("MainFeaturesItem")} style={{
            background: "linear-gradient(210deg, #E0844F, #F15F5F)"
          }}>
            <Container className="d-lg-flex align-items-center justify-content-between flex-row-reverse">
              <div className="d-flex justify-content-center">
                <Image className="text-lg-right" alt="모바일 환경" src="/assets/images/Home/mobile.png" priority width={300} height={611.34} />
              </div>
              <div className={cx("MainFeaturesItemContent")}>
                <h1>모바일에서도 불편함 없이 사용하세요</h1>
                <p>Aztra 대시보드는 모바일에서도 언제 어디서나 사용하기 편하도록 모바일 환경에도 신경써서 개발하고 있습니다.</p>
              </div>
            </Container>
          </div>
          <div className={cx("MainFeaturesItem")} style={{
            background: "linear-gradient(210deg, #5587ED, #8041D9)"
          }}>
            <Container className="d-lg-flex align-items-center justify-content-between">
              <div className="d-flex justify-content-center">
                <Image className="shadow" alt="멤버 관리" src="/assets/images/Home/member-manage.png" priority width={500} height={281.25} />
              </div>
              <div className={cx("MainFeaturesItemContent", "ml-lg-5")}>
                <h1>다양한 기능을 제공합니다</h1>
                <p>봇 명령어만으로 봇을 세팅하고 관리하는 것은 한계가 있습니다. 대시보드를 통해 명령어만으로는 경험하지 못했던 매우 다양한 기능들을 제공합니다.</p>
              </div>
            </Container>
          </div>
        </div>
      </Layout >
    </>
  )
}
