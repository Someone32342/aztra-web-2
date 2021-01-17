import React, { Component } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Modal } from 'react-bootstrap'
import axios, { AxiosError } from 'axios'
import urljoin from 'url-join'
import api from 'datas/api'
import { PartialGuildExtend } from 'types/DiscordTypes'
import {
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon
} from '@material-ui/icons'
import Layout from 'components/Layout';

import Cookies from 'universal-cookie'
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';

interface ServersState {
  guilds: PartialGuildExtend[]
  fetchDone: boolean | null,
  fetchError: AxiosError | null
  fetchErrorShow: boolean
}

class Servers extends Component<WithRouterProps, ServersState> {
  state: ServersState = {
    guilds: [],
    fetchDone: null,
    fetchError: null,
    fetchErrorShow: false
  }

  getGuilds = async (token: string) => {
    this.setState({ fetchDone: null })
    try {
      let res = await axios.get(urljoin(api, '/discord/users/@me/guilds'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.setState({ guilds: res.data, fetchDone: true })
    }
    catch (e) {
      this.setState({ guilds: [], fetchError: e, fetchDone: false, fetchErrorShow: true })
    }
  }

  componentDidMount() {
    const token = new Cookies().get('ACCESS_TOKEN')
    if (token) {
      this.getGuilds(token)
    }
    else {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }

  render() {
    const guild_cards = this.state.guilds
      .filter(one => {
        return Number(one.permissions) & 8
      })
      .sort((a, b) => Number(!a.bot_joined) - Number(!b.bot_joined))
      .map((one, index) => (
        <Card key={index} bg="dark" text="light" className="Dashboard-Servers-Card shadow" style={{
          animationDelay: `${index * 80}ms`,
        }}>
          <Card.Body className="p-0" style={{ fontSize: '12pt' }}>
            <Container>
              <Row>
                <Col>
                  <div style={{ minHeight: 40 }} className="d-flex align-items-center">
                    {
                      one.icon && <img alt={one.name} src={`https://cdn.discordapp.com/icons/${one.id}/${one.icon}.png`} style={{ maxHeight: 40, marginRight: 15, borderRadius: '70%' }} />
                    }
                    <div>
                      {one.name
                      }</div>

                  </div>
                </Col>
                <Col className="d-flex align-items-center justify-content-end">
                  {
                    one.bot_joined
                      ? <>

                        <Button className="d-flex align-items-center" variant="aztra" size="sm" href={`/dashboard/${one.id}`}>
                          대시보드
                          <ArrowForwardIcon style={{ fontSize: 22 }} className="ml-1" />
                        </Button>
                      </>
                      : <Button variant="dark" size="sm">초대하기</Button>
                  }
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>
      ))

    return (
      <Layout>
        <div className="min-vh-100">
          <Container fluid="sm" className="text-center">
            {
              this.state.fetchDone === true && guild_cards.length === 0
                ? <>
                  <h2 className="text-white" style={{ marginTop: 120, marginBottom: 120 }}>
                    관리할 수 있는 서버가 하나도 없습니다!
                  <h4 className="text-white mt-5" >관리자 권한이 있는 서버만 표시됩니다.</h4>
                  </h2>
                  <Button variant="aztra" onClick={() => this.componentDidMount()}>
                    <RefreshIcon className="mr-2" />
                    새로고침
                  </Button>
                </>
                : <h2 className="text-white" style={{ marginTop: 120, marginBottom: 120 }}>서버를 선택하세요</h2>
            }
          </Container>
          <Container fluid="sm" style={{ marginBottom: 160 }}>
            {
              this.state.fetchDone === null
                ? <div style={{ color: 'whitesmoke', paddingTop: 80, paddingBottom: 300 }} className="text-center">
                  <Spinner animation="border" variant="aztra" style={{
                    height: 50,
                    width: 50
                  }} />
                  <h3 className="pt-5">
                    서버 목록을 가져오고 있습니다...
                  </h3>
                </div>
                : guild_cards
            }
          </Container>
        </div>
        {
          this.state.fetchErrorShow && (
            (
              <Modal className="modal-dark" show={!!this.state.fetchErrorShow} centered onHide={() => {}}>
                <Modal.Body>
                  서버 정보를 가져오는 데 실패했습니다!
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="dark" onClick={() => this.props.router.push('/')}>
                    메인으로
                  </Button>
                  <Button variant="danger" onClick={() => {
                    this.setState({ fetchErrorShow: false })
                    this.componentDidMount()
                  }}>
                    다시 시도하기
                  </Button>
                </Modal.Footer>
              </Modal>
            )
          )
        }
      </Layout>
    )
  }
}

export default withRouter(Servers)