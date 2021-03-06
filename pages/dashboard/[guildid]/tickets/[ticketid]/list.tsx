import React, { useEffect } from 'react';

import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { MemberExtended } from 'types/DiscordTypes';
import { Row, Container, Spinner, Form, Table } from 'react-bootstrap';

import BackTo from 'components/BackTo';

import {  Warns } from 'types/dbtypes';

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
dayjs.locale('ko')
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)

interface MemberDashboardRouteProps {
  guildId: string
  memberId: string
}

export const getServerSideProps: GetServerSideProps<MemberDashboardRouteProps> = async context => {
  const { guildid, memberid } = context.query
  return {
    props: {
      guildId: guildid as string,
      memberId: memberid as string
    }
  }
}

const MemberDashboard: NextPage<MemberDashboardRouteProps> = ({ guildId, memberId }) => {
  const { data } = useSWR<Warns[], AxiosError>(
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

  const { data: member } = useSWR<MemberExtended, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members/${memberId}`) : null,
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

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }, [])

  return (
    <>
      <Head>
        <title>세부 티켓 관리 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => data && member
              ? (
                <div>
                  <Row className="dashboard-section">
                    <div>
                      <BackTo className="pl-2 mb-4" name="티켓 설정" to={`/dashboard/${guildId}/tickets`} />
                      <h3>세부 티켓 관리</h3>
                    </div>
                  </Row>

                  <Row className="flex-column mt-3">
                    <Table id="warn-list-table" variant="dark" style={{
                      tableLayout: 'fixed'
                    }} >
                      <thead>
                        <tr>
                          <th className="align-middle text-center" style={{ width: 50 }}>
                            <Form.Check
                              id="warn-select-all"
                              custom
                              type="checkbox"
                            />
                          </th>
                          <th className="text-center text-md-left" style={{ width: '20%' }}>채널</th>
                          <th className="text-center text-md-left d-none d-md-table-cell">내용</th>
                          <th style={{ width: 100 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {data?.map(one => <TicketsetListCard ticketSet={one} />)}
                      </tbody>
                    </Table>
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

export default MemberDashboard