import React, { useEffect, useRef, useState } from 'react'
import { Badge, Button, Col, Container, OverlayTrigger, Popover, Row, Spinner } from 'react-bootstrap'
import { Assessment as AssessmentIcon, Image as ImageIcon, Help as HelpIcon } from '@material-ui/icons'
import { Bar, Line } from 'react-chartjs-2'
import { GetServerSideProps, NextPage } from 'next'
import DashboardLayout from 'components/DashboardLayout'
import Layout from 'components/Layout'

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import Head from 'next/head'
import { MemberCount, MsgCount } from 'types/dbtypes'
import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import useSWR from 'swr'
import Cookies from 'universal-cookie'
import urljoin from 'url-join'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

export interface StatisticsProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<StatisticsProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Statistics: NextPage<StatisticsProps> = ({ guildId }) => {
  const memberCountChartRef = useRef<Line>(null)
  const msgCountChartRef = useRef<Line>(null)
  const [isXS, setIsXS] = useState<boolean | null>(null)

  const { data: memberCounts } = useSWR<MemberCount[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/statistics/membercounts`) : null,
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

  const { data: msgCounts } = useSWR<MsgCount[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/statistics/msgcounts`) : null,
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

  const msgCountsDts = Array.from(new Set(msgCounts?.map(o => o.dt.split('T')[0]))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const chartDownload = (ref: React.RefObject<Line>) => {
    let url = ref.current?.chartInstance.toBase64Image()

    const link = document.createElement('a')
    link.href = url
    link.download = "chart.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const memberCountsCSVDownload = () => {
    let csvData = "날짜, 멤버 수\n" + memberCounts?.map(o => `${dayjs.utc(o.dt).local().format('MM-DD')} ${o.count}`).join('\n')
    const file = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = "chart.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const msgCountsCSVDownload = () => {
    let csvData = "날짜, 메시지 수\n" + msgCountsDts?.map(o => `${dayjs.utc(o).local().format('MM-DD')} ${msgCounts?.filter(a => a.dt.split('T')[0] === o)?.reduce((a, b) => a + b.count, 0)}`).join('\n')
    const file = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = "chart.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    setIsXS(window.innerWidth < 768)
  }, [])

  const CHART_OPTIONS = {
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0
      }
    },
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: "#4a4a4a",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: isXS ? 8 : 20,
          fontColor: "lightgrey",
          fontSize: 12,
          fontFamily: 'NanumSquare',
          padding: 10
        },
      }],
      yAxes: [{
        gridLines: {
          color: "#4a4a4a"
        },
        ticks: {
          fontColor: "lightgrey",
          fontFamily: 'NanumSquare',
          fontSize: 14,
          precision: 0
        },
      }],
    }
  }

  const MSG_TIMELINE_CHART_OPTIONS = {
    spanGaps: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
          color: "#3e3e3e",
          offsetGridLines: false
        },
        ticks: {
          autoSkip: true,
          fontColor: "lightgrey",
          fontSize: 12,
          fontFamily: 'NanumSquare',
          padding: 10,
        },
      }],
      yAxes: [{
        gridLines: {
          color: "#3e3e3e"
        },
        ticks: {
          fontColor: "lightgrey",
          fontFamily: 'NanumSquare',
          fontSize: 14,
          precision: 0,
        }
      }],
    }
  }

  console.log(msgCounts)

  const isMsgCountsAvailable = !!msgCountsDts?.find(o => dayjs.utc(o).isBefore(dayjs(new Date().setHours(0, 0, 0, 0))))

  return (
    <>
      <Head>
        <title>서버 통계 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => memberCounts && msgCounts ? (
              <>
                <Row className="dashboard-section">
                  <div>
                    <h3>
                      서버 통계
                      <Badge variant="aztra" className="ml-2 mb-auto mt-1" style={{ fontSize: 15 }}>베타</Badge>
                    </h3>
                    <div className="py-2">
                      서버의 각종 통계를 보여줍니다. Aztra가 초대된 이후에 정보 수집이 시작됩니다.
                    </div>
                  </div>
                </Row>
                <Row>
                  <Col xl={6} className="mb-4">
                    <div className="d-lg-flex align-items-center">
                      <div className="d-flex">
                        <h4 className="mb-2">멤버수 통계</h4>
                        <div>
                          <OverlayTrigger
                            trigger="hover"
                            overlay={
                              <Popover id="auto-task-process-popover">
                                <Popover.Title>
                                  멤버수 통계
                                </Popover.Title>
                                <Popover.Content>
                                  최근 한달간의 멤버수 변화를 보여줍니다. 매일 자정에 업데이트됩니다.
                                </Popover.Content>
                              </Popover>
                            } delay={{
                              show: 200,
                              hide: 150
                            }}>
                            <HelpIcon className="cursor-pointer ml-3" htmlColor="grey" />
                          </OverlayTrigger>
                        </div>
                      </div>
                      <div className="ml-auto d-lg-flex mt-auto mb-2">
                        <Button className="mx-1 my-1 d-flex align-items-center" disabled={!memberCounts.length} variant="info" size="sm" onClick={() => chartDownload(memberCountChartRef)} >
                          <ImageIcon className="mr-2" />
                          이미지 다운로드
                        </Button>
                        <Button className="mx-1 my-1 d-flex align-items-center" disabled={!memberCounts.length} variant="outline-success" size="sm" onClick={memberCountsCSVDownload} >
                          <AssessmentIcon className="mr-2" />
                          엑셀 다운로드
                        </Button>
                      </div>
                    </div>
                    <div style={{
                      height: 320
                    }}>
                      {
                        memberCounts.length > 0
                          ? <Line
                            ref={memberCountChartRef}
                            data={{
                              labels: memberCounts?.map(o => dayjs.utc(o.dt).local().format('MM-DD')).slice(0, 30),
                              datasets: [{
                                borderColor: 'rgb(127, 70, 202)',
                                backgroundColor: 'rgba(127, 70, 202, 0.15)',
                                data: memberCounts?.map(o => o.count).slice(0, 30)
                              }]
                            }}
                            options={CHART_OPTIONS}
                          />
                          : <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="my-4 text-center" style={{ color: 'lightgray' }}>
                              <div>아직 데이터가 충분하지 않습니다!</div>
                              <small>초대 후 <b>하루</b> 이상은 지나야 합니다.</small>
                            </div>
                          </div>
                      }
                    </div>
                  </Col>
                  <Col xl={6} className="mb-4">
                    <div className="d-lg-flex align-items-center">
                      <div className="d-flex">
                        <h4 className="mb-2">메시지량 통계</h4>
                        <div>
                          <OverlayTrigger
                            trigger="hover"
                            overlay={
                              <Popover id="auto-task-process-popover">
                                <Popover.Title>
                                  메시지량 통계
                                </Popover.Title>
                                <Popover.Content>
                                  최근 한달간의 하루 전체 메시지량을 보여줍니다. 매일 자정에 업데이트됩니다.
                                </Popover.Content>
                              </Popover>
                            }
                            delay={{
                              show: 200,
                              hide: 150
                            }}>
                            <HelpIcon className="cursor-pointer ml-3" htmlColor="grey" />
                          </OverlayTrigger>
                        </div>
                      </div>
                      <div className="ml-auto d-lg-flex mt-auto mb-2">
                        <Button variant="info" disabled={!isMsgCountsAvailable} className="mx-1 my-1 d-flex align-items-center" size="sm" onClick={() => chartDownload(msgCountChartRef)} >
                          <ImageIcon className="mr-2" />
                          이미지 다운로드
                        </Button>
                        <Button variant="outline-success" disabled={!isMsgCountsAvailable} className="mx-1 my-1 d-flex align-items-center" size="sm" onClick={msgCountsCSVDownload} >
                          <AssessmentIcon className="mr-2" />
                          엑셀 다운로드
                        </Button>
                      </div>
                    </div>
                    <div style={{
                      height: 320
                    }}>
                      {
                        isMsgCountsAvailable
                          ? <Line
                            ref={msgCountChartRef}
                            data={{
                              labels: msgCountsDts
                                ?.filter(o => dayjs.utc(o.split('T')[0]) < dayjs.utc(new Date().setUTCHours(0, 0, 0, 0)))
                                .slice(-30)
                                .map(o => dayjs.utc(o).local().format('MM-DD')),
                              datasets: [{
                                borderColor: 'rgb(127, 70, 202)',
                                backgroundColor: 'rgba(127, 70, 202, 0.15)',
                                data: msgCountsDts
                                  ?.filter(o => dayjs.utc(o.split('T')[0]) < dayjs.utc(new Date().setUTCHours(0, 0, 0, 0)))
                                  .slice(-30)
                                  .map(o => msgCounts?.filter(a => a.dt.split('T')[0] === o).reduce((a, b) => a + b.count, 0))
                              }]
                            }}
                            options={CHART_OPTIONS}
                          />
                          : <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="my-4 text-center" style={{ color: 'lightgray' }}>
                              <div>아직 데이터가 충분하지 않습니다!</div>
                              <small>초대 후 <b>하루</b> 이상은 지나야 합니다.</small>
                            </div>
                          </div>
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col className="mb-4">
                    <div className="d-lg-flex align-items-center">
                      <div className="d-flex">
                        <h4 className="mb-2">시간대별 메시지 수</h4>
                        <div>
                          <OverlayTrigger
                            trigger="hover"
                            overlay={
                              <Popover id="auto-task-process-popover">
                                <Popover.Title>
                                  시간대별 메시지 수
                                </Popover.Title>
                                <Popover.Content>
                                  1시간 간격으로 어제 메시지 수를 보여줍니다. 매일 자정에 업데이트됩니다.
                                </Popover.Content>
                              </Popover>
                            } delay={{
                              show: 200,
                              hide: 150
                            }}>
                            <HelpIcon className="cursor-pointer ml-3" htmlColor="grey" />
                          </OverlayTrigger>
                        </div>
                      </div>
                      <div className="ml-auto d-lg-flex mt-auto mb-2">
                        <Button className="mx-1 my-1 d-flex align-items-center" disabled={!isMsgCountsAvailable} variant="info" size="sm" onClick={() => chartDownload(memberCountChartRef)} >
                          <ImageIcon className="mr-2" />
                          이미지 다운로드
                        </Button>
                        <Button className="mx-1 my-1 d-flex align-items-center" disabled={!isMsgCountsAvailable} variant="outline-success" size="sm" onClick={memberCountsCSVDownload} >
                          <AssessmentIcon className="mr-2" />
                          엑셀 다운로드
                        </Button>
                      </div>
                    </div>
                    <div style={{
                      height: 320
                    }}>
                      {
                        isMsgCountsAvailable
                          ? <Bar
                            ref={memberCountChartRef}
                            data={{
                              labels: Array.from(Array(49).keys()).map(o => o % 2 === 0 ? o / 2 : ''),
                              datasets: [{
                                borderColor: 'rgb(127, 70, 202)',
                                backgroundColor: 'rgb(127, 70, 202)',
                                data: Array.from(Array(49).keys())
                                  .map(o =>
                                    o % 2 !== 0
                                      ? msgCounts
                                        .filter(a => dayjs.utc(a.dt).isSame(dayjs.utc(new Date().setHours(o / 2, 0, 0, 0)).subtract(1, 'days')))
                                        .reduce((a, b) => a + b.count, 0)
                                      : null
                                  )
                              }]
                            }}
                            options={MSG_TIMELINE_CHART_OPTIONS}
                          />
                          : <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="my-4 text-center" style={{ color: 'lightgray' }}>
                              <div>아직 데이터가 충분하지 않습니다!</div>
                              <small>초대 후 <b>하루</b> 이상은 지나야 합니다.</small>
                            </div>
                          </div>
                      }
                    </div>
                  </Col>
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

export default Statistics