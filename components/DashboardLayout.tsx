import React, { Component, createRef } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'

import Sidebar from './Sidebar'
import axios from 'axios'
import urljoin from 'url-join'
import api from '../datas/api'
import { Permissions } from 'discord.js'
import { PartialGuild } from '../types/DiscordTypes'
import { withRouter } from 'next/router'
import { WithRouterProps } from 'next/dist/client/with-router'
import Cookies from 'universal-cookie'

const swal = require('@sweetalert/with-react')

interface DashboardLayoutState {
  guild: PartialGuild | null
  fetchDone: boolean
  sidebarOpen: boolean
  winWidth: number | null
  winHeight: number | null
  guildCache: PartialGuild | null
}

class DashboardLayout extends Component<WithRouterProps, DashboardLayoutState> {
  state: DashboardLayoutState = {
    guild: null,
    fetchDone: false,
    sidebarOpen: false,
    winWidth: null,
    winHeight: null,
    guildCache: null
  }

  sidebarHeaderRef: React.RefObject<HTMLDivElement> = createRef()

  getGuild = async (token: string) => {
    await axios.get(urljoin(api, '/discord/users/@me/guilds'), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        let guild = res.data
          .filter((one: PartialGuild) => {
            let perms = new Permissions(Number(one.permissions))
            return perms.has(Permissions.FLAGS.ADMINISTRATOR)
          })
          .find((one: PartialGuild) => one.id === this.props.router.query.guildid)
        this.setState({ guild: guild })
        localStorage.setItem('guildCache', JSON.stringify(guild))
      })
      .catch(e => {
        this.setState({ guild: null })
        console.log(e)
      })
      .finally(() => {
        this.setState({ fetchDone: true })
      })
  }

  componentDidMount() {
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
    const { router } = this.props
    const { guild, guildCache } = this.state

    const isXSsize = (this.state?.winWidth || 0) < 768


    if (this.state.fetchDone && !guild) {
      swal(
        <div>
          <h2>서버를 찾을 수 없습니다!</h2>
          <p className="px-3">
            사용자가 들어가있지 않는 서버이거나 존재하지 않는 서버입니다
          </p>
          <Button variant="danger" href="/servers">서버 목록으로</Button>
        </div>,
        {
          icon: "error",
          button: false,
          closeOnClickOutside: false,
          closeOnEsc: false
        }
      )
    }

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
                      (guildCache || guild) && (
                        <img
                          alt="서버 아이콘"
                          src={
                            guildCache?.id === this.props.router.query.guildid
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
                        : guildCache?.id === this.props.router.query.guildid
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
            {this.props.children}
          </Col>
        </Row>
      </Container>
    )
  }
}

export default withRouter(DashboardLayout)