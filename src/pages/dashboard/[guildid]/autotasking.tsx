import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Table,
  Tooltip,
} from 'react-bootstrap';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  RemoveCircleOutline,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import Twemoji from 'react-twemoji';
import api from 'datas/api';
import { animateScroll } from 'react-scroll';

import { GetServerSideProps, NextPage } from 'next';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import { ChannelMinimal, MemberMinimal, Role } from 'types/DiscordTypes';
import Head from 'next/head';
import { TaskSet } from 'types/autotask';
import { EmojiRoleData, JoinRoleData } from 'types/autotask/action_data';
import EmojiRole from 'components/autotasking/EmojiRole';
import { EmojiRoleParams } from 'types/autotask/params';
import RoleBadge from 'components/forms/RoleBadge';
import { Emoji, getEmojiDataFromNative } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';
import JoinRole from 'components/autotasking/JoinRole';

interface AutoTaskingRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<
  AutoTaskingRouterProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

interface TaskListCardProps {
  onCheckChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  taskset: TaskSet;
}

const AutoTasking: NextPage<AutoTaskingRouterProps> = ({ guildId }) => {
  const [addNew, setAddNew] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [taskType, setTaskType] = useState<string | number>(0);

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showSelectedDel, setShowSelectedDel] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [editError, setEditError] = useState(false);
  const [isLG, setIsLG] = useState<boolean | null>(null);

  const { data, mutate } = useSWR<TaskSet[], AxiosError>(
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

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/discord/guilds/${guildId}/members`)
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

  const { data: roles } = useSWR<Role[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/discord/guilds/${guildId}/roles`)
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

  const { data: channels } = useSWR<ChannelMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/discord/guilds/${guildId}/channels`)
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
    } else {
      const resize = () => setIsLG(window.innerWidth >= 992);
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, []);

  const tasksSet = new Set(data?.map((o) => o.uuid));
  const finalSelectedSet = new Set(
    Array.from(selectedTasks).filter((o) => tasksSet.has(o))
  );

  const TaskListCard: React.FC<TaskListCardProps> = ({
    taskset,
    onCheckChange,
    checked,
  }) => {
    let eventName = `(알 수 없는 동작: ${taskset.type})`;

    let eventContent, taskContent: React.ReactNode;

    switch (taskset.type) {
      case 'emoji_role':
        eventName = '반응했을 때 역할 추가/제거';
        let taskparams: EmojiRoleParams = taskset.params;
        let channel = channels?.find((o) => o.id === taskparams.channel);

        eventContent = (
          <div className="ps-3">
            <div>
              <span className="fw-bold">- 채널: </span>
              <span>
                {channel ? `#${channel.name}` : <i>(존재하지 않는 채널)</i>}
              </span>
            </div>
            <div>
              <span className="fw-bold">- 메시지 아이디: </span>
              <div>{taskparams.message}</div>
            </div>
          </div>
        );

        let taskdata: EmojiRoleData[] = taskset.data;
        taskContent = taskdata.map((o) => {
          const emd = getEmojiDataFromNative(
            o.emoji,
            'twitter',
            emojiData as any
          );

          return (
            <div key={o.emoji}>
              <div className="py-1 fw-bold d-flex align-items-center">
                {emd ? <Emoji size={22} emoji={emd} set="twitter" /> : o.emoji}
                <span className="ps-2"> 이모지에서:</span>
              </div>
              {!!o.add.length && (
                <div className="d-flex flex-wrap pb-1 ps-3">
                  <span className="fw-bold pe-2" style={{ color: 'limegreen' }}>
                    - 반응 추가시 역할 추가:
                  </span>
                  {o.add.map((r) => {
                    const role = roles?.find((one) => one.id === r);
                    return (
                      <RoleBadge
                        key={r}
                        className="me-2"
                        name={role?.name ?? '(존재하지 않는 역할)'}
                        color={
                          '#' + (role?.color ? role?.color.toString(16) : 'fff')
                        }
                      />
                    );
                  })}
                </div>
              )}
              {!!o.remove.length && (
                <div className="d-flex flex-wrap pb-1 ps-3">
                  <span className="fw-bold pe-2" style={{ color: 'salmon' }}>
                    - 반응 제거시 역할 제거:
                  </span>
                  {o.remove.map((r) => {
                    const role = roles?.find((one) => one.id === r);
                    return (
                      <RoleBadge
                        key={r}
                        className="me-2"
                        name={role?.name ?? '(존재하지 않는 역할)'}
                        color={
                          '#' + (role?.color ? role?.color.toString(16) : 'fff')
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        });
        break;

      case 'join_role':
        eventName = '멤버가 참여했을 때 역할 추가';

        let joinRoleTaskData: JoinRoleData = taskset.data;
        taskContent = (
          <div className="py-1 d-flex align-items-center">
            <b className="pe-2">멤버 참여시 역할 추가:</b>
            {joinRoleTaskData.add.map((r) => {
              const role = roles?.find((one) => one.id === r);
              return (
                <RoleBadge
                  key={r}
                  className="me-2"
                  name={role?.name ?? '(존재하지 않는 역할)'}
                  color={'#' + (role?.color ? role?.color.toString(16) : 'fff')}
                />
              );
            })}
          </div>
        );
        break;
    }

    const ActionBar = (
      <ButtonGroup>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="task-list-row-remove-task">이 작업 제거하기</Tooltip>
          }
        >
          <Button
            variant="dark"
            className="d-flex px-1 remove-before bg-transparent border-0"
            onClick={() => {
              axios
                .delete(`${api}/servers/${guildId}/autotasking`, {
                  data: {
                    tasks: [taskset.uuid],
                  },
                  headers: {
                    Authorization: `Bearer ${new Cookies().get(
                      'ACCESS_TOKEN'
                    )}`,
                  },
                })
                .then(() => mutate());
            }}
          >
            <RemoveCircleOutline />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="task-list-row-remove-task">작업 수정하기</Tooltip>
          }
        >
          <Button
            variant="dark"
            className="d-flex px-1 remove-before bg-transparent border-0"
            onClick={() => {
              setEdit(taskset.uuid);
              setShowEdit(true);
            }}
          >
            <EditIcon />
          </Button>
        </OverlayTrigger>
      </ButtonGroup>
    );

    return (
      <tr>
        {isLG ? (
          <>
            <td className="align-middle text-center">
              <Form.Check
                id={`taskset-check-${taskset.uuid}`}
                type="checkbox"
                checked={checked}
                onChange={onCheckChange}
              />
            </td>

            <td className="align-middle">
              <span className="d-inline-block mw-100 fw-bold">{eventName}</span>
              <div>{eventContent}</div>
            </td>
            <td className="align-middle">
              <div className="mw-100 align-middle cursor-pointer">
                <Twemoji options={{ className: 'Twemoji' }}>
                  {taskContent}
                </Twemoji>
              </div>
            </td>
            <td className="align-middle text-center">{ActionBar}</td>
          </>
        ) : (
          <>
            <td className="align-middle text-center">
              <Form.Check
                id={`taskset-check-${taskset.uuid}`}
                type="checkbox"
                checked={checked}
                onChange={onCheckChange}
              />
            </td>
            <td>
              <span className="d-inline-block mw-100 fw-bold">{eventName}</span>

              <div className="mb-4">{eventContent}</div>

              <div className="mw-100 align-middle cursor-pointer">
                <Twemoji options={{ className: 'Twemoji' }}>
                  {taskContent}
                </Twemoji>
              </div>

              <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />

              <div>{ActionBar}</div>
            </td>
          </>
        )}
      </tr>
    );
  };

  const delSelectedTasks = () => {
    axios
      .delete(`${api}/servers/${guildId}/autotasking`, {
        data: {
          tasks: Array.from(finalSelectedSet),
        },
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      })
      .then(() => {
        setSelectedTasks(new Set());
        mutate();
      });
  };

  const patchTask = (postData: TaskSet) => {
    setEditSaving(true);
    axios
      .patch(`${api}/servers/${guildId}/autotasking`, [postData], {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      })
      .then(() => {
        mutate().then(() => {
          setEditSaving(false);
          setEdit(null);
          setShowEdit(false);
        });
      })
      .catch(() => setEditError(true));
  };

  const postTask = (postData: Omit<TaskSet, 'uuid'>) => {
    setSaving(true);
    axios
      .post(`${api}/servers/${guildId}/autotasking`, postData, {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      })
      .then(() => {
        mutate().then(() => {
          animateScroll.scrollToTop({
            isDynamic: true,
          });
          setTaskType(0);
          setAddNew(false);
        });
      })
      .catch(() => setSaveError(true))
      .finally(() => setSaving(false));
  };

  const editData = data?.find((o) => o.uuid === edit);

  return (
    <>
      <Head>
        <title>자동 작업 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {(guild) => (
            <div>
              <Row className="dashboard-section">
                <div>
                  <h3>자동 작업 설정</h3>
                  <div className="py-2">
                    어떤 동작이 발생했을 때 여러가지 작업을 자동으로 수행할 수
                    있습니다.
                  </div>
                </div>
              </Row>
              <Row>
                <Col>
                  {guild && data && members && roles && channels ? (
                    <Form noValidate>
                      {addNew && (
                        <Row className="mb-5">
                          <Col className="p-0">
                            <Card bg="dark" className="m-0 shadow">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span
                                  className="fw-bold"
                                  style={{
                                    fontFamily: 'NanumSquare',
                                    fontSize: 18,
                                  }}
                                >
                                  새 작업 추가
                                </span>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  onClick={() => {
                                    setAddNew(false);
                                    setTaskType(0);
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </Button>
                              </Card.Header>
                              <Card.Body>
                                <Form>
                                  <Form.Group className="d-flex mb-3">
                                    <Row className="align-items-center">
                                      <Form.Label column sm="auto">
                                        작업 유형 선택
                                      </Form.Label>
                                      <Col>
                                        <Form.Select
                                          className="shadow-sm"
                                          style={{ fontSize: 15 }}
                                          value={taskType}
                                          onChange={(e) =>
                                            setTaskType(e.target.value)
                                          }
                                        >
                                          <option value={0}>유형 선택</option>
                                          <option value="emoji_role">
                                            반응했을 때 역할 추가/제거
                                          </option>
                                          <option value="join_role">
                                            멤버가 참여했을 때 역할 추가
                                          </option>
                                        </Form.Select>
                                      </Col>
                                    </Row>
                                  </Form.Group>
                                  {!!taskType && (
                                    <Form.Group className="mb-0">
                                      {taskType === 'emoji_role' && (
                                        <EmojiRole
                                          guild={guild}
                                          channels={channels ?? []}
                                          roles={roles ?? []}
                                          saving={saving}
                                          saveError={saveError}
                                          onSubmit={({ data, params }) => {
                                            const postData: Omit<
                                              TaskSet<
                                                EmojiRoleParams,
                                                EmojiRoleData[]
                                              >,
                                              'uuid'
                                            > = {
                                              type: taskType,
                                              params: params,
                                              data: data,
                                            };
                                            postTask(postData);
                                          }}
                                        />
                                      )}
                                      {taskType === 'join_role' && (
                                        <JoinRole
                                          guild={guild}
                                          roles={roles ?? []}
                                          saving={saving}
                                          saveError={saveError}
                                          onSubmit={({ data, params }) => {
                                            const postData: Omit<
                                              TaskSet<{}, JoinRoleData>,
                                              'uuid'
                                            > = {
                                              type: taskType,
                                              params: params,
                                              data: data,
                                            };
                                            postTask(postData);
                                          }}
                                        />
                                      )}
                                    </Form.Group>
                                  )}
                                </Form>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      <Row className="pt-2">
                        <div className="d-flex justify-content-end align-items-center">
                          <div
                            className="me-4"
                            style={{
                              color: data.length >= 15 ? 'gold' : 'white',
                            }}
                          >
                            <b>{data.length}/15</b> 개 사용됨
                          </div>
                          <Button
                            variant="aztra"
                            size="sm"
                            className="d-flex align-items-center my-1"
                            disabled={data.length >= 15}
                            onClick={() => {
                              setAddNew(true);
                              animateScroll.scrollToTop({
                                duration: 500,
                              });
                            }}
                          >
                            <AddIcon className="me-1" />
                            새로 추가
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="d-flex align-items-center ms-3 my-1"
                            disabled={!finalSelectedSet.size}
                            onClick={() => setShowSelectedDel(true)}
                          >
                            <DeleteIcon className="me-1" />
                            선택 항목 삭제
                          </Button>
                        </div>
                      </Row>

                      <Row>
                        <Modal
                          className="modal-dark"
                          show={showSelectedDel}
                          onHide={() => setShowSelectedDel(false)}
                          centered
                        >
                          <Modal.Header closeButton>
                            <Modal.Title
                              style={{
                                fontFamily: 'NanumSquare',
                                fontWeight: 900,
                              }}
                            >
                              작업 제거하기
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="py-4">
                            선택한 작업 {finalSelectedSet.size}개를
                            제거하시겠습니까?
                          </Modal.Body>
                          <Modal.Footer className="justify-content-end">
                            <Button
                              variant="danger"
                              onClick={async () => {
                                setShowSelectedDel(false);
                                delSelectedTasks();
                              }}
                            >
                              확인
                            </Button>
                            <Button
                              variant="dark"
                              onClick={() => setShowSelectedDel(false)}
                            >
                              닫기
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      </Row>

                      <Row className="flex-column mt-3">
                        <Table
                          id="task-list-table"
                          variant="dark"
                          style={{
                            tableLayout: 'fixed',
                          }}
                          hover
                        >
                          <thead>
                            <tr>
                              <th
                                className="align-middle text-lg-center"
                                style={{ width: 50 }}
                              >
                                <Form.Check
                                  id="task-select-all"
                                  type="checkbox"
                                  checked={
                                    !!data?.length &&
                                    tasksSet.size === finalSelectedSet.size &&
                                    Array.from(tasksSet).every((value) =>
                                      finalSelectedSet.has(value)
                                    )
                                  }
                                  onChange={() => {
                                    if (
                                      tasksSet.size === finalSelectedSet.size &&
                                      Array.from(tasksSet).every((value) =>
                                        finalSelectedSet.has(value)
                                      )
                                    ) {
                                      setSelectedTasks(new Set());
                                    } else {
                                      setSelectedTasks(tasksSet);
                                    }
                                  }}
                                />
                              </th>
                              <th className="d-lg-none" />
                              <th
                                className="text-center text-lg-start d-none d-lg-table-cell"
                                style={{ width: 250 }}
                              >
                                작업 유형
                              </th>
                              <th className="text-center text-lg-start d-none d-lg-table-cell">
                                작업 내용
                              </th>
                              <th
                                className="d-none d-lg-table-cell"
                                style={{ width: 100 }}
                              />
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((one) => (
                              <TaskListCard
                                key={one.uuid}
                                taskset={one}
                                checked={finalSelectedSet.has(one.uuid)}
                                onCheckChange={() => {
                                  let sel = new Set(finalSelectedSet);

                                  if (sel.has(one.uuid)) {
                                    sel.delete(one.uuid);
                                  } else {
                                    sel.add(one.uuid);
                                  }

                                  setSelectedTasks(sel);
                                }}
                              />
                            ))}
                          </tbody>
                        </Table>
                      </Row>
                      <Row className="text-center">
                        {!data.length && (
                          <div className="my-5" style={{ color: 'lightgray' }}>
                            설정된 자동작업이 없습니다!{' '}
                            <span
                              className="cursor-pointer"
                              style={{ color: 'deepskyblue' }}
                              onClick={() => {
                                setAddNew(true);
                                animateScroll.scrollToTop({
                                  isDynamic: true,
                                  duration: 500,
                                });
                              }}
                            >
                              새로 추가
                            </span>
                            해보세요!
                          </div>
                        )}
                      </Row>
                      <Modal
                        className="modal-dark scrollbar-dark"
                        show={showEdit}
                        onHide={() => {
                          setShowEdit(false);
                          setTimeout(() => setEdit(null), 500);
                        }}
                        centered
                        size="lg"
                      >
                        <Modal.Header closeButton>
                          <Modal.Title
                            style={{
                              fontFamily: 'NanumSquare',
                              fontWeight: 900,
                            }}
                          >
                            작업 수정하기
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-4">
                          {editData?.type === 'emoji_role' && (
                            <EmojiRole
                              guild={guild}
                              channels={channels ?? []}
                              roles={roles ?? []}
                              saving={editSaving}
                              saveError={editError}
                              editMode
                              closeButton
                              defaultTask={editData}
                              onSubmit={({ data, params }) => {
                                const postData: TaskSet<
                                  EmojiRoleParams,
                                  EmojiRoleData[]
                                > = {
                                  uuid: edit!,
                                  type: 'emoji_role',
                                  params: params,
                                  data: data,
                                };
                                patchTask(postData);
                              }}
                              onClose={() => {
                                setShowEdit(false);
                                setTimeout(() => setEdit(null), 500);
                              }}
                            />
                          )}
                          {editData?.type === 'join_role' && (
                            <JoinRole
                              guild={guild}
                              roles={roles ?? []}
                              saving={editSaving}
                              saveError={editError}
                              editMode
                              closeButton
                              defaultTask={editData}
                              onSubmit={({ data, params }) => {
                                const postData: TaskSet<{}, JoinRoleData> = {
                                  uuid: edit!,
                                  type: 'join_role',
                                  params: params,
                                  data: data,
                                };
                                patchTask(postData);
                              }}
                              onClose={() => {
                                setShowEdit(false);
                                setTimeout(() => setEdit(null), 500);
                              }}
                            />
                          )}
                        </Modal.Body>
                      </Modal>
                    </Form>
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
                  )}
                </Col>
              </Row>
            </div>
          )}
        </DashboardLayout>
      </Layout>
    </>
  );
};

export default AutoTasking;
