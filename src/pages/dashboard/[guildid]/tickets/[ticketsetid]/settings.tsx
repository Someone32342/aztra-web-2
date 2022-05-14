import React, { useEffect, useLayoutEffect, useState } from 'react';

import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import { ChannelMinimal, MemberMinimal, Role } from 'types/DiscordTypes';
import {
  Row,
  Container,
  Spinner,
  Tab,
  Tabs,
  Card,
  Modal,
  Button,
} from 'react-bootstrap';
import {
  InfoOutlined as InfoOutlinedIcon,
  AssignmentInd as AssignmentIndIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

import BackTo from 'components/BackTo';

import { Ticket, TicketSet } from 'types/dbtypes';

import { GetServerSideProps, NextPage } from 'next';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Cookies from 'universal-cookie';

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import dayjsUTC from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import GeneralSettings from 'components/tickets/GeneralSettings';
import PermissionSettings from 'components/tickets/PermissionSettings';
import Router from 'next/router';
import MessageSettings from 'components/tickets/MessageSettings';
dayjs.locale('ko');
dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsUTC);

interface TicketListProps {
  guildId: string;
  ticketsetId: string;
}

export const getServerSideProps: GetServerSideProps<TicketListProps> = async (
  context
) => {
  const { guildid, ticketsetid } = context.query;
  return {
    props: {
      guildId: guildid as string,
      ticketsetId: ticketsetid as string,
    },
  };
};

type TabsType = 'general' | 'permissions' | 'message';

const TicketSettings: NextPage<TicketListProps> = ({
  guildId,
  ticketsetId,
}) => {
  const [activeTab, setActiveTab] = useState<TabsType>('general');
  const [preload, setPreload] = useState(true);
  const [preloadTimeout, setPreloadTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const { data, mutate } = useSWR<TicketSet[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/ticketsets`)
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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { data: tickets } = useSWR<Ticket[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/tickets`)
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
      refreshInterval: 5000,
    }
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
        .then((r) => r.data),
    {
      refreshInterval: 5000,
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
    } else {
      const tab = location.hash.slice(1);
      if (['general', 'permissions', 'message'].includes(tab)) {
        setActiveTab(tab as TabsType);
      }
    }
  }, []);

  useEffect(() => {
    if (data && members && channels && tickets && roles) {
      console.log('asdf');
      setPreloadTimeout(setTimeout(() => setPreload(false), 1000));
    }
  }, [data, members, channels, tickets, roles]);

  const ticketSet = data?.find((o) => o.uuid === ticketsetId && !o.deleted);

  return (
    <>
      <Head>
        <title>세부 티켓 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {(guild) =>
            guild && data && members && channels && tickets && roles ? (
              <>
                <Row className="dashboard-section">
                  <div>
                    <BackTo
                      className="ps-2 mb-4"
                      name="티켓 설정"
                      to={`/dashboard/${guildId}/tickets`}
                    />
                    <h3>세부 티켓 설정</h3>
                  </div>
                </Row>

                <Row className="flex-column px-3">
                  <Card bg="dark" className="px-1">
                    <Card.Body className="py-2 d-flex align-items-center">
                      티켓:
                      <h5
                        className="mb-0 ps-2"
                        style={{ fontFamily: 'NanumSquare' }}
                      >
                        {ticketSet?.name}
                      </h5>
                    </Card.Body>
                  </Card>
                </Row>

                <Row className="flex-column mt-3 nav-tabs-dark px-3">
                  {ticketSet ? (
                    <Tabs
                      activeKey={activeTab}
                      id="ticket-list-tabs"
                      transition={false}
                      onSelect={(e) => {
                        setPreload(true);
                        location.hash = e ?? 'general';
                        setActiveTab(e as TabsType);
                        if (preloadTimeout) {
                          clearTimeout(preloadTimeout);
                        }
                        setPreloadTimeout(
                          setTimeout(() => setPreload(false), 1000)
                        );
                      }}
                    >
                      <Tab
                        eventKey="general"
                        title={
                          <>
                            <InfoOutlinedIcon className="me-2" />
                            일반 설정
                          </>
                        }
                      >
                        <GeneralSettings
                          channels={channels}
                          ticketSet={ticketSet}
                          tickets={tickets!}
                          mutate={mutate}
                          preload={preload}
                        />
                      </Tab>
                      <Tab
                        eventKey="permissions"
                        title={
                          <>
                            <AssignmentIndIcon className="me-2" />
                            권한 설정
                          </>
                        }
                      >
                        <PermissionSettings
                          ticketSet={ticketSet}
                          roles={roles}
                          members={members}
                          guild={guild}
                          mutate={mutate}
                          preload={preload}
                        />
                      </Tab>
                      <Tab
                        eventKey="message"
                        title={
                          <>
                            <ChatIcon className="me-2" />
                            메시지 설정
                          </>
                        }
                      >
                        <MessageSettings
                          ticketSet={ticketSet}
                          mutate={mutate}
                          preload={preload}
                        />
                      </Tab>
                    </Tabs>
                  ) : (
                    <Modal
                      className="modal-dark"
                      show
                      centered
                      onHide={() => {}}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title
                          style={{
                            fontFamily: 'NanumSquare',
                            fontWeight: 900,
                          }}
                        >
                          존재하지 않는 티켓 설정
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="py-4">
                        티켓 설정을 찾는 데 실패했습니다! 해당 티켓이 삭제되었을
                        수 있습니다.
                      </Modal.Body>
                      <Modal.Footer className="justify-content-end">
                        <Button
                          variant="aztra"
                          onClick={() =>
                            Router.push(
                              `/dashboard/${guildId}/tickets`,
                              undefined,
                              { shallow: true }
                            )
                          }
                        >
                          티켓 목록으로 돌아가기
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  )}
                </Row>
              </>
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

export default TicketSettings;
