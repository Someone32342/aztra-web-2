import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import api from 'datas/api';

import { ServerData } from 'types/dbtypes';
import { GetServerSideProps, NextPage } from 'next';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import { ChannelMinimal } from 'types/DiscordTypes';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import { faBullhorn, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import filterChannels from 'utils/filterChannels';
import ChangesNotSaved from 'components/ChangesNotSaved';
import Router from 'next/router';

interface GeneralRouterProps {
  guildId: string;
}

type handleFieldChangeTypes = 'channel';

export const getServerSideProps: GetServerSideProps<
  GeneralRouterProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

const General: NextPage<GeneralRouterProps> = ({ guildId }) => {
  const [guildPrefix, setGuildPrefix] = useState<string | null>(null);
  const [useNoticeChannel, setUseNoticeChannel] = useState(false);

  const [validChannel, setValidChannel] = useState<boolean | null>(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [noticeChannel, setNoticeChannel] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [preload, setPreload] = useState(true);
  const [changed, setChanged] = useState(false);

  const [guildPrefixValidate, setGuildPrefixValidate] = useState<
    boolean | null
  >(null);

  const initData = (data: ServerData) => {
    setGuildPrefix(data.prefix);
    setNoticeChannel(data.noticeChannel);
    setUseNoticeChannel(!!data.noticeChannel);
  };

  const { data, mutate } = useSWR<ServerData, AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/serverdata`)
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

  const save = async () => {
    setSaving(true);
    let saveData: Partial<ServerData> = {
      prefix: guildPrefix ?? undefined,
      noticeChannel: useNoticeChannel ? noticeChannel ?? undefined : null,
    };

    try {
      await axios.patch(`${api}/servers/${guildId}/serverdata`, saveData, {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      });
      await mutate();
    } catch (e) {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

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
      useNoticeChannel
        ? !!data?.noticeChannel || !!noticeChannel
          ? null
          : false
        : null,
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

  const handleSubmit = () => {
    if (checkValidate()) {
      save();
    }
  };

  const isChanged = () => {
    if (!data) {
      setChanged(false);
      return false;
    }

    const rst =
      data.prefix !== guildPrefix ||
      data.noticeChannel !== noticeChannel ||
      useNoticeChannel !== !!data.noticeChannel;
    setChanged(rst);
    return rst;
  };

  const filteredChannels = filterChannels(channels ?? [], channelSearch, [
    'GUILD_TEXT',
    'GUILD_NEWS',
  ]);

  return (
    <>
      <Head>
        <title>일반 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            data && channels ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>일반 설정</h3>
                    <div className="py-2">
                      기본적인 Aztra 설정을 변경할 수 있습니다.
                    </div>
                  </div>
                </Row>
                <Row>
                  <Col>
                    <Form noValidate>
                      <Row className="pt-3 pb-4">
                        <div>
                          <h4>봇 접두사 설정</h4>
                          <Form.Text>
                            명령어 앞에 붙는 접두사를 변경합니다. 기본값은 {"'"}{' '}
                            <b>.</b> {"'"} (마침표) 입니다.
                          </Form.Text>
                        </div>
                      </Row>

                      <Row>
                        <Form.Label column xs="auto" className="fw-bold">
                          봇 접두사:{' '}
                        </Form.Label>
                        <Col className="p-0" xs="auto" sm={3} lg={2} xl={1}>
                          <Form.Group controlId="levelingSetting">
                            <Form.Control
                              type="text"
                              className="shadow-sm"
                              value={guildPrefix ?? data.prefix}
                              isInvalid={guildPrefixValidate === false}
                              placeholder="."
                              onChange={(e) => {
                                const value = e.target.value;
                                setGuildPrefixValidate(
                                  value.length !== 0 && value.length <= 100
                                );
                                setGuildPrefix(value);
                              }}
                            />
                            <Form.Control.Feedback type="invalid">
                              {(guildPrefix?.length ?? -1) === 0 &&
                                '필수 입력입니다.'}
                              {(guildPrefix?.length ?? -1) > 100 &&
                                '100자 이하여야 합니다.'}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col className="p-0">
                          <hr
                            style={{ borderColor: '#4e5058', borderWidth: 2 }}
                          />
                        </Col>
                      </Row>

                      <Row className="py-4">
                        <div>
                          <h4>공지 채널 설정</h4>
                          <Form.Text>
                            Aztra 봇으로부터 공지 메시지를 받을 채널을
                            선택합니다. 이 메시지에는 서버 점검 등 중요 알림이
                            포함될 수 있습니다.
                          </Form.Text>
                        </div>
                      </Row>

                      <Row>
                        <Col>
                          <Form.Group
                            controlId="generalSetting"
                            className="pb-4"
                          >
                            <Form.Check
                              type="switch"
                              label={
                                <div className="ps-2 fw-bold">
                                  Aztra 공지 메시지 받기
                                </div>
                              }
                              checked={useNoticeChannel}
                              onChange={() =>
                                setUseNoticeChannel(!useNoticeChannel)
                              }
                              aria-controls="useNoticeChannel"
                              aria-expanded={!!useNoticeChannel}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {useNoticeChannel && (
                        <>
                          <Row>
                            <Col md={8}>
                              <Form.Group>
                                <Container fluid>
                                  <Row className="mb-3 flex-column">
                                    {channels?.find(
                                      (one) =>
                                        one.id ===
                                        (noticeChannel ?? data.noticeChannel)
                                    ) ? (
                                      <>
                                        <h5 className="ps-0 pe-2">
                                          현재 선택됨:{' '}
                                        </h5>
                                        <Card bg="secondary" className="px-0">
                                          <Card.Header
                                            className="py-1 px-3"
                                            style={{
                                              fontFamily: 'NanumSquare',
                                              fontSize: '13pt',
                                            }}
                                          >
                                            {channels?.find(
                                              (one) =>
                                                one.id ===
                                                (noticeChannel ??
                                                  data.noticeChannel)
                                            )?.type === 'GUILD_TEXT' ? (
                                              <FontAwesomeIcon
                                                icon={faHashtag}
                                                className="me-2 my-auto"
                                                size="sm"
                                              />
                                            ) : (
                                              <FontAwesomeIcon
                                                icon={faBullhorn}
                                                className="me-2 my-auto"
                                                size="sm"
                                              />
                                            )}
                                            {
                                              channels?.find(
                                                (one) =>
                                                  one.id ===
                                                  (noticeChannel ??
                                                    data.noticeChannel)
                                              )?.name
                                            }
                                          </Card.Header>
                                        </Card>
                                      </>
                                    ) : (
                                      <Form.Label
                                        as="h5"
                                        className={
                                          validChannel === false
                                            ? 'text-danger fw-bold'
                                            : ''
                                        }
                                      >
                                        선택된 채널이 없습니다!
                                      </Form.Label>
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
                                    <Form.Text className="ps-0 py-1">
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
                                    {filteredChannels.map((one) => (
                                      <ChannelSelectCard
                                        key={one.id}
                                        selected={
                                          noticeChannel === one.id ||
                                          (!noticeChannel &&
                                            one.id === data.noticeChannel)
                                        }
                                        channelData={{
                                          channelName: one.name,
                                          parentChannelName: channels?.find(
                                            (c) => c.id === one.parentId
                                          )?.name,
                                        }}
                                        onClick={() => setNoticeChannel(one.id)}
                                      />
                                    ))}
                                  </Row>
                                </Container>
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
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

export default General;
