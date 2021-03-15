import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Col, Button, Modal } from 'react-bootstrap'

import Sidebar from './Sidebar'
import axios, { AxiosError } from 'axios'
import urljoin from 'url-join'
import api from 'datas/api'
import { PartialGuildExtend } from 'types/DiscordTypes'
import Cookies from 'universal-cookie'
import styles from 'styles/components/DashboardLayout.module.scss'
import useSWR from 'swr'

interface DashboardLayoutProps {
  guildId: string
  children?: ((guild?: PartialGuildExtend | null) => React.ReactNode)
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ guildId, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [winWidth, setWinWidth] = useState<number | null>(null)

  const sidebarHeaderRef = useRef<HTMLDivElement>(null)

  const { data, error } = useSWR<PartialGuildExtend[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/users/@me/guilds`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const guild = data?.find(one => one.id === guildId && one.bot_joined)

  useEffect(() => {
    const updateWindowState = () => {
      setWinWidth(window.innerWidth)
    }
    updateWindowState()
    window.addEventListener('resize', updateWindowState)
    return () => window.removeEventListener('resize', updateWindowState)
  })

  const closeSidebar = () => setSidebarOpen(false)

  const isXSsize = (winWidth || 0) < 768

  return (
    <Container fluid className={styles.DashboardLayoutContainer}>
      <Row>
        {/* 대시보드 사이드바 */}
        <Col xl={2} lg={3} md={3} className="Dashboardroute-sidebar">

          <Container className="pl-0 pr-0 pb-1" id="sidebar-header">
            {/* 사이드바 헤더 */}
            <Row>
              <Col xs={isXSsize ? 10 : 12} md={12} ref={sidebarHeaderRef}>
                <div className="d-flex pl-1 font-weight-bold align-items-center"
                  style={{
                    fontSize: '1.05rem',
                    fontFamily: "NanumSquare",
                  }}
                >
                  {
                    (guild?.id === guildId) && (
                      <img
                        alt=""
                        src={`https://cdn.discordapp.com/icons/${guild?.id}/${guild?.icon}.png`}
                        style={{ maxHeight: 40, marginRight: 15, borderRadius: '70%' }}
                      />
                    )
                  }
                  {guild?.name ?? '서버 정보를 불러오는 중...'}
                </div>
              </Col>
              <Col xs={isXSsize ? 2 : 0} className="text-center my-auto pl-1 d-md-none">
                <Button
                  size="sm"
                  variant="secondary"
                  aria-controls="sidebar-collapse"
                  aria-expanded={sidebarOpen}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    fontSize: '9pt'
                  }}
                >
                  메뉴
                  </Button>
              </Col>
            </Row>
            {/* 사이드바 본문 */}
            <Row>
              <Col>
                {
                  isXSsize
                    ? (
                      sidebarOpen && (
                        <div className="Dashboardroute-sidebar-body">
                          <Sidebar guild={guild} onSelect={closeSidebar} />
                        </div>
                      )
                    )
                    : (
                      <div className="Dashboardroute-sidebar-body" style={{
                        height: `calc(100vh - ${sidebarHeaderRef.current?.clientHeight}px - 90px)`
                      }}>
                        <Sidebar guild={guild} onSelect={closeSidebar} />
                      </div>
                    )
                }
              </Col>
            </Row>
          </Container>
        </Col>

        {/* 대시보드 본문 */}
        <Col xl={10} lg={9} md={9} className="Dashboardroute-body">
          {children ? children(guild) : null}
        </Col>
      </Row>
      <Modal className="modal-dark" show={error?.response?.status === 404} centered onHide={() => { }}>
        <Modal.Header>
          <Modal.Title style={{ fontFamily: "NanumSquare" }}>
            서버를 찾을 수 없습니다!
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            서버를 불러오는 데 실패했습니다! 다음 중 하나는 아닌지 확인해주세요.
            </p>
          <ul>
            <li>사용자가 들어가있지 않은 서버</li>
            <li>Aztra가 들어가있지 않은 서버</li>
            <li>사용자에게 관리자 권한이 없는 경우</li>
            <li>존재하지 않는 서버</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" href="/servers">서버 목록으로</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default DashboardLayout