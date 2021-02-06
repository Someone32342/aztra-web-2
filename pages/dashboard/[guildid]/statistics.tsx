import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, OverlayTrigger, Popover, Row } from 'react-bootstrap'
import { Assessment as AssessmentIcon, Image as ImageIcon, Help as HelpIcon } from '@material-ui/icons'
import { Line } from 'react-chartjs-2'
import { GetServerSideProps, NextPage } from 'next'
import DashboardLayout from 'components/DashboardLayout'
import Layout from 'components/Layout'

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import Head from 'next/head'
import { MemberCount } from 'types/dbtypes'
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
  const [isXS, setIsXS] = useState<boolean | null>(null)

  const { data } = useSWR<MemberCount[], AxiosError>(
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
    let csvData = "날짜, 멤버 수\n" + data?.map(o => `${dayjs(o.dt).format('YYYY-MM-DD')} ${o.count}`).join('\n')
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

  const MEMBER_COUNT_CHART_OPTIONS = {
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
          stepSize: 1
        },
      }],
    }
  }

  const MESSAGE_COUNT_CHART_OPTIONS = {
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
        },
      }],
    }
  }

  return (
    <>
      <Head>
        <title>서버 통계 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => (
              <>
                <Row className="dashboard-section">
                  <h3>서버 통계</h3>
                </Row>
                <Row>
                  <Col xl={6}>
                    <div className="d-flex">
                      <h4 className="mb-3">멤버수 통계</h4>
                      <div>
                        <OverlayTrigger
                          trigger="hover"
                          overlay={
                            <Popover id="auto-task-process-popover">
                              <Popover.Title>
                                멤버수 통계
                            </Popover.Title>
                              <Popover.Content>
                                최근 한달간의 멤버수 변화를 보여줍니다.
                            </Popover.Content>
                            </Popover>
                          } delay={{
                            show: 200,
                            hide: 150
                          }}>
                          <HelpIcon className="cursor-pointer ml-3" htmlColor="grey" />
                        </OverlayTrigger>
                      </div>
                      <div className="ml-auto d-flex my-auto">
                        <Button className="mx-1 d-flex align-items-center" variant="info" size="sm" onClick={() => chartDownload(memberCountChartRef)} >
                          <ImageIcon className="mr-2" />
                          이미지 다운로드
                        </Button>
                        <Button className="mx-1 d-flex align-items-center" variant="outline-success" size="sm" onClick={memberCountsCSVDownload} >
                          <AssessmentIcon className="mr-2" />
                          엑셀 다운로드
                        </Button>
                      </div>
                    </div>
                    <div style={{
                      height: 320
                    }}>
                      <Line
                        ref={memberCountChartRef}
                        data={{
                          labels: data?.map(o => dayjs(o.dt).format('YYYY-MM-DD')),
                          datasets: [{
                            label: '멤버 수',
                            borderColor: 'rgb(127, 70, 202)',
                            backgroundColor: 'rgba(127, 70, 202, 0.15)',
                            data: data?.map(o => o.count)
                          }]
                        }}
                        options={MEMBER_COUNT_CHART_OPTIONS} />
                    </div>
                  </Col>
                  <Col xl={6}>
                    <div className="d-flex">
                      <h4 className="mb-3">메시지량 통계</h4>
                      <div>
                        <OverlayTrigger
                          trigger="hover"
                          overlay={
                            <Popover id="auto-task-process-popover">
                              <Popover.Title>
                                메시지량 통계
                              </Popover.Title>
                              <Popover.Content>
                                최근 한달간의 하루 전체 메시지량을 보여줍니다.
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
                      <div className="ml-auto d-flex my-auto">
                        <Button variant="info" className="mx-1 d-flex align-items-center" size="sm" onClick={() => chartDownload(memberCountChartRef)} >
                          <ImageIcon className="mr-2" />
                          이미지 다운로드
                        </Button>
                        <Button variant="outline-success" className="mx-1 d-flex align-items-center" size="sm" onClick={() => chartDownload(memberCountChartRef)} >
                          <AssessmentIcon className="mr-2" />
                          엑셀 다운로드
                        </Button>
                      </div>
                    </div>
                    <div style={{
                      height: 320
                    }}>
                      <Line
                        ref={memberCountChartRef}
                        data={{
                          labels: Array.from({ length: 20 }).map((_, index) => `11월 ${index + new Date().getDate() - 20}일`),
                          datasets: [{
                            label: '멤버 수',
                            borderColor: 'rgb(127, 70, 202)',
                            backgroundColor: 'rgba(127, 70, 202, 0.15)',
                            data: [412, 432, 417, 419, 394, 415, 481, 402, 491, 412, 418, 411, 418, 418, 412, 478, 422, 422, 421, 475]
                          }]
                        }}
                        options={MESSAGE_COUNT_CHART_OPTIONS} />
                    </div>
                  </Col>
                </Row>
              </>
            )
          }
        </DashboardLayout>
      </Layout>
    </>
  )
}

export default Statistics