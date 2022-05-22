import React, { useEffect, useRef, useState } from 'react';
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
import { Emoji } from 'emoji-mart';
import averageColor from 'utils/averageColor';
import api from 'datas/api';
import axios, { AxiosError } from 'axios';
import { Workflow } from 'types/dbtypes';
import urljoin from 'url-join';
import useSWR from 'swr';
import styles from 'styles/pages/workflows.module.scss';
import clsx from 'clsx';

interface WorkflowsRouterProps {
  guildId: string;
}

interface WorkflowIconProps {
  emoji: string;
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

const WorkflowIcon: React.FC<WorkflowIconProps> = ({ emoji }) => {
  const [color, setColor] = useState('');

  useEffect(() => {
    const fn = async () => {
      const color = await averageColor(
        30,
        `https://twemoji.maxcdn.com/72x72/${emoji}.png`
      );
      setColor(color);
    };
    fn();
  }, [emoji]);

  return (
    <div
      className={clsx(
        styles.icon,
        'd-flex justify-content-center align-items-center p-3 rounded-circle'
      )}
      style={{ backgroundColor: color }}
    >
      <img
        width={30}
        height={30}
        src={`https://twemoji.maxcdn.com/72x72/${emoji}.png`}
        alt={String.fromCodePoint(parseInt(emoji, 16))}
        style={{ filter: `drop-shadow(0 0 0.75rem ${color})` }}
      />
    </div>
  );
};

const Workflows: NextPage<WorkflowsRouterProps> = ({ guildId }) => {
  const [showNew, setShowNew] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const workflowNameRef = useRef<HTMLInputElement>(null);
  const workflowEventRef = useRef<HTMLSelectElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(false);

  const [workflowNameValiation, setWorkflowNameValidation] = useState<
    boolean | null
  >(null);
  const [workflowEventValiation, setWorkflowEventValidation] = useState<
    boolean | null
  >(null);

  const { data, mutate } = useSWR<Workflow[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/autotasking`)
      : null,
    (url) =>
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        })
        .then((r) => r.data)
  );

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location;
      localStorage.setItem('loginFrom', lct.pathname + lct.search);
      window.location.assign('/login');
    }
  }, []);

  const setValidate = () => {
    if (workflowNameRef.current) {
      if (workflowNameRef.current.value.length > 0) {
        setWorkflowNameValidation(true);
      } else {
        setWorkflowNameValidation(false);
      }

      if (workflowEventRef.current) {
        if (workflowEventRef.current.value !== '0') {
          setWorkflowEventValidation(true);
        } else {
          setWorkflowEventValidation(false);
        }
      }
    }
  };

  const checkValidate = () => {
    return (
      (workflowNameRef.current?.value.length ?? 0) > 0 &&
      workflowEventRef.current?.value !== '0'
    );
  };

  return (
    <>
      <Head>
        <title>워크플로우 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {(guild) =>
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
                        <Card.Body className="d-flex pe-2 align-items-center gap-3">
                          <WorkflowIcon emoji="1f60a" />
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
                    <Form ref={formRef} noValidate validated={false}>
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="workflow-name"
                      >
                        <Form.Label column xs="auto">
                          워크플로우 이름:
                        </Form.Label>
                        <Col>
                          <Form.Control
                            type="text"
                            ref={workflowNameRef}
                            isInvalid={workflowNameValiation === false}
                            required
                            autoComplete="off"
                            onChange={(e) => {
                              if (e.target.value.length) {
                                setWorkflowNameValidation(true);
                              } else {
                                setWorkflowNameValidation(false);
                              }
                            }}
                          />
                          <Form.Control.Feedback
                            className="text-danger"
                            type="invalid"
                          >
                            워크플로우 이름을 입력하세요!
                          </Form.Control.Feedback>
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
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="workflow-event"
                      >
                        <Form.Label column xs="auto">
                          워크플로우 유형:
                        </Form.Label>
                        <Col>
                          <Form.Select
                            ref={workflowEventRef}
                            isInvalid={workflowEventValiation === false}
                            onChange={() => {
                              if (workflowEventRef.current!.value !== '0') {
                                setWorkflowEventValidation(true);
                              } else {
                                setWorkflowEventValidation(false);
                              }
                            }}
                          >
                            <option value="0">워크플로우 선택</option>
                            <option value="reaction_added">
                              멤버가 메시지에 반응했을 때
                            </option>
                            <option value="member_joined">
                              새 멤버가 참여했을 때
                            </option>
                            <option value="warn_created">
                              멤버가 경고를 받았을 때
                            </option>
                            <option value="warn_removed">
                              멤버의 경고가 제거되었을 때
                            </option>
                            <option value="member_levelup">
                              멤버의 레벨이 올랐을 때
                            </option>
                          </Form.Select>
                          <Form.Control.Feedback
                            className="text-danger"
                            type="invalid"
                          >
                            워크플로우 유형을 선택하세요!
                          </Form.Control.Feedback>
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
                    <Button
                      variant={createError ? 'danger' : 'aztra'}
                      disabled={isCreating || createError || !checkValidate()}
                      onClick={() => {
                        setValidate();

                        if (!checkValidate()) return;

                        setIsCreating(true);

                        const postData = {
                          name: workflowNameRef.current!.value,
                          event: workflowEventRef.current!.value,
                          icon: null,
                        };

                        axios
                          .post(
                            `${api}/servers/${guild?.id}/workflows`,
                            postData,
                            {
                              headers: {
                                Authorization: `Bearer ${new Cookies().get(
                                  'ACCESS_TOKEN'
                                )}`,
                              },
                            }
                          )
                          .then(() => mutate())
                          .catch(() => {
                            setCreateError(true);
                            setTimeout(() => setCreateError(false), 3000);
                          })
                          .finally(() => setIsCreating(false));
                      }}
                    >
                      <AddIcon className="me-2" />
                      {createError
                        ? '오류'
                        : isCreating
                        ? '생성 중...'
                        : '생성하기'}
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
