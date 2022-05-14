import React, { useEffect } from 'react';
import { Row, Spinner, Container, Col, Card } from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import {
  PersonAdd as PersonAddIcon,
  AddCircle as AddCicleIcon,
  RemoveCircle as RemoveCircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import styles from 'styles/pages/workflows.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

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

const HorizontalConnection: React.FC = () => {
  return (
    <>
      <div
        className="rounded-circle bg-aztra-dark"
        style={{
          width: 10,
          height: 10,
          marginTop: -5,
          zIndex: 9999,
          border: '2px solid rgb(40, 43, 49)',
        }}
      />
      <div
        style={{
          border: '1px dashed #6f3fad',
          width: 1,
          height: 40,
        }}
      />
      <div
        className="rounded-circle bg-aztra-dark"
        style={{
          width: 10,
          height: 10,
          marginBottom: -6,
          zIndex: 9999,
          border: '2px solid rgb(40, 43, 49)',
        }}
      />
    </>
  );
};

const Workflows: NextPage<WorkflowsRouterProps> = ({ guildId }) => {
  const [works, setWorks] = React.useState<{ uid: string; work: string }[]>([]);
  const [isHoverDelete, setIsHoverDelete] = React.useState(false);

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

                <Row style={{ minHeight: 'calc(100vh - 250px)' }}>
                  <Col
                    xs={12}
                    lg={8}
                    className="rounded d-flex flex-column align-items-center py-5 position-relative"
                    style={{
                      minHeight: '20%',
                      backgroundColor: 'rgb(30, 32, 36)',
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      if (isHoverDelete) return;

                      let data = JSON.parse(e.dataTransfer.getData('text'));
                      let newWorks = works.filter((w) => w.uid !== data.uid);

                      newWorks.push(data);
                      setWorks(newWorks);
                    }}
                  >
                    <Card
                      className="shadow w-50"
                      style={{ backgroundColor: 'rgb(40, 43, 49)' }}
                    >
                      <Card.Body
                        className="d-flex py-3"
                        style={{ minHeight: 50 }}
                      >
                        <PersonAddIcon className="me-2" />
                        <div>
                          <div className="mb-2">멤버가 참여했을 때</div>
                          <small
                            className="bg-dark px-2 py-1"
                            style={{ borderRadius: 40 }}
                          >
                            제외: 봇
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                    <HorizontalConnection />

                    {works.map((work) => {
                      return (
                        <div key={work.uid} className="w-50 text-center">
                          <Card
                            className="shadow"
                            style={{
                              backgroundColor: 'rgb(40, 43, 49)',
                              cursor: 'move',
                            }}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'text',
                                JSON.stringify(work)
                              );
                            }}
                          >
                            <Card.Body
                              className="d-flex py-3"
                              style={{ minHeight: 50 }}
                            >
                              <AddCicleIcon className="me-2" />
                              <div>
                                <div className="mb-2">역할 부여하기</div>
                                <small
                                  className="px-2 py-1"
                                  style={{
                                    borderRadius: 40,
                                    backgroundColor: 'deeppink',
                                    opacity: 0.9,
                                  }}
                                >
                                  역할:{' '}
                                  <span style={{ color: 'pink' }}>유저</span>
                                </small>
                              </div>
                            </Card.Body>
                          </Card>
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <HorizontalConnection />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: 100 }} />
                    <div
                      className={cx('deleteButton', 'p-3')}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsHoverDelete(true);
                      }}
                      onDragLeave={(e) => {
                        setIsHoverDelete(false);
                      }}
                      onDrop={(e) => {
                        let data = JSON.parse(e.dataTransfer.getData('text'));

                        setWorks(works.filter((w) => data.uid !== w.uid));
                        setIsHoverDelete(false);
                      }}
                      style={{
                        backgroundColor: isHoverDelete
                          ? 'rgba(255, 37, 23, 0.1)'
                          : 'transparent',
                        borderRadius: '100%',
                      }}
                    >
                      <DeleteIcon
                        fontSize="large"
                        htmlColor={isHoverDelete ? 'red' : 'white'}
                      />
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    lg={4}
                    className="d-flex flex-column gap-2 px-3 pe-0 h-100"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      let data = JSON.parse(e.dataTransfer.getData('text'));

                      setWorks(works.filter((w) => data.uid !== w.uid));
                    }}
                    style={{
                      position: 'sticky',
                      top: 78,
                    }}
                  >
                    <Card
                      id="palette-role-add"
                      bg="dark"
                      className="shadow-sm"
                      draggable
                      style={{ cursor: 'move' }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'text',
                          JSON.stringify({
                            uid: Math.floor(
                              Math.random() * Date.now()
                            ).toString(),
                            work: 'role-add',
                          })
                        );
                      }}
                    >
                      <Card.Body
                        className="d-flex align-items-center"
                        style={{ height: 45 }}
                      >
                        <AddCicleIcon className="me-2" />
                        역할 부여하기
                      </Card.Body>
                    </Card>
                    <Card
                      id="palette-role-remove"
                      bg="dark"
                      className="shadow-sm"
                      draggable
                      style={{ cursor: 'move' }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'text',
                          JSON.stringify({
                            uid: Math.floor(
                              Math.random() * Date.now()
                            ).toString(),
                            work: 'role-remove',
                          })
                        );
                      }}
                    >
                      <Card.Body
                        className="d-flex align-items-center"
                        style={{ height: 45 }}
                      >
                        <RemoveCircleIcon className="me-2" />
                        역할 제거하기
                      </Card.Body>
                    </Card>
                    <Card
                      id="palette-warn-add"
                      bg="dark"
                      className="shadow-sm"
                      draggable
                      style={{ cursor: 'move' }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'text',
                          JSON.stringify({
                            uid: Math.floor(
                              Math.random() * Date.now()
                            ).toString(),
                            work: 'warn-add',
                          })
                        );
                      }}
                    >
                      <Card.Body
                        className="d-flex align-items-center"
                        style={{ height: 45 }}
                      >
                        <PersonAddIcon className="me-2" />
                        경고 추가하기
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
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
