import React, { useEffect } from 'react';

import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { ChannelMinimal, MemberMinimal } from 'types/DiscordTypes';
import { Row, Container, Spinner, Form, Table, Tab, Tabs } from 'react-bootstrap';
import { ErrorOutline as ErrorOutlineIcon, Check as CheckIcon } from '@material-ui/icons'

import BackTo from 'components/BackTo';

import { Ticket } from 'types/dbtypes';

import { GetServerSideProps, NextPage } from 'next';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Cookies from 'universal-cookie';

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import MemberCell from 'components/MemberCell';
dayjs.locale('ko')
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

interface TicketListProps {
  guildId: string
  ticketId: string
}

interface TicketListCardProps {
  onCheckChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
  checked?: boolean
  ticket: Ticket
}

export const getServerSideProps: GetServerSideProps<TicketListProps> = async context => {
  const { guildid, ticketid } = context.query
  return {
    props: {
      guildId: guildid as string,
      ticketId: ticketid as string
    }
  }
}

const TicketList: NextPage<TicketListProps> = ({ guildId, ticketId }) => {
  const { data } = useSWR<Ticket[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/tickets`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      refreshInterval: 5000
    }
  )

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      refreshInterval: 5000
    }
  )

  const { data: channels } = useSWR<ChannelMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/channels`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }, [])

  const TicketListCard: React.FC<TicketListCardProps> = ({ ticket, onCheckChange, checked }) => {
    return (
      <tr>
        <td className="align-middle text-center">
          <Form.Check
            id={`ticket-check-${ticket.uuid}`}
            type="checkbox"
            custom
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td>
          <b>{channels?.find(o => o.id === ticket.channel)?.name ?? <u>(존재하지 않는 채널)</u>}</b>
        </td>
        <td>
        <div className="d-flex justify-content-center justify-content-lg-start">
          <MemberCell member={members?.find(o => o.user.id === ticket.opener)!} guildId={guildId} wrap />
        </div>
        </td>
      </tr>
    )
  }

  const ListTable: React.FC<{ mode: 'open' | 'closed' }> = ({ mode }) => {
    return (
      <Table id={`ticket-${mode}-list-table`} variant="dark" style={{
        tableLayout: 'fixed'
      }} >
        <thead>
          <tr>
            <th className="align-middle text-center" style={{ width: 50 }}>
              <Form.Check
                id="ticket-select-all"
                custom
                type="checkbox"
              />
            </th>
            <th className="text-center text-md-left" style={{ width: '20%' }}>채널</th>
            <th className="text-center text-md-left d-none d-md-table-cell">생성자</th>
            <th style={{ width: 100 }} />
          </tr>
        </thead>
        <tbody>
          {data?.filter(o => o.status === mode).map(one => <TicketListCard key={one.uuid} ticket={one} />)}
        </tbody>
      </Table>
    )
  }

  return (
    <>
      <Head>
        <title>세부 티켓 관리 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => data && members
              ? (
                <div>
                  <Row className="dashboard-section">
                    <div>
                      <BackTo className="pl-2 mb-4" name="티켓 설정" to={`/dashboard/${guildId}/tickets`} />
                      <h3>세부 티켓 관리</h3>
                    </div>
                  </Row>

                  <Row className="flex-column mt-3 nav-tabs-dark">
                    <Tabs defaultActiveKey="open" id="ticket-list-tabs" transition={false}>
                      <Tab eventKey="open" title={<><ErrorOutlineIcon className="mr-2" />열린 티켓</>}>
                        <ListTable mode="open" />
                      </Tab>
                      <Tab eventKey="closed" title={<><CheckIcon className="mr-2" />닫힌 티켓</>}>
                        <ListTable mode="closed" />
                      </Tab>
                    </Tabs>
                  </Row>
                </div>
              )
              : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
                height: '500px'
              }}>
                <h3 className="pb-4">불러오는 중</h3>
                <Spinner animation="border" variant="aztra" />
              </Container>
          }
        </DashboardLayout>
      </Layout>
    </>
  )
}

export default TicketList