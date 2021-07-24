import React from "react";
import axios, { AxiosError } from "axios";
import Layout from "components/Layout";
import api from "datas/api";
import { NextPage } from "next";
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import useSWR from "swr";
import { PartialGuildExtend } from "types/DiscordTypes";
import Cookies from "universal-cookie";
import urljoin from "url-join";

const Partners: NextPage = () => {
  const { data } = useSWR<PartialGuildExtend[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, '/discord/users/@me/guilds') : null,
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

  return (
    <Layout>
      <Container fluid className="text-white my-4" style={{ padding: '100px 10%', minHeight: '80vh' }}>
        <Row className="text-center mb-5 pb-4">
          <Col>
            <h1 className="pb-3">Aztra 파트너 서버</h1>
            <div style={{ fontFamily: 'NanumBarunGothic' }}>Aztra를 사용하는 멋진 서버들을 둘러보고, 여러분의 서버도 소개해보세요!</div>
          </Col>
        </Row>
        <Row>
          {
            data?.filter(one => Number(one.permissions) & 8).sort((a, b) => Number(b.bot_joined) - Number(a.bot_joined)).map(one => (
              <Col xs={12} md={6} xl={4} className="mb-4 mb-xl-5 px-xl-4">
                <Card bg="dark" className="shadow mh-100 w-100 px-3 pt-4">
                  <Row className="align-items-center pb-4">
                    <Col xs="auto" className={`text-center pr-0 ${one.icon ? '' : 'pl-1'}`}>
                      <div style={{ height: 64 }}>
                        {one.icon && <Card.Img variant="top" src={`https://cdn.discordapp.com/icons/${one.id}/${one.icon}.png`} className="rounded-circle" style={{ height: 64, width: 64 }} />}
                      </div>
                    </Col>
                    <Col className="px-0">
                      <Card.Body className="py-0">
                        <Card.Title className="font-weight-bold d-flex justify-content-between align-items-center mb-1" style={{ fontFamily: 'NanumSquare', fontSize: 22 }}>
                          {one.name}
                        </Card.Title>
                        <Card.Text>
                          <div className="d-flex align-items-center">
                            <div className="mr-2 rounded-circle" style={{ width: 10, height: 10, backgroundColor: 'lime' }} />
                            <small>000 멤버 온라인, 000 멤버</small>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Col>
                  </Row>
                  <Row className="px-2 pb-4" style={{ fontSize: 15, height: 120 }}>
                    <Col>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget vestibulum elit, sed tempor erat. Suspendisse eu tellus venenatis diam suscipit auctor.
                    </Col>
                  </Row>
                  <Row>
                    <Button variant="dark-aztra" className="w-100">참가하기</Button>
                  </Row>
                </Card>
              </Col>
            ))
          }
        </Row>
      </Container>
    </Layout>
  )
}

export default Partners