import React, { useEffect } from 'react';
import {
  Row,
  Spinner,
  Container,
  Form,
  Col,
  Badge,
  Button,
} from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';

interface SecurityRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<SecurityRouterProps> =
  async (context) => {
    const { guildid } = context.query;
    return {
      props: {
        guildId: guildid as string,
      },
    };
  };

const Security: NextPage<SecurityRouterProps> = ({ guildId }) => {
  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location;
      localStorage.setItem('loginFrom', lct.pathname + lct.search);
      window.location.assign('/login');
    }
  }, []);

  return (
    <>
      <Head>
        <title>보안 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            true ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>보안 설정</h3>
                    <div className="py-2">
                      여러분의 서버를 악의적인 공격으로부터 보호할 기능들을
                      제공합니다.
                    </div>
                  </div>
                </Row>

                <Row className="pb-3 align-items-center">
                  <div>
                    <h4>멤버 초대 보안</h4>
                    <small>
                      추가 인증이 적용된 초대 링크를 발급하여 악성 멤버가
                      참여하는 것을 막습니다. 기존 디스코드 초대 링크에는 이
                      기능이 적용되지 않으니 반드시 아래의 자체 초대 링크를
                      사용하세요!
                    </small>
                  </div>
                </Row>

                <Form.Group controlId="middle-auth-type">
                  <Row className="pb-3">
                    <Col xs={12}>
                      <Form.Check
                        id="by-discord-oauth"
                        custom
                        type="checkbox"
                        label="디스코드 초대 링크 인증 강화"
                      />
                    </Col>
                  </Row>
                  <Row className="pl-4 pb-4">
                    <Form.Label column xs="auto">
                      초대 링크:
                    </Form.Label>
                    <Col xs={4} className="pr-0">
                      <Form.Control
                        className="shadow mb-1"
                        type="text"
                        placeholder="https://aztra.xyz/invite/A2Fg15Gvx6"
                      />
                      <small>
                        <Badge variant="aztra" className="ml-2">
                          PRO
                        </Badge>{' '}
                        Aztra Pro로 업그레이드하면 커스텀 링크를 사용할 수
                        있습니다!
                      </small>
                    </Col>
                    <Col xs="auto">
                      <Button variant="aztra">복사하기</Button>
                    </Col>
                  </Row>
                  <Row className="pb-3">
                    <Col xs={12}>
                      <Form.Check
                        id="by-naver-oauth"
                        custom
                        type="checkbox"
                        label={
                          <>
                            네이버 아이디로 인증
                            <Badge variant="aztra" className="ml-2">
                              PRO
                            </Badge>
                          </>
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </div>
            ) : (
              <Container
                className="d-flex align-items-center justify-content-center flex-column"
                style={{
                  height: '500px',
                }}
              >
                <h3 className="pb-4">불러오는 중</h3>
                <Spinner animation="border" variant="aztra" />
              </Container>
            )
          }
        </DashboardLayout>
      </Layout>
    </>
  );
};

export default Security;
