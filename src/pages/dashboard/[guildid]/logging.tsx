import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios, { AxiosError } from 'axios';
import ChangesNotSaved from 'components/ChangesNotSaved';
import DashboardLayout from 'components/DashboardLayout';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import Layout from 'components/Layout';
import api from 'datas/api';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  FormCheckProps,
  Row,
  Spinner,
} from 'react-bootstrap';
import useSWR from 'swr';
import { LoggingSet as LoggingSetType } from 'types/dbtypes';
import { ChannelMinimal } from 'types/DiscordTypes';
import Cookies from 'universal-cookie';
import urljoin from 'url-join';
import filterChannels from 'utils/filterChannels';

interface LoggingOptionCheckboxProps extends FormCheckProps {
  label?: string;
  flag: number;
}

type handleFieldChangeTypes = 'channel';

interface LoggingRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<
  LoggingRouterProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

const Logging: NextPage<LoggingRouterProps> = ({ guildId }) => {
  const [useLogging, setUseLogging] = useState(false);
  const [flag, setFlag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [validChannel, setValidChannel] = useState<boolean | null>(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [newChannel, setNewChannel] = useState<ChannelMinimal | null>(null);

  const [preload, setPreload] = useState(true);
  const [changed, setChanged] = useState(false);

  const initData = (data: LoggingSetType | null) => {
    setUseLogging(!!Number(data?.flags));
    setFlag(data?.flags ?? '0');
  };

  const { data, mutate } = useSWR<LoggingSetType | null, AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/logging`)
      : null,
    (url) =>
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        })
        .then((r) => r.data),
    {
      onSuccess: initData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
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
    }

    setTimeout(() => setPreload(false), 1000);

    if (data) initData(data);
  }, [data]);

  useEffect(() => {
    const message = '저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?';

    const routeChangeStart = (url: string) => {
      if (Router.asPath !== url && changed && !confirm(message)) {
        Router.events.emit('routeChangeError');
        Router.replace(Router, Router.asPath);
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e: BeforeUnloadEvent) => {
      if (changed) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', beforeunload);
    Router.events.on('routeChangeStart', routeChangeStart);

    return () => {
      window.removeEventListener('beforeunload', beforeunload);
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [changed]);

  const setValidate = (type?: handleFieldChangeTypes) => {
    const All = [
      useLogging ? (!!data?.channel || !!newChannel ? null : false) : null,
    ];
    const [CH] = All;

    switch (type) {
      case 'channel':
        setValidChannel(CH);
        break;
      default:
        for (let x of ['channel']) {
          setValidate(x as handleFieldChangeTypes);
        }
    }
    return All;
  };

  const checkValidate = () => {
    return setValidate()?.every((o) => o === null) ?? false;
  };

  const save = async () => {
    setSaving(true);

    try {
      if (useLogging && flag !== '0') {
        let saveData: LoggingSetType = {
          channel: newChannel?.id || data?.channel!,
          flags: flag ?? '0',
        };
        await axios.post(`${api}/servers/${guildId}/logging`, saveData, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        });
        mutate(saveData);
      } else {
        await axios.delete(`${api}/servers/${guildId}/logging`, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        });
        mutate(null);
      }
    } catch (e) {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (checkValidate()) {
      save();
    }
  };

  const isChanged = () => {
    if (!data || !channels) {
      setChanged(!!Number(data?.flags) != useLogging);
      return !!Number(data?.flags) != useLogging;
    }

    const rst =
      (data.channel !== newChannel?.id && newChannel !== null) ||
      data.flags !== flag ||
      !!Number(data?.flags) != useLogging;

    setChanged(rst);
    return rst;
  };

  const LoggingOptionCheckbox: React.FC<
    Omit<
      LoggingOptionCheckboxProps,
      'custom' | 'type' | 'defaultChecked' | 'onChange'
    >
  > = (props) => (
    <Form.Check
      {...props}
      custom
      type="checkbox"
      label={
        <div className="ps-2" style={{ fontSize: '11pt' }}>
          {props.label}
        </div>
      }
      checked={!!(Number(flag) & props.flag)}
      onChange={() => toggleFlag(props.flag)}
    />
  );

  const toggleFlag = (flagBit: number) => {
    let fl = BigInt(flag!);
    let bigIntFlagBit = BigInt(flagBit);
    if (fl & bigIntFlagBit) {
      setFlag((fl - bigIntFlagBit).toString());
    } else {
      setFlag((fl | bigIntFlagBit).toString());
    }
  };

  const filteredChannels = filterChannels(channels ?? [], channelSearch);

  return (
    <>
      <Head>
        <title>로깅 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            data !== undefined ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>로깅 설정</h3>
                    <div className="py-2">
                      서버에서 무언가 새로 추가되거나, 변경되거나, 제거되었을 때
                      그 내용을 특정 채널에 기록합니다.
                    </div>
                  </div>
                </Row>
                <Row>
                  <Col>
                    <Form noValidate>
                      <Form.Group controlId="useLogging" className="pb-4">
                        <Form.Check
                          type="switch"
                          label={
                            <div className="ps-2 fw-bold">로깅 사용하기</div>
                          }
                          checked={useLogging}
                          onChange={() => setUseLogging(!useLogging)}
                          aria-controls="useLogging"
                          aria-expanded={!!useLogging}
                        />
                      </Form.Group>
                      {useLogging && (
                        <div className="px-3">
                          <Row>
                            <Col>
                              <Button
                                variant="dark"
                                size="sm"
                                className="me-3"
                                onClick={() =>
                                  setFlag(
                                    (
                                      (1 << (0x20000).toString(2).length) -
                                      1
                                    ).toString()
                                  )
                                }
                              >
                                모두 선택
                              </Button>
                              <Button
                                variant="dark"
                                size="sm"
                                onClick={() => setFlag('0')}
                              >
                                모두 선택 해제
                              </Button>
                            </Col>
                          </Row>
                          <Row className="pt-4">
                            <Col xs={12} sm={6} xl={3} className="pb-4">
                              <h4 className="pb-2">메시지 로깅</h4>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-message-deleted"
                                  className="pb-1"
                                  label="메시지가 삭제되었을 때"
                                  flag={0x1}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-message-edited"
                                  className="pb-1"
                                  label="메시지가 수정되었을 때"
                                  flag={0x2}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-message-pinned"
                                  className="pb-1"
                                  label="메시지가 고정되었을 때"
                                  flag={0x4}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-message-unpinned"
                                  className="pb-1"
                                  label="메시지가 고정 해제되었을 때"
                                  flag={0x8}
                                />
                              </Form.Group>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-reaction-removed"
                                  className="pb-1"
                                  label="반응이 제거되었을 때"
                                  flag={0x10}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-reaction-cleared"
                                  className="pb-1"
                                  label="모든 반응이 제거되었을 때"
                                  flag={0x20}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} xl={3} className="pb-4">
                              <h4 className="pb-2">채널 로깅</h4>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-guild-channel-created"
                                  className="pb-1"
                                  label="채널이 생성되었을 때"
                                  flag={0x40}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-guild-channel-deleted"
                                  className="pb-1"
                                  label="채널이 삭제되었을 때"
                                  flag={0x80}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-guild-channel-edited"
                                  className="pb-1"
                                  label="채널이 수정되었을 때"
                                  flag={0x100}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} xl={3} className="pb-4">
                              <h4 className="pb-2">멤버 로깅</h4>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-member-joined"
                                  className="pb-1"
                                  label="멤버가 참여했을 때"
                                  flag={0x200}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-member-left"
                                  className="pb-1"
                                  label="멤버가 나갔을 때"
                                  flag={0x400}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-member-edited"
                                  className="pb-1"
                                  label="멤버가 수정되었을 때"
                                  flag={0x800}
                                />
                              </Form.Group>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-member-banned"
                                  className="pb-1"
                                  label="멤버가 차단되었을 때"
                                  flag={0x1000}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-member-unbanned"
                                  className="pb-1"
                                  label="멤버의 차단이 해제되었을 때"
                                  flag={0x2000}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={12} sm={6} xl={3} className="pb-4">
                              <h4 className="pb-2">서버 로깅</h4>
                              <Form.Group>
                                <LoggingOptionCheckbox
                                  id="logging-guild-updated"
                                  className="pb-1"
                                  label="서버 설정이 변경되었을 때"
                                  flag={0x4000}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-guild-role-created"
                                  className="pb-1"
                                  label="역할이 생성되었을 때"
                                  flag={0x8000}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-guild-role-deleted"
                                  className="pb-1"
                                  label="역할이 삭제되었을 때"
                                  flag={0x10000}
                                />
                                <LoggingOptionCheckbox
                                  id="logging-guild-role-edited"
                                  className="pb-1"
                                  label="역할이 수정되었을 때"
                                  flag={0x20000}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="pt-4 pb-2">
                            <h4 className="pe-5">전송 채널</h4>
                          </Row>
                          <Row>
                            <Col md={12} lg={9} xl={8}>
                              <Form.Group>
                                <Container fluid>
                                  <Row className="mb-3 flex-column">
                                    {newChannel ||
                                    channels?.find(
                                      (one) => one.id === data?.channel
                                    ) ? (
                                      <>
                                        <h5 className="pe-2 px-0">
                                          현재 선택됨:{' '}
                                        </h5>
                                        <Card bg="secondary">
                                          <Card.Header
                                            className="py-1 px-0"
                                            style={{
                                              fontFamily: 'NanumSquare',
                                              fontSize: '13pt',
                                            }}
                                          >
                                            <FontAwesomeIcon
                                              icon={faHashtag}
                                              className="me-2 my-auto"
                                              size="sm"
                                            />
                                            {newChannel?.name ||
                                              channels?.find(
                                                (one) =>
                                                  one.id === data?.channel
                                              )?.name}
                                          </Card.Header>
                                        </Card>
                                      </>
                                    ) : (
                                      <h5
                                        className={
                                          validChannel === false
                                            ? 'text-danger fw-bold px-0'
                                            : 'px-0'
                                        }
                                      >
                                        선택된 채널이 없습니다!
                                      </h5>
                                    )}
                                  </Row>
                                  <Row className="pb-2">
                                    <input hidden={true} />
                                    <Form.Control
                                      type="text"
                                      placeholder="채널 검색"
                                      onChange={(e) =>
                                        setChannelSearch(e.target.value)
                                      }
                                    />
                                    <Form.Text className="py-1 px-0">
                                      {filteredChannels.length}개 채널 찾음
                                    </Form.Text>
                                  </Row>
                                  <Row
                                    style={{
                                      maxHeight: 220,
                                      overflow: 'auto',
                                      borderRadius: '10px',
                                      display: 'block',
                                    }}
                                  >
                                    {channels ? (
                                      filteredChannels.map((one) => (
                                        <ChannelSelectCard
                                          key={one.id}
                                          selected={
                                            newChannel === one ||
                                            (!newChannel &&
                                              one.id === data?.channel)
                                          }
                                          channelData={{
                                            channelName: one.name,
                                            parentChannelName: channels?.find(
                                              (c) => c.id === one.parentId
                                            )?.name,
                                          }}
                                          onClick={() => setNewChannel(one)}
                                        />
                                      ))
                                    ) : (
                                      <h4>불러오는 중</h4>
                                    )}
                                  </Row>
                                </Container>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {!saveError && isChanged() ? (
                        <ChangesNotSaved
                          key="changesNotSaved1"
                          onSave={handleSubmit}
                          onReset={() => initData(data)}
                          isSaving={saving}
                          isSaveError={saveError}
                        />
                      ) : (
                        <div style={{ opacity: preload ? 0 : 1 }}>
                          <ChangesNotSaved key="changesNotSaved2" close />
                        </div>
                      )}
                    </Form>
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

export default Logging;
