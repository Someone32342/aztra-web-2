import React, { Component, createRef } from 'react'
import { Container, Row, Col, Button, Modal } from 'react-bootstrap'

import Sidebar from './Sidebar'
import axios from 'axios'
import urljoin from 'url-join'
import api from 'datas/api'
import { PartialGuild } from 'types/DiscordTypes'
import Cookies from 'universal-cookie'

interface DashboardLayoutProps {
  guildId: string
  children?: ((guild: PartialGuild | null) => React.ReactNode)
}

interface DashboardLayoutState {
  guild: PartialGuild | null
  fetchDone: boolean
  sidebarOpen: boolean
  winWidth: number | null
  winHeight: number | null
  guildCache: PartialGuild | null
}

export default class DashboardLayout extends Component<DashboardLayoutProps, DashboardLayoutState> {
  state: DashboardLayoutState = {
    guild: null,
    fetchDone: false,
    sidebarOpen: false,
    winWidth: null,
    winHeight: null,
    guildCache: null
  }

  sidebarHeaderRef: React.RefObject<HTMLDivElement> = createRef()
  mounted: boolean = false

  getGuild = async (token: string) => {
    await axios.get(urljoin(api, '/discord/users/@me/guilds'), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        let guild = res.data.find((one: PartialGuild) => one.id === this.props.guildId)

        if (this.mounted) this.setState({ guild, guildCache: guild })
        if (this.state.guild) localStorage.setItem('guildCache', JSON.stringify(guild))
      })
      .catch(e => {
        if (this.mounted) this.setState({ guild: null })
        console.log(e)
      })
      .finally(() => {
        if (this.mounted) this.setState({ fetchDone: true })
      })
  }

  componentDidMount() {
    this.mounted = true
    this.updateWindowState()
    window.addEventListener('resize', this.updateWindowState)

    const guildCacheString = localStorage.getItem('guildCache')
    this.setState({ guildCache: guildCacheString === null ? null : JSON.parse(guildCacheString) })

    const token = new Cookies().get("ACCESS_TOKEN")
    if (token) {
      this.getGuild(token)
    }
  }

  componentWillUnmount() {
    this.mounted = false
    window.removeEventListener('resize', this.updateWindowState)
  }

  updateWindowState = () => {
    this.setState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight
    })
  }

  closeSidebar = () => this.setState({ sidebarOpen: false })

  render() {
    const { children } = this.props
    const { guild, guildCache } = this.state

    const isXSsize = (this.state?.winWidth || 0) < 768

    return (
      <Container fluid>
        <Row>
          {/* 대시보드 사이드바 */}
          <Col xl={2} lg={3} md={3} className="Dashboardroute-sidebar">

            <Container className="pl-0 pr-0 pb-1" id="sidebar-header">
              {/* 사이드바 헤더 */}
              <Row>
                <Col xs={isXSsize ? 10 : 12} md={12} ref={this.sidebarHeaderRef}>
                  <div className="d-flex pl-1 font-weight-bold align-items-center"
                    style={{
                      fontSize: '1.05rem',
                      fontFamily: "NanumSquare",
                    }}
                  >
                    {
                      ((guildCache || guild)?.id === this.props.guildId) && (
                        <img
                          alt=""
                          src={
                            guildCache?.id === this.props.guildId
                              ? `https://cdn.discordapp.com/icons/${guildCache?.id}/${guildCache?.icon}.png`
                              : `https://cdn.discordapp.com/icons/${guild?.id}/${guild?.icon}.png`
                          }
                          style={{ maxHeight: 40, marginRight: 15, borderRadius: '70%' }}
                        />
                      )
                    }
                    {
                      guild
                        ? guild.name
                        : guildCache?.id === this.props.guildId
                          ? guildCache?.name
                          : '서버 정보를 불러오는 중...'
                    }
                  </div>
                </Col>
                <Col xs={isXSsize ? 2 : 0} className="text-center my-auto pl-1 d-md-none">
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-controls="sidebar-collapse"
                    aria-expanded={this.state.sidebarOpen}
                    onClick={() => this.setState({ sidebarOpen: !this.state.sidebarOpen })}
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
                        this.state.sidebarOpen && (
                          <div className="Dashboardroute-sidebar-body">
                            <Sidebar guild={guild || guildCache!} onSelect={this.closeSidebar} />
                          </div>
                        )
                      )
                      : (
                        <div className="Dashboardroute-sidebar-body" style={{
                          height: `calc(100vh - ${this.sidebarHeaderRef.current?.clientHeight}px - 90px)`
                        }}>
                          <Sidebar guild={guild || guildCache!} onSelect={this.closeSidebar} />
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
        <Modal className="modal-dark" show={this.state.fetchDone && !guild} centered onHide={() => { }}>
          <Modal.Header>
            <Modal.Title style={{ fontFamily: "NanumSquare" }}>
              서버를 찾을 수 없습니다!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            사용자가 들어가있지 않는 서버이거나 관리자 권한이 없는 서버입니다!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="info" href="/servers">서버 목록으로</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    )
  }
}