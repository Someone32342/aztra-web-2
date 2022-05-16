import React, { createElement, ReactElement, useEffect, useRef } from 'react';
import type { Identifier, XYCoord } from 'dnd-core';
import {
  Row,
  Spinner,
  Container,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
  FormControl,
  Dropdown,
} from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import {
  PersonAdd as PersonAddIcon,
  AddCircleOutlineOutlined as AddCicleOutlineOutlinedIcon,
  RemoveCircleOutlineOutlined as RemoveCicleOutlineOutlinedIcon,
  Delete as DeleteIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  CancelScheduleSendOutlined as CancelScheduleSendOutlinedIcon,
  BlockOutlined as BlockOutlinedIcon,
  LabelOutlined as LabelOutlinedIcon,
  LabelOffOutlined as LabelOffOutlinedIcon,
  PersonRemoveOutlined as PersonRemoveOutlinedIcon,
} from '@mui/icons-material';
import styles from 'styles/pages/workflows.module.scss';
import classNames from 'classnames/bind';
import BackTo from 'components/BackTo';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';
import RoleBadge, { AddRole } from 'components/forms/RoleBadge';
import useSWR from 'swr';
import { PartialGuildExtend, Role } from 'types/DiscordTypes';
import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import urljoin from 'url-join';
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { debounce } from 'debounce';
import { scroller } from 'react-scroll';

const cx = classNames.bind(styles);

interface Work {
  index: number;
  uid: string;
  workId: string;
}

interface WorkflowsEditRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<
  WorkflowsEditRouterProps
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
          zIndex: 999,
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
          zIndex: 999,
          border: '2px solid rgb(40, 43, 49)',
        }}
      />
    </>
  );
};

const WorkflowsEdit: NextPage<WorkflowsEditRouterProps> = ({ guildId }) => {
  const [works, setWorks] = React.useState<Work[]>([]);

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

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location;
      localStorage.setItem('loginFrom', lct.pathname + lct.search);
      window.location.assign('/login');
    }
  }, []);

  const WorkBlock: React.FC<{
    children: ReactElement | null;
    work: Work;
    moveCard: (dragIndex: number, hoverIndex: number, newWork?: Work) => void;
    style?: React.CSSProperties;
  }> = ({ children, work, moveCard, style = {} }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<
      Work,
      void,
      { handlerId: Identifier | null }
    >({
      accept: 'block',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover: debounce((item: Work, monitor: DropTargetMonitor<Work, void>) => {
        if (!ref.current) {
          return;
        }

        const dragIndex = item.index;
        const hoverIndex = work.index;

        if (!works[dragIndex] || !works[hoverIndex]) {
          setWorks([...works, item]);
        }

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect();

        if (!hoverBoundingRect) {
          return;
        }

        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY =
          (clientOffset as XYCoord).y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Time to actually perform the action
        moveCard(dragIndex, hoverIndex, item);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      }, 20),
    });

    const [{ isDragging }, drag] = useDrag({
      type: 'block',
      item: () => {
        return work;
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
      <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
        {children}
      </div>
    );
  };

  const WorkCard: React.FC<{
    workId: string;
    icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
      muiName: string;
    };
    name: string;
  }> = ({ workId, icon, name }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'block',
      item: () => {
        const item = {
          uid: Math.floor(Math.random() * Date.now()).toString(),
          workId,
          index: works.length,
        };

        return item;
      },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<Work>();
        if (item && dropResult) {
        }
      },
      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
          handlerId: monitor.getHandlerId(),
        };
      },
    }));

    const opacity = isDragging ? 0.4 : 1;

    return (
      <Card
        ref={drag}
        data-testid={`palette-${workId}`}
        id={`palette-${workId}`}
        bg="dark"
        className="shadow-sm"
        style={{ cursor: 'move', opacity }}
      >
        <Card.Body className="d-flex align-items-center" style={{ height: 45 }}>
          {createElement(icon, { className: 'me-2' })}
          {name}
        </Card.Body>
      </Card>
    );
  };

  const DeleteBar: React.FC = () => {
    const [{ isOver, canDrop }, drop] = useDrop<
      Work,
      void,
      { isOver: boolean; canDrop: boolean }
    >({
      accept: 'block',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      drop: (item: Work) => {
        setWorks(
          works
            .filter((w) => w.uid !== item.uid)
            .map((w, index) => ({ ...w, index }))
        );

        let audio = new Audio('/assets/sounds/delete.mp3');
        audio.volume = 0.7;
        audio.play();
      },
    });

    return (
      <div
        ref={drop}
        className={cx(
          'deleteButton',
          'p-2',
          'd-flex',
          'justify-content-center',
          'align-items-end'
        )}
        style={{
          backgroundColor:
            canDrop && isOver ? 'rgba(255, 37, 23, 0.2)' : 'transparent',
          width: 58,
          height: '100%',
        }}
      >
        <OverlayTrigger
          overlay={
            <Tooltip id="tooltip-delete" style={{ wordBreak: 'keep-all' }}>
              블록을 삭제하려면 이곳으로 드래그하세요.
            </Tooltip>
          }
          placement="top"
        >
          <DeleteIcon
            className="mb-3"
            fontSize="large"
            htmlColor={canDrop && isOver ? 'red' : ''}
          />
        </OverlayTrigger>
      </div>
    );
  };

  const Board: React.FC<{ guild: PartialGuildExtend }> = ({ guild }) => {
    const [{ handlerId }, drop] = useDrop<
      Work,
      void,
      { handlerId: Identifier | null }
    >({
      accept: 'block',
      drop: (item: Work, monitor) => {
        const newWorks = works.filter((w) => w.uid !== item.uid);

        newWorks.push(item);
        setWorks(newWorks);

        let audio = new Audio('/assets/sounds/drop.mp3');
        audio.volume = 0.7;
        audio.play();
      },
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
    });

    return (
      <Col
        ref={drop}
        xs={12}
        lg={8}
        className="rounded d-flex flex-column align-items-center py-5 position-relative"
        style={{
          minHeight: '20%',
          backgroundColor: 'rgb(30, 32, 36)',
        }}
      >
        <Card
          className="shadow w-50"
          style={{ backgroundColor: 'rgb(40, 43, 49)' }}
        >
          <Card.Body className="d-flex py-3" style={{ minHeight: 50 }}>
            <PersonAddIcon className="me-2" />
            <div>
              <div className="mb-2 text-start">멤버가 참여했을 때</div>
              <small className="bg-dark px-2 py-1" style={{ borderRadius: 40 }}>
                제외: 봇
              </small>
            </div>
          </Card.Body>
        </Card>
        <HorizontalConnection />

        {works
          .sort((a, b) => a.index - b.index)
          .filter((w) => w.index !== -1)
          .map((one, index) => (
            <DragableWorkBlock key={one.uid} guild={guild} work={one} />
          ))}
        <div style={{ height: 100 }} />
        <DeleteBar />
      </Col>
    );
  };

  const DragableWorkBlock: React.FC<{
    guild: PartialGuildExtend;
    work: Work;
  }> = ({ guild, work }) => {
    return (
      <>
        <WorkBlock
          key={Math.floor(Math.random() * Date.now()).toString()}
          work={work}
          moveCard={debounce(
            (dragIndex: number, hoverIndex: number, newWork?: Work) => {
              console.log(dragIndex, hoverIndex, newWork?.index);

              const newWorks = [...works];

              newWorks[dragIndex].index = hoverIndex;
              newWorks[hoverIndex].index = dragIndex;

              newWorks.splice(hoverIndex, 1);
              newWorks.splice(dragIndex, 0, work);
              setWorks(newWorks);
            },
            50
          )}
          style={{
            width: '50%',
            textAlign: 'center',
          }}
        >
          <Card
            id={`workblock-${work.uid}`}
            className="shadow"
            style={{
              backgroundColor: 'rgb(40, 43, 49)',
              cursor: 'move',
            }}
          >
            <Card.Body className="d-flex py-3" style={{ minHeight: 50 }}>
              {work.workId === 'role-add' && (
                <>
                  <AddCicleOutlineOutlinedIcon className="me-2" />
                  <div>
                    <div className="mb-2 text-start">역할 추가하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      역할:
                    </small>
                    <span className="d-inline-flex align-items-center gap-1">
                      <RoleBadge
                        color="deeppink"
                        name="유저"
                        width={11}
                        height={11}
                        fontSize={13}
                      />
                      <Dropdown
                        className="dropdown-menu-dark"
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        onSelect={(key) => {}}
                      >
                        <Dropdown.Toggle
                          className="remove-after py-1"
                          as={AddRole}
                          id={`add-role-select-toggle=${work.uid}`}
                          width={11}
                          height={11}
                        />
                        <Dropdown.Menu
                          style={{
                            maxHeight: 300,
                            overflowY: 'scroll',
                          }}
                        >
                          {roles
                            ?.filter((r) => r.id !== guild?.id && !r.managed)
                            .sort((a, b) => b.position - a.position)
                            .map((r) => (
                              <Dropdown.Item
                                key={r.id}
                                eventKey={r.id}
                                style={{
                                  color: '#' + r.color.toString(16),
                                }}
                              >
                                {r.name}
                              </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </span>
                  </div>
                </>
              )}
              {work.workId === 'role-remove' && (
                <>
                  <RemoveCicleOutlineOutlinedIcon className="me-2" />
                  <div>
                    <div className="mb-2 text-start">역할 제거하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      역할:
                    </small>
                    <span className="d-inline-flex align-items-center gap-1">
                      <RoleBadge
                        color="deeppink"
                        name="유저"
                        width={11}
                        height={11}
                        fontSize={13}
                      />
                      <Dropdown
                        className="dropdown-menu-dark"
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        onSelect={(key) => {}}
                      >
                        <Dropdown.Toggle
                          className="remove-after py-1"
                          as={AddRole}
                          id={`add-role-select-toggle=${work.uid}`}
                          width={11}
                          height={11}
                        />
                        <Dropdown.Menu
                          style={{
                            maxHeight: 300,
                            overflowY: 'scroll',
                          }}
                        >
                          {roles
                            ?.filter((r) => r.id !== guild?.id && !r.managed)
                            .sort((a, b) => b.position - a.position)
                            .map((r) => (
                              <Dropdown.Item
                                key={r.id}
                                eventKey={r.id}
                                style={{
                                  color: '#' + r.color.toString(16),
                                }}
                              >
                                {r.name}
                              </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </span>
                  </div>
                </>
              )}
              {work.workId === 'warn-add' && (
                <>
                  <WarningAmberOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">경고 추가하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      횟수: 1회
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'warn-remove' && (
                <>
                  <WarningAmberOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">경고 제거하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      횟수: 1회
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'mute' && (
                <>
                  <CancelScheduleSendOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">멤버 뮤트하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      동안: 3잁
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'give-exp' && (
                <>
                  <LabelOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">경험치 지급하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      경험치: 200
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'collect-exp' && (
                <>
                  <LabelOffOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">경험치 차감하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      경험치: 200
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'kick' && (
                <>
                  <PersonRemoveOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">멤버 추방하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      사유: 테스트
                    </small>
                  </div>
                </>
              )}
              {work.workId === 'ban' && (
                <>
                  <BlockOutlinedIcon className="me-2" />
                  <div className="text-start">
                    <div className="mb-2">멤버 차단하기</div>
                    <small
                      className="bg-dark px-2 py-1 me-2"
                      style={{
                        borderRadius: 40,
                        opacity: 0.9,
                      }}
                    >
                      사유: 테스트
                    </small>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </WorkBlock>
        <div className="d-flex flex-column align-items-center justify-content-center">
          <HorizontalConnection />
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>My Workflow 구성하기 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {(guild) =>
            true ? (
              <DndProvider backend={HTML5Backend}>
                <div>
                  <Row className="mb-3">
                    <div>
                      <BackTo
                        className="ps-2 mb-4"
                        name="워크플로우"
                        to={`/dashboard/${guildId}/workflows`}
                      />
                      <h3 className="mb-3">워크플로우 구성</h3>
                      <div className="py-2 d-flex align-items-center flex-wrap gap-2">
                        <b className="flex-shrink-0">워크플로우 이름:</b>
                        <FormControl
                          type="text"
                          className="py-1"
                          placeholder="워크플로우 이름"
                          defaultValue="My Workflow 1"
                          style={{ maxWidth: 240 }}
                        />
                      </div>
                    </div>
                  </Row>

                  <Row
                    style={{
                      minHeight: 'calc(100vh - 280px)',
                      overflow: 'visible',
                    }}
                  >
                    <Board guild={guild!} />
                    <Col xs={12} lg={4} className="px-3 pe-0">
                      <div
                        className="d-flex flex-column gap-2"
                        style={{
                          position: 'sticky',
                          top: 75,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <small
                            className="flex-shrink-0 fw-bold"
                            style={{ color: 'whitesmoke' }}
                          >
                            작업 팔레트
                          </small>
                          <hr className="w-100 ms-2 my-0" />
                        </div>
                        <WorkCard
                          workId="role-add"
                          icon={AddCicleOutlineOutlinedIcon}
                          name="역할 추가하기"
                        />
                        <WorkCard
                          workId="role-remove"
                          icon={RemoveCicleOutlineOutlinedIcon}
                          name="역할 제거하기"
                        />
                        <WorkCard
                          workId="warn-add"
                          icon={WarningAmberOutlinedIcon}
                          name="경고 추가하기"
                        />
                        <WorkCard
                          workId="warn-remove"
                          icon={WarningAmberOutlinedIcon}
                          name="경고 제거하기"
                        />
                        <WorkCard
                          workId="mute"
                          icon={CancelScheduleSendOutlinedIcon}
                          name="멤버 뮤트하기"
                        />
                        <WorkCard
                          workId="give-exp"
                          icon={LabelOutlinedIcon}
                          name="경험치 지급하기"
                        />
                        <WorkCard
                          workId="collect-exp"
                          icon={LabelOffOutlinedIcon}
                          name="경험치 차감하기"
                        />
                        <WorkCard
                          workId="kick"
                          icon={PersonRemoveOutlinedIcon}
                          name="멤버 추방하기"
                        />
                        <WorkCard
                          workId="ban"
                          icon={BlockOutlinedIcon}
                          name="멤버 차단하기"
                        />
                        <div className="h-100" />
                      </div>
                    </Col>
                  </Row>
                </div>
              </DndProvider>
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

export default WorkflowsEdit;
