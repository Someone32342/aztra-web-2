import React from 'react';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap'
import axios, { AxiosError } from 'axios'
import urljoin from 'url-join'
import api from '../datas/api'
import { Permissions } from 'discord.js'
import { PartialGuildExtend } from '../types/DiscordTypes'
import {
  Refresh as RefreshIcon
} from '@material-ui/icons';
import Layout from '../components/Layout';
import { GetServerSideProps } from 'next';
import Router from 'next/router';

const swal = require('@sweetalert/with-react')

interface ServersProps {
  guilds: PartialGuildExtend[] | null
  fetchError: AxiosError | null
}

export const getServerSideProps: GetServerSideProps = async context => {
  let token = context.req.cookies.ACCESS_TOKEN
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    }
  }

  let guilds = null
  let fetchError = false

  try {
    let res = await axios.get(urljoin(api, '/discord/users/@me/guilds'), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    guilds = res.data
  }
  catch (e) {
    console.log('ds')
    fetchError = true
  }
  finally {
    return {
      props: {
        guilds,
        fetchError
      }
    }
  }
}

export default class Servers extends React.Component<ServersProps> {
  render() {


    const guild_cards = this.props.guilds
      ?.filter(one => {
        let perms = new Permissions(Number(one.permissions))
        return perms.has(Permissions.FLAGS.ADMINISTRATOR)
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
                      {one.name}
                    </div>

                  </div>
                </Col>
                <Col className="d-flex align-items-center justify-content-end">
                  {
                    one.bot_joined
                      ? <>

                        <Button variant="success" size="sm" href={`/dashboard/${one.id}`}>대시보드</Button>
                      </>
                      : <Button variant="secondary" size="sm">초대하기</Button>
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
              guild_cards?.length
                ? <h2 className="text-white" style={{ marginTop: 120, marginBottom: 120 }}>서버를 선택하세요</h2>
                : <>
                  <div style={{ marginTop: 120, marginBottom: 120 }}>
                    <h2 className="text-white">
                      관리할 수 있는 서버가 하나도 없습니다!
                  </h2>
                    <h4 className="text-white mt-5" >관리자 권한이 있는 서버만 표시됩니다.</h4>
                  </div>
                  <Button variant="aztra" onClick={() => Router.reload()}>
                    <RefreshIcon className="mr-2" />
                    새로고침
                  </Button>
                </>
            }
          </Container>
          <Container fluid="sm" style={{ marginBottom: 160 }}>
            {guild_cards}
          </Container>
        </div>
      </Layout>
    )
  }
}