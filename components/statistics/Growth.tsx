import dayjs from "dayjs"
import React, { useEffect, useRef, useState } from "react"
import { Button, Card, Col, Container, Form, OverlayTrigger, Popover, Row } from "react-bootstrap"
import { Line, Bar } from "react-chartjs-2"
import { Assessment as AssessmentIcon, Image as ImageIcon, Help as HelpIcon } from '@material-ui/icons'
import { MemberCount, MsgCount } from 'types/dbtypes'

interface GrowthProps {
  memberCounts: MemberCount[]
  msgCounts: MsgCount[]
}

const Growth: React.FC<GrowthProps> = ({ memberCounts, msgCounts }) => {
  const memberCountChartRef = useRef<Line>(null)
  const msgCountChartRef = useRef<Line>(null)
  const [isXS, setIsXS] = useState<boolean | null>(null)
  const [isLGP, setisLGP] = useState<boolean | null>(null)

  const [includeBot, setIncludeBot] = useState(false)

  useEffect(() => {
    const resize = () => {
      setIsXS(window.innerWidth < 768)
      setisLGP(window.innerWidth < 1500)
    }
    window.addEventListener('resize', resize)
    resize()
    return () => window.removeEventListener('resize', resize)
  }, [isXS, isLGP])

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
    let csvData = "날짜, 멤버 수\n" + Days
      ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
      .map(o => `${dayjs.utc(o).local().format('DD일')}, ${memberCounts.find(one => dayjs.utc(one.dt).local().format('YYYY-MM-DD') === o)?.count ?? 0}`)
      .join('\n')
    const file = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = "chart.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const msgCountsCSVDownload = () => {
    let csvData = "날짜, 메시지 수\n" + Days
      ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
      .map(o => `${dayjs.utc(o).local().format('DD일')}, ${msgCounts?.filter(a => a.dt.split('T')[0] === o).reduce((a, b) => a + b.count_user + (includeBot ? b.count_bot : 0), 0)}`)
      .join('\n')
    const file = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = "chart.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const msgTimeLineCSVDownload = () => {
    let csvData = "시간, 메시지 수\n" + Array.from(Array(24).keys())
      .map(o => {
        const nowHours = new Date().getHours()
        let hours = o + nowHours - 23
        const counts = msgCounts
          ?.filter(a => dayjs.utc(a.dt).isSame(dayjs.utc(new Date().setHours(0, 0, 0, 0)).add(hours, 'hours')))
          .reduce((a, b) => a + b.count_user + (includeBot ? b.count_bot : 0), 0)

        if (hours < 0) {
          hours += 23 + Math.ceil(Math.abs(hours) / 24)
        }
        return `${hours}-${hours + 1}시, ${counts}`
      })
      .join('\n')
    const file = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = "chart.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const DAYLIMIT_DEFAULT = 30

  const Days = Array.from(Array(DAYLIMIT_DEFAULT).keys()).map(n => dayjs().subtract(DAYLIMIT_DEFAULT - n, 'days').format('YYYY-MM-DD'))

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
          maxTicksLimit: isXS ? 8 : isLGP ? 10 : 20,
          fontColor: "lightgrey",
          fontSize: 12,
          fontFamily: 'NanumSquare',
          padding: 10,
          maxRotation: 0
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
          precision: 0,
          min: 0
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
          min: 0
        }
      }],
    }
  }

  return <Container fluid>
    <Row className="pb-4 justify-content-end">
      <Col>
        <Card bg="dark">
          <Card.Body className="py-2">
            <Form.Check id="include-bot-checkbox" custom type="checkbox" label={<span className="pl-2 font-weight-bold">봇 포함하기</span>} checked={includeBot} onChange={() => setIncludeBot(!includeBot)} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col xs={12} xl={6} className="mb-4">
        <div className="d-sm-flex align-items-center mb-2">
          <div className="d-flex">
            <h4 className="my-auto">멤버수 통계</h4>
            <div>
              <OverlayTrigger
                trigger="hover"
                overlay={
                  <Popover id="auto-task-process-popover">
                    <Popover.Title>
                      일별 멤버수 통계
                    </Popover.Title>
                    <Popover.Content>
                      최근 30일간의 멤버수 변화를 보여줍니다. 매일 자정에 업데이트됩니다.
                    </Popover.Content>
                  </Popover>
                } delay={{
                  show: 200,
                  hide: 150
                }}>
                <HelpIcon className="cursor-pointer ml-1" htmlColor="grey" />
              </OverlayTrigger>
            </div>
          </div>
          <div className="ml-auto d-flex my-2 my-sm-auto">
            <Button className="mx-1 my-1 d-flex align-items-center" disabled={!memberCounts.length} variant="info" style={{ wordBreak: 'keep-all' }} size="sm" onClick={() => chartDownload(memberCountChartRef)} >
              <ImageIcon className="mr-2" />
              이미지 다운로드
            </Button>
            <Button className="mx-1 my-1 d-flex align-items-center" disabled={!memberCounts.length} variant="outline-success" style={{ wordBreak: 'keep-all' }} size="sm" onClick={memberCountsCSVDownload} >
              <AssessmentIcon />
            </Button>
          </div>
        </div>
        <div style={{
          height: 320
        }}>
          <Line
            ref={memberCountChartRef}
            data={{
              labels: Days
                ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
                .map(o => dayjs.utc(o).local().format('DD일')),
              datasets: [{
                borderColor: 'rgb(127, 70, 202)',
                backgroundColor: 'rgba(127, 70, 202, 0.15)',
                data: Days
                  ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
                  .map(o => memberCounts.find(one => dayjs.utc(one.dt).local().format('YYYY-MM-DD') === o)?.count ?? 0),
              }]
            }}
            options={CHART_OPTIONS}
          />
        </div>
      </Col>
      <Col xs={12} xl={6} className="mb-4">
        <div className="d-sm-flex align-items-center mb-2">
          <div className="d-flex">
            <h4 className="my-auto">메시지량 통계</h4>
            <div>
              <OverlayTrigger
                trigger="hover"
                overlay={
                  <Popover id="auto-task-process-popover">
                    <Popover.Title>
                      일별 메시지량 통계
                    </Popover.Title>
                    <Popover.Content>
                      최근 30일간의 하루 전체 메시지량을 보여줍니다. 매일 자정에 업데이트됩니다.
                    </Popover.Content>
                  </Popover>
                }
                delay={{
                  show: 200,
                  hide: 150
                }}>
                <HelpIcon className="cursor-pointer ml-1" htmlColor="grey" />
              </OverlayTrigger>
            </div>
          </div>
          <div className="ml-auto d-flex my-2 my-sm-auto">
            <Button variant="info" className="mx-1 my-1 d-flex align-items-center" style={{ wordBreak: 'keep-all' }} size="sm" onClick={() => chartDownload(msgCountChartRef)} >
              <ImageIcon className="mr-2" />
              이미지 다운로드
            </Button>
            <Button variant="outline-success" className="mx-1 my-1 d-flex align-items-center" style={{ wordBreak: 'keep-all' }} size="sm" onClick={msgCountsCSVDownload} >
              <AssessmentIcon />
            </Button>
          </div>
        </div>
        <div style={{
          height: 320
        }}>
          <Line
            ref={msgCountChartRef}
            data={{
              labels: Days
                ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
                .map(o => dayjs.utc(o).local().format('DD일')),
              datasets: [{
                borderColor: 'rgb(127, 70, 202)',
                backgroundColor: 'rgba(127, 70, 202, 0.15)',
                data: Days
                  ?.filter(o => dayjs.utc(o.split('T')[0]) <= dayjs(new Date().setHours(0, 0, 0, 0)))
                  .map(o => msgCounts?.filter(a => a.dt.split('T')[0] === o).reduce((a, b) => a + b.count_user + (includeBot ? b.count_bot : 0), 0))
              }]
            }}
            options={CHART_OPTIONS}
          />
        </div>
      </Col>
    </Row>
    <Row>
      <Col className="mb-4">
        <div className="d-sm-flex align-items-center mb-2">
          <div className="d-flex">
            <h4 className="my-auto">시간대별 메시지 수</h4>
            <div>
              <OverlayTrigger
                trigger="hover"
                overlay={
                  <Popover id="auto-task-process-popover">
                    <Popover.Title>
                      시간대별 메시지 수
                    </Popover.Title>
                    <Popover.Content>
                      1시간 간격으로 최근 메시지 수를 보여줍니다. 매시간 정각에 업데이트됩니다.
                    </Popover.Content>
                  </Popover>
                } delay={{
                  show: 200,
                  hide: 150
                }}>
                <HelpIcon className="cursor-pointer ml-1" htmlColor="grey" />
              </OverlayTrigger>
            </div>
          </div>
          <div className="ml-auto d-flex my-2 my-sm-auto">
            <Button className="mx-1 my-1 d-flex align-items-center" variant="info" style={{ wordBreak: 'keep-all' }} size="sm" onClick={() => chartDownload(memberCountChartRef)} >
              <ImageIcon className="mr-2" />
              이미지 다운로드
            </Button>
            <Button className="mx-1 my-1 d-flex align-items-center" variant="outline-success" style={{ wordBreak: 'keep-all' }} size="sm" onClick={msgTimeLineCSVDownload} >
              <AssessmentIcon />
            </Button>
          </div>
        </div>
        <div style={{
          height: 320
        }}>
          <Bar
            ref={memberCountChartRef}
            data={{
              labels: Array.from(Array(47).keys()).map(o => {
                if (o % 2 !== 0) return ''
                const nowHours = new Date().getHours()
                let hours = (o / 2) + nowHours - 23
                if (hours < 0) {
                  hours += 23 + Math.ceil(Math.abs(hours) / 24)
                }
                return hours
              }),
              datasets: [{
                borderColor: 'rgb(127, 70, 202)',
                backgroundColor: 'rgb(127, 70, 202)',
                data: Array.from(Array(47).keys())
                  .map(o => {
                    if (o % 2 == 0) return null
                    const nowHours = new Date().getHours()
                    let hours = Math.floor((o / 2) + nowHours - 23)
                    return msgCounts
                      .filter(a => dayjs.utc(a.dt).isSame(dayjs.utc(new Date().setHours(0, 0, 0, 0)).add(hours, 'hours')))
                      .reduce((a, b) => a + b.count_user + (includeBot ? b.count_bot : 0), 0)
                  }),
              }]
            }}
            options={MSG_TIMELINE_CHART_OPTIONS}
          />
        </div>
      </Col>
    </Row>
  </Container>
}

export default Growth