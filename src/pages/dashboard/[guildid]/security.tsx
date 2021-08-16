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

                <Row>
                  <hr
                    className="my-1 w-100"
                    style={{ borderColor: '#4e5058', borderWidth: 2 }}
                  />
                </Row>

                <Row className="py-3 align-items-center">
                  <div>
                    <h4>메시지 도배 방지</h4>
                    <small>악성 유저의 메시지 도배를 막습니다.</small>
                  </div>
                </Row>

                <Form.Group controlId="spamming-limit">
                  <Row className="pb-3">
                    <Col xs="auto" className="my-auto">
                      <Form.Check
                        id="limit-message-check"
                        custom
                        type="checkbox"
                        label="일정 시간동안 메시지 개수 제한하기:"
                      />
                    </Col>
                    <Col className="pl-0">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          className="mr-2"
                          defaultValue="60"
                          style={{ width: 60 }}
                        />
                        <span>초 동안 최대</span>
                        <Form.Control
                          className="mx-2"
                          defaultValue="20"
                          style={{ width: 60 }}
                        />
                        <span>개</span>
                      </div>
                    </Col>
                  </Row>
                </Form.Group>

                <Row>
                  <hr
                    className="my-1 w-100"
                    style={{ borderColor: '#4e5058', borderWidth: 2 }}
                  />
                </Row>

                <Row className="py-3 align-items-center">
                  <div>
                    <h4>멘션 제한</h4>
                    <small>악성 유저의 무분별한 멘션 도배를 막습니다.</small>
                  </div>
                </Row>

                <Form.Group controlId="mention-limit">
                  <Row className="pb-3">
                    <Col xs="auto" className="my-auto">
                      <Form.Check
                        id="max-by-one-message-check"
                        custom
                        type="checkbox"
                        label="한 메시지당 멘션 최대:"
                      />
                    </Col>
                    <Col className="pl-0">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          className="mr-2"
                          defaultValue="10"
                          style={{ width: 60 }}
                        />
                        <span>개</span>
                      </div>
                    </Col>
                  </Row>
                  <Row className="pb-3">
                    <Col xs="auto" className="my-auto">
                      <Form.Check
                        id="max-by-all-timein-message-check"
                        custom
                        type="checkbox"
                        label="일정 시간동안 모든 메시지의 멘션 최대:"
                      />
                    </Col>
                    <Col className="pl-0">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          className="mr-2"
                          defaultValue="60"
                          style={{ width: 60 }}
                        />
                        <span>초 동안 최대</span>
                        <Form.Control
                          className="mx-2"
                          defaultValue="20"
                          style={{ width: 60 }}
                        />
                        <span>개</span>
                      </div>
                    </Col>
                  </Row>
                  <hr
                    className="my-1"
                    style={{ borderColor: '#4e5058', borderWidth: 2 }}
                  />
                  <Row className="pt-3">
                    <Col>
                      <Form.Label className="font-weight-bold h5">
                        위반 시:
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row className="pl-4">
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-add-role"
                        custom
                        type="checkbox"
                        label="역할 추가하기"
                      />
                    </Col>
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-remove-role"
                        custom
                        type="checkbox"
                        label="역할 제거하기"
                      />
                    </Col>
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-kick"
                        custom
                        type="checkbox"
                        label="해당 멤버 추방하기"
                      />
                    </Col>
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-ban"
                        custom
                        type="checkbox"
                        label="해당 멤버 차단하기"
                      />
                    </Col>
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-add-warn"
                        custom
                        type="checkbox"
                        label="경고 부여하기"
                      />
                    </Col>
                    <Col xs={12} className="pt-3">
                      <Form.Check
                        id="on-violate-mute"
                        custom
                        type="checkbox"
                        label="멤버 뮤트하기"
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
