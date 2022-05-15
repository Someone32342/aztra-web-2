import React, { useEffect, useState } from 'react';
import {
  Row,
  Spinner,
  Container,
  Button,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
  Modal,
  Form,
} from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Router from 'next/router';

interface WorkflowsRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<
  WorkflowsRouterProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

const Workflows: NextPage<WorkflowsRouterProps> = ({ guildId }) => {
  const [showNew, setShowNew] = useState(false);

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
        <title>워크플로우 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            true ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>워크플로우</h3>
                    <div className="py-2">
                      원하는 작업 블록을 드래그하여 쉽게 커스텀 자동 작업을
                      구성할 수 있습니다.
                    </div>
                  </div>
                </Row>

                <Row className="pt-2">
                  <div className="d-flex justify-content-end align-items-center">
                    <div
                      className="me-4"
                      style={{
                        color: 0 >= 5 ? 'gold' : 'white',
                      }}
                    >
                      <b>{1}/5</b> 개 사용됨
                    </div>
                    <Button
                      variant="aztra"
                      size="sm"
                      className="d-flex align-items-center my-1"
                      onClick={() => {
                        setShowNew(true);
                      }}
                    >
                      <AddIcon className="me-1" />
                      새로 추가
                    </Button>
                  </div>
                </Row>

                <Row className="pt-4">
                  {Array.from(Array(5).keys()).map((i) => (
                    <Col className="mb-4" key={i} xs={12} lg={4}>
                      <Card bg="dark" className="shadow">
                        <Card.Body className="d-flex pt-2 pe-2">
                          <div className="pt-2">
                            <h5 className="fw-bold">My Workflow {i + 1}</h5>
                            <small>멤버가 참여했을 때 | 5개 블록</small>
                          </div>
                          <div className="ms-auto">
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="workflow-edit">수정하기</Tooltip>
                              }
                            >
                              <Button
                                variant="dark"
                                className="p-1"
                                onClick={() => {
                                  Router.push(
                                    `/dashboard/${guildId}/workflows/${
                                      i + 1
                                    }/edit`,
                                    undefined,
                                    { shallow: true }
                                  );
                                }}
                              >
                                <EditIcon />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="workflow-delete">삭제하기</Tooltip>
                              }
                            >
                              <Button
                                variant="outline-danger"
                                className="p-1 border-0"
                              >
                                <DeleteIcon />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Modal
                  className="modal-dark"
                  show={showNew}
                  onHide={() => setShowNew(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>새 워크플로우 만들기</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form noValidate>
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs="auto">
                          워크플로우 이름:
                        </Form.Label>
                        <Col>
                          <Form.Control type="text" required />
                          <div
                            className="mt-1"
                            style={{
                              color: 'lightgray',
                              fontSize: 12,
                              letterSpacing: 0,
                              lineHeight: '140%',
                            }}
                          >
                            워크플로우의 역할을 잘 나타내는 이름이 좋습니다. 예:
                            참여시 기본 역할 지급, 경고 5회 누적시 차단
                          </div>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs="auto">
                          워크플로우 유형:
                        </Form.Label>
                        <Col>
                          <Form.Select>
                            <option>워크플로우 선택</option>
                            <option>멤버가 메시지에 반응했을 때</option>
                            <option>새 멤버가 참여했을 때</option>
                            <option>멤버가 경고를 받았을 때</option>
                            <option>멤버의 경고가 제거되었을 때</option>
                            <option>멤버의 레벨이 올랐을 때</option>
                          </Form.Select>
                          <div
                            className="mt-1"
                            style={{
                              color: 'lightgray',
                              fontSize: 12,
                              letterSpacing: 0,
                              lineHeight: '140%',
                            }}
                          >
                            어떤 상황에서 이 워크플로우가 실행될지 선택합니다.
                          </div>
                        </Col>
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="aztra">
                      <AddIcon className="me-2" />
                      생성하기
                    </Button>
                    <Button
                      variant="dark"
                      onClick={() => {
                        setShowNew(false);
                      }}
                    >
                      취소하고 닫기
                    </Button>
                  </Modal.Footer>
                </Modal>
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

export default Workflows;
