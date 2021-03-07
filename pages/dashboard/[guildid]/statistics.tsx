import React, { useEffect } from 'react'
import { Badge, Container, Row, Spinner, Tab, Tabs } from 'react-bootstrap'
import { TrendingUp as TrendingUpIcon, Group as GroupIcon } from '@material-ui/icons'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { GetServerSideProps, NextPage } from 'next'
import DashboardLayout from 'components/DashboardLayout'
import Layout from 'components/Layout'

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsUTC from 'dayjs/plugin/utc'
import Head from 'next/head'
import { MemberCount, MsgCount } from 'types/dbtypes'
import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import useSWR from 'swr'
import Cookies from 'universal-cookie'
import urljoin from 'url-join'
import Growth from 'components/statistics/Growth'
import EachMembers from 'components/statistics/EachMembers'
import { MemberMinimal } from 'types/DiscordTypes'
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsUTC)


export interface StatisticsProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<StatisticsProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Statistics: NextPage<StatisticsProps> = ({ guildId }) => {
  const { data: memberCounts } = useSWR<MemberCount[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/statistics/membercounts`) : null,
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

  const { data: msgCounts } = useSWR<MsgCount[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/statistics/msgcounts`) : null,
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
        <title>통계 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => memberCounts && msgCounts && members ? (
              <>
                <Row className="dashboard-section">
                  <div>
                    <h3>
                      통계
                      <Badge variant="aztra" className="ml-2 mb-auto mt-1" style={{ fontSize: 15 }}>베타</Badge>
                    </h3>
                    <div className="py-2">
                      서버의 각종 통계를 보여줍니다. Aztra가 초대된 이후에 정보 수집이 시작됩니다. 메시지 통계는 Aztra에 <b>메시지 읽기</b> 권한이 있는 채널만 수집됩니다.
                    </div>
                  </div>
                </Row>
                <Row className="flex-column nav-tabs-dark">
                  <Tabs defaultActiveKey="growth" id="statistic-tabs">
                    <Tab eventKey="growth" title={<><TrendingUpIcon className="mr-2" />서버 통계</>}>
                      <Growth memberCounts={memberCounts} msgCounts={msgCounts} />
                    </Tab>
                    <Tab eventKey="members" disabled={process.env.NODE_ENV === "production"} title={<><GroupIcon className="mr-2" />멤버별 통계(개발중)</>}>
                      <EachMembers members={members} />
                    </Tab>
                    <Tab eventKey="ranking" disabled={process.env.NODE_ENV === "production"} title={<><FontAwesomeIcon icon={faTrophy} className="mr-2" />순위(개발중)</>}></Tab>
                  </Tabs>
                </Row>
              </>
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

export default Statistics