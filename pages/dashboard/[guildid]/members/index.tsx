import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { MemberMinimal } from 'types/DiscordTypes';
import { Row, Col, Form, Container, Spinner, Pagination } from 'react-bootstrap';
import MemberListCard from 'components/forms/MemberListCard';
import Cookies from 'universal-cookie';
import { GetServerSideProps, NextPage } from 'next';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';

interface MembersRouterProps {
  guildId: string
}

type MemberSearchType = 'nick-and-tag' | 'id'

const PER_PAGE = 50

export const getServerSideProps: GetServerSideProps<MembersRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Members: NextPage<MembersRouterProps> = ({ guildId }) => {
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSearchType, setMemberSearchType] = useState<MemberSearchType>('nick-and-tag')
  const [page, setPage] = useState(0)

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }, [])

  const filterMembers = (search?: string) => {
    return members
      ?.filter(one => {
        if (!search) return true
        let searchLowercase = search.normalize().toLowerCase()

        switch (memberSearchType) {
          case 'nick-and-tag':
            return one.user.tag?.normalize().toLowerCase().includes(searchLowercase) || one.nickname?.normalize().toLowerCase().includes(searchLowercase)
          case 'id':
            return one.user.id.startsWith(search)
          default:
            return true
        }
      })
      .sort((a, b) => {
        let aDname = a.displayName!
        let bDname = b.displayName!
        if (aDname > bDname) return 1
        else if (aDname < bDname) return -1
        return 0
      })
  }

  const handleMemberSearchTypeOnChange = (searchType: MemberSearchType) => {
    setMemberSearchType(searchType)
    setMemberSearch('')
  }

  const filteredMembers = filterMembers(memberSearch) || members
  const slicedMembers = filteredMembers?.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const PageBar = (
    <div className="pagination-dark d-flex justify-content-center">
      <Pagination>
        <Pagination.First onClick={() => setPage(0)} />
        {
          Array.from(Array(Math.trunc((filteredMembers?.length ?? 0) / PER_PAGE) || 1).keys())
            .filter(o =>
              page - 3 < 0 ? o < 7 : (o >= page - 3 && o <= page + 3)
            )
            .map(i => <Pagination.Item key={i + 1} children={i + 1} active={page === i} onClick={() => setPage(i)} />)
        }
        <Pagination.Last onClick={() => setPage((Math.trunc((filteredMembers?.length ?? 0) / PER_PAGE) || 1) - 1)} />
      </Pagination>
    </div>
  )

  return (
    <>
      <Head>
        <title>멤버 목록 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {
            () => (
              <div style={{
                fontFamily: 'NanumBarunGothic'
              }}>
                <Row className="dashboard-section">
                  <h3>멤버 목록</h3>
                </Row>
                <Row>
                  <Col>
                    {
                      members
                        ? <Form>
                          <Form.Group>
                            <Row>
                              <Col>
                                {PageBar}
                              </Col>
                            </Row>

                            <Row className="pb-2 justify-content-between">
                              <Col
                                className="d-flex align-items-end mt-4 mt-xl-0 px-0"
                                xs={{
                                  span: 0,
                                  order: "last"
                                }}
                                xl={{
                                  order: "first"
                                }}
                                style={{
                                  fontSize: '12pt'
                                }}>
                                멤버 전체 {members?.length} 명{memberSearch && `, ${filteredMembers?.length}명 검색됨`}
                              </Col>
                              <Col
                                className="px-0"
                                xs={{
                                  span: "auto",
                                  order: "first"
                                }}
                                xl={{
                                  span: "auto",
                                  order: "last"
                                }}>
                                <div className="d-flex">
                                  <span>검색 조건:</span>
                                  <div className="d-lg-flex">
                                    <Form.Check
                                      id="member-search-by-name-and-nick"
                                      custom
                                      className="ml-4"
                                      type="radio"
                                      label="이름 및 닉네임"
                                      checked={memberSearchType === 'nick-and-tag'}
                                      style={{ wordBreak: 'keep-all' }}
                                      onChange={() => handleMemberSearchTypeOnChange('nick-and-tag')}
                                    />
                                    <Form.Check
                                      id="member-search-by-user-id"
                                      custom
                                      className="ml-4"
                                      type="radio"
                                      label="사용자 ID"
                                      checked={memberSearchType === 'id'}
                                      style={{ wordBreak: 'keep-all' }}
                                      onChange={() => handleMemberSearchTypeOnChange('id')}
                                    />
                                  </div>
                                </div>
                              </Col>
                            </Row>

                            <Row className="mb-2">
                              <input hidden={true} />
                              <Form.Control type="text" placeholder={memberSearchType === "id" ? "멤버 아이디 검색 (숫자만 입력할 수 있습니다)" : "멤버 검색"} value={memberSearch} onChange={e => {
                                if (memberSearchType === "id" && isNaN(Number(e.target.value))) return
                                setMemberSearch(e.target.value)
                                setPage(0)
                              }} />
                            </Row>

                            <Row className="flex-column mb-5">
                              {slicedMembers?.map(one => <MemberListCard key={one.user.id} member={one} guildId={guildId as string} />)}
                            </Row>

                            <Row>
                              <Col>
                                {PageBar}
                              </Col>
                            </Row>
                          </Form.Group>
                        </Form>
                        : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
                          height: '500px'
                        }}>
                          <h3 className="pb-4">불러오는 중</h3>
                          <Spinner animation="border" variant="aztra" />
                        </Container>
                    }
                  </Col>
                </Row>
              </div>
            )
          }
        </DashboardLayout>
      </Layout>
    </>
  )
}

export default Members
