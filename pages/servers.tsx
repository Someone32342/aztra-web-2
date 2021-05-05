import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Modal, Alert } from 'react-bootstrap'
import axios, { AxiosError } from 'axios'
import urljoin from 'url-join'
import api from 'datas/api'
import { PartialGuildExtend } from 'types/DiscordTypes'
import {
  ArrowForward as ArrowForwardIcon,
} from '@material-ui/icons'
import Layout from 'components/Layout';

import Cookies from 'universal-cookie'
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import links from 'datas/links'
import Head from 'next/head';

export default function Servers() {
  const router = useRouter()

  const [showError, setShowError] = useState(false)

  const { data, error, mutate } = useSWR<PartialGuildExtend[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, '/discord/users/@me/guilds') : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      onError: () => {
        setShowError(true)
      },
      refreshInterval: 5000
    }
  )

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }, [])

  const guild_cards = data
    ?.filter(one => {
      return Number(one.permissions) & 8
    })
    .sort((a, b) => Number(!a.bot_joined) - Number(!b.bot_joined))
    .map((one, index) => (
      <Card key={index} bg="dark" text="light" className="shadow" style={{ margin: '8px 0', padding: '8px 0', border: 'none' }}>
        <Card.Body className="p-0" style={{ fontSize: '12pt' }}>
          <Container>
            <Row>
              <Col>
                <div style={{ minHeight: 40 }} className="d-flex align-items-center">
                  {
                    one.icon && <img alt={one.name} src={`https://cdn.discordapp.com/icons/${one.id}/${one.icon}.png`} style={{ maxHeight: 40, marginRight: 15, borderRadius: '70%' }} />
                  }
                  <div>
                    {one.name}
                  </div>

                </div>
              </Col>
              <Col className="d-flex align-items-center justify-content-end">
                {
                  one.bot_joined
                    ? (
                      <Link href={`/dashboard/${one.id}`} shallow={true}>
                        <Button className="d-flex align-items-center" variant="aztra" size="sm">
                          대시보드
                          <ArrowForwardIcon style={{ fontSize: 22 }} className="ml-1" />
                        </Button>
                      </Link>
                    )
                    : <Button variant="dark" size="sm" onClick={() => {
                      const w = 400
                      const h = 700

                      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
                      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

                      const width = window.innerWidth || document.documentElement.clientWidth || screen.width;
                      const height = window.innerHeight || document.documentElement.clientHeight || screen.height;

                      const systemZoom = width / window.screen.availWidth;
                      const left = (width - w) / 2 / systemZoom + dualScreenLeft
                      const top = (height - h) / 2 / systemZoom + dualScreenTop
                      const newWindow = window.open(links.invite_with_redirect[process.env.NODE_ENV] + `&guild_id=${one.id}&disable_guild_select=true`, 'Aztra 초대하기',
                        `
                        width=${w / systemZoom},
                        height=${h / systemZoom}, 
                        top=${top}, 
                        left=${left}
                        `
                      )
                      newWindow?.focus();
                    }}>
                      초대하기
                    </Button>
                }
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    ))

  return (
    <>
      <Head>
        <title>Aztra - 서버 선택</title>
      </Head>
      <Layout>
        <div className="min-vh-100 mb-5">
          <Container fluid="sm" className="text-center">
            {
              !error && guild_cards?.length === 0
                ?
                <h2 className="text-white" style={{ marginTop: 120, marginBottom: 120 }}>
                  관리할 수 있는 서버가 하나도 없습니다!
                  <h4 className="text-white mt-5" >관리자 권한이 있는 서버만 표시됩니다.</h4>
                </h2>
                : <h2 className="text-white" style={{ marginTop: 120, marginBottom: 120 }}>서버를 선택하세요</h2>
            }
          </Container>
          <Container fluid="sm">
            {
              !(data || error)
                ?
                <div style={{ color: 'whitesmoke', paddingTop: 80, paddingBottom: 300 }} className="text-center">
                  <Spinner animation="border" variant="aztra" style={{
                    height: 50,
                    width: 50
                  }} />
                  <h4 className="pt-5">
                    서버 목록을 가져오고 있습니다...
                </h4>
                </div>
                : guild_cards
            }
          </Container>
        </div>
        <Modal className="modal-dark" show={showError} centered onHide={() => { }}>
          <Modal.Body>
            서버 정보를 가져오는 데 실패했습니다!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => router.push('/')}>
              메인으로
            </Button>
            <Button variant="danger" onClick={() => {
              setShowError(false)
              mutate()
            }}>
              다시 시도하기
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </>
  )
}