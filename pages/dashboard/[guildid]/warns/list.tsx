import React, { useEffect, useRef, useState } from 'react';

import axios, { AxiosError } from 'axios'
import api from 'datas/api'
import { Warns as WarnsType } from 'types/dbtypes/warns';
import MobileAlert from 'components/MobileAlert'
import { Row, Col, Form, Container, Spinner, Button, Table, ButtonGroup, OverlayTrigger, Tooltip, Popover, Modal, Overlay } from 'react-bootstrap';
import { MemberMinimal } from 'types/DiscordTypes';
import { RemoveCircleOutline, FileCopy as FileCopyIcon, OpenInNew as OpenInNewIcon } from '@material-ui/icons'
import BackTo from 'components/BackTo';
import { GetServerSideProps, NextPage } from 'next';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';

export interface WarnsListRouteProps {
  guildId: string
}

type WarnSearchType = 'reason' | 'target' | 'warnby'

type WarnSortType = 'latest' | 'oldest' | 'count' | 'count_least'

interface MemberCellProps {
  member: MemberMinimal
  guildId: string
  wrap?: boolean
}

const MemberCell: React.FC<MemberCellProps> = ({ member, guildId, wrap = false }) => {
  return member !== undefined
    ?
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`member-${member.user.id}-tag-tooltip`}>
          @{member.user.tag}
        </Tooltip>
      }
    >
      {
        ({ ref, ...triggerHandler }) => (
          <a href={`/dashboard/${guildId}/members/${member.user.id}`} {...triggerHandler} className="d-flex align-items-center">
            <img
              ref={ref}
              className="rounded-circle no-drag"
              src={member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}` : member.user.defaultAvatarURL}
              alt={member.user.tag!}
              style={{
                height: 30,
                width: 30
              }}
              {...triggerHandler}
            />
            <div className={wrap ? "ml-lg-3" : "ml-3"}>
              <span className={`${wrap ? 'd-none d-lg-block' : ''} font-weight-bold`}>
                {member.displayName}
              </span>

            </div>
          </a>
        )
      }
    </OverlayTrigger>
    : <span className="font-italic">(존재하지 않는 멤버)</span>
}

interface WarnsListCardProps {
  target: MemberMinimal
  warnby: MemberMinimal
  warn: WarnsType
  guildId: string
  onDelete: Function
}

const WarnsListCard: React.FC<WarnsListCardProps> = ({ target, warnby, warn, guildId, onDelete }) => {
  const [showInfo, setShowInfo] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [copied, setCopied] = useState(false)
  const warnReasonRef = useRef<HTMLParagraphElement>(null)
  const copyButtonRef = useRef<HTMLButtonElement>(null)

  const delWarn = (uuid: string) => {
    axios.delete(`${api}/servers/${guildId}/warns/${uuid}`, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(() => onDelete())
  }

  return (
    <tr>
      <td className="align-middle text-center">
        <Form.Check style={{
          transform: 'scale(1.25)',
          WebkitTransform: 'scale(1.25)'
        }} />
      </td>
      <td className="align-middle">
        <div className="d-flex justify-content-center justify-content-lg-start">
          <MemberCell member={target!} guildId={guildId} wrap />
        </div>
      </td>
      <td className="align-middle d-none d-md-table-cell">
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={
            <Popover id={`member-${warn.member}-warn-reason-details`} style={{
              maxWidth: 500
            }}>
              <Popover.Title className="font-weight-bold">
                경고 사유 자세히
            </Popover.Title>
              <Popover.Content>
                <div className="p-1">
                  {warn.reason}
                </div>
                <div className="d-flex my-2">
                  <Button size="sm" variant="secondary" className="d-flex align-items-center">
                    <FileCopyIcon className="mr-1" style={{ transform: 'scale(0.8)' }} />
                  복사하기
                </Button>
                </div>
              </Popover.Content>
            </Popover>
          }
        >
          <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer">
            {warn.reason}
          </span>
        </OverlayTrigger>
      </td>
      <td className="align-middle">{warn.count}회</td>
      <td className="align-middle">
        <div className="d-flex justify-content-center justify-content-lg-start">
          <MemberCell member={warnby!} guildId={guildId} wrap />
        </div>
      </td>
      <td className="align-middle text-center">
        <ButtonGroup>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="warn-list-row-remove-warn">
                이 경고 취소하기
              </Tooltip>
            }
          >
            <Button variant="dark" className="d-flex px-1 remove-before" onClick={() => setShowDel(true)}>
              <RemoveCircleOutline />
            </Button>
          </OverlayTrigger>

          <Modal className="modal-dark" show={showDel} onHide={() => setShowDel(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{
                fontFamily: "NanumSquare",
                fontWeight: 900,
              }}>
                경고 취소하기
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
              이 경고를 취소하시겠습니까?
            </Modal.Body>
            <Modal.Footer className="justify-content-end">
              <Button variant="aztra" onClick={async () => {
                await setShowDel(false)
                delWarn(warn.uuid)
              }}>
                확인
              </Button>
              <Button variant="dark" onClick={() => setShowDel(false)}>
                닫기
              </Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="warn-list-row-remove-warn">
                경고 자세히 보기
              </Tooltip>
            }
          >
            <Button variant="dark" className="d-flex px-1 remove-before" onClick={() => setShowInfo(true)}>
              <OpenInNewIcon />
            </Button>
          </OverlayTrigger>

          <Modal className="modal-dark" show={showInfo} onHide={() => setShowInfo(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title style={{
                fontFamily: "NanumSquare",
                fontWeight: 900,
              }}>
                경고 상세 정보
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
              <Container>
                <Row>
                  <Col xs={12} md={6}>
                    <h5 className="font-weight-bold">대상 멤버</h5>
                    <p>
                      <MemberCell guildId={guildId!} member={target} />
                    </p>
                  </Col>
                  <Col xs={12} md={6}>
                    <h5 className="font-weight-bold">경고 부여자</h5>
                    <p>
                      <MemberCell guildId={guildId!} member={warnby} />
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6}>
                    <h5 className="font-weight-bold">경고 횟수</h5>
                    <p>
                      {warn.count}회
                    </p>
                  </Col>
                  <Col xs={12} md={6}>
                    <h5 className="font-weight-bold">경고 날짜</h5>
                    <p>
                      {new Date(warn.dt).toLocaleString()}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <h5 className="font-weight-bold">경고 사유</h5>
                    <p ref={warnReasonRef}>
                      {warn.reason}
                    </p>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
              <div>
                <Button ref={copyButtonRef} size="sm" variant="aztra" onClick={() => {
                  navigator.clipboard.writeText(warn.reason)
                    .then(async () => {
                      if (!copied) {
                        await setCopied(true)
                        await setTimeout(() => setCopied(false), 800)
                      }
                    })
                }}>
                  <FileCopyIcon className="mr-2" style={{ transform: 'scale(0.9)' }} />
                  경고 사유 복사
                </Button>

                <Overlay target={copyButtonRef.current} show={copied}>
                  {(props) => (
                    <Tooltip id="wan-copied-tooltop" {...props}>
                      복사됨!
                    </Tooltip>
                  )}
                </Overlay>
              </div>
              <Button variant="success" onClick={() => setShowInfo(false)}>닫기</Button>
            </Modal.Footer>
          </Modal>

        </ButtonGroup>
      </td>
    </tr>
  )
}

export const getServerSideProps: GetServerSideProps<WarnsListRouteProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const WarnsList: NextPage<WarnsListRouteProps> = ({ guildId }) => {
  const [warnSearch, setWarnSearch] = useState('')
  const [searchType, setSearchType] = useState<WarnSearchType>('reason')
  const [sortType, setSortType] = useState<WarnSortType>('latest')

  const searchRef = useRef<HTMLInputElement>(null)

  const parseQs = () => {
    const params = new URLSearchParams(window.location.search)
    let searchtype = params.get('type')
    setWarnSearch(params.get('search') || '')
    setSearchType(['reason', 'target', 'warnby'].includes(searchtype || '') ? searchtype as WarnSearchType : 'reason')
  }

  const { data: warns, mutate: warnsMutate } = useSWR<WarnsType[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/warns`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data)
  )

  const { data: members, mutate: membersMutate } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/discord/guilds/${guildId}/members`) : null,
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
    else {
      parseQs()
    }
  }, [])

  const filterSortWarns = (search?: string) => (
    warns
      ?.filter(one => {
        if (!search) return true
        let searchLowercase = search.normalize().toLowerCase()

        switch (searchType) {
          case 'reason':
            return one.reason.normalize().toLowerCase().includes(searchLowercase)
          case 'target':
            let target = members?.find(m => m.user.id === one.member)
            return target?.user.tag?.normalize().toLowerCase().includes(searchLowercase) || target?.nickname?.normalize().toLowerCase().includes(searchLowercase)
          case 'warnby':
            let warnby = members?.find(m => m.user.id === one.warnby)
            return warnby?.user.tag?.normalize().toLowerCase().includes(searchLowercase) || warnby?.nickname?.normalize().toLowerCase().includes(searchLowercase)
          default:
            return false
        }
      })
      .sort((a, b) => {
        switch (sortType) {
          case 'latest':
            return new Date(b.dt).getTime() - new Date(a.dt).getTime()
          case 'oldest':
            return new Date(a.dt).getTime() - new Date(b.dt).getTime()
          case 'count':
            return b.count - a.count
          case 'count_least':
            return a.count - b.count
          default:
            return 0
        }
      })!
  )

  const handleSearchTypeOnChange = (searchType: WarnSearchType) => {
    setSearchType(searchType)
    if (searchRef.current) {
      searchRef.current.value = ''
      setWarnSearch('')
    }
  }

  const handleSortTypeOnChange = (sortType: WarnSortType) => {
    setSortType(sortType)
  }

  const filteredWarns = (
    (filterSortWarns(warnSearch) || warns)?.map(one => {
      const target = members?.find(m => m.user.id === one.member)
      const warnby = members?.find(m => m.user.id === one.warnby)
      return <WarnsListCard key={one.uuid} target={target!} warnby={warnby!} warn={one} guildId={guildId} onDelete={() => warnsMutate()} />
    })
  )

  return (
    <Layout>
      <DashboardLayout guildId={guildId}>
        {
          () => (
            <div style={{
              fontFamily: 'NanumBarunGothic'
            }}>
              <Row className="dashboard-section">
                <div>
                  <BackTo className="pl-2 mb-4" name="경고 관리" to={`/dashboard/${guildId}/warns`} />
                  <h3>전체 경고 목록</h3>
                </div>
              </Row>
              <Row className="d-md-none">
                <MobileAlert />
              </Row>
              <Row>
                <Col>
                  {
                    members && warns
                      ? <Form>
                        <Form.Group>
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
                              전체 경고 {warns?.length} 건{warnSearch && `, ${warns.length}건 검색됨`}
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
                                  <Form.Check className="ml-4" type="radio" label="경고 사유" checked={searchType === 'reason'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSearchTypeOnChange('reason')} />
                                  <Form.Check className="ml-4" type="radio" label="대상 멤버" checked={searchType === 'target'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSearchTypeOnChange('target')} />
                                  <Form.Check className="ml-4" type="radio" label="경고 부여자" checked={searchType === 'warnby'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSearchTypeOnChange('warnby')} />
                                </div>
                              </div>
                              <div className="d-flex mt-4 mt-lg-0">
                                <span>정렬 조건:</span>
                                <div className="d-lg-flex">
                                  <Form.Check className="ml-4" type="radio" label="최신순" checked={sortType === 'latest'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSortTypeOnChange('latest')} />
                                  <Form.Check className="ml-4" type="radio" label="과거순" checked={sortType === 'oldest'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSortTypeOnChange('oldest')} />
                                  <Form.Check className="ml-4" type="radio" label="경고수 많은순" checked={sortType === 'count'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSortTypeOnChange('count')} />
                                  <Form.Check className="ml-4" type="radio" label="경고수 적은순" checked={sortType === 'count_least'} style={{ wordBreak: 'keep-all' }} onChange={() => handleSortTypeOnChange('count_least')} />
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Row className="mb-2">
                            <input hidden={true} />
                            <Form.Control ref={searchRef} type="text" placeholder="경고 검색" defaultValue={warnSearch} onChange={e => {
                              setWarnSearch(e.target.value)
                            }} />
                          </Row>

                          <Row className="flex-column">
                            <Table id="warn-list-table" variant="dark" style={{
                              tableLayout: 'fixed'
                            }} >
                              <thead>
                                <tr>
                                  <th className="align-middle text-center" style={{ width: 50 }}>
                                    <Form.Check style={{
                                      transform: 'scale(1.25)',
                                      WebkitTransform: 'scale(1.25)'
                                    }} />
                                  </th>
                                  <th className="text-center text-md-left" style={{ width: '17%' }}>대상 멤버</th>
                                  <th className="text-center text-md-left d-none d-md-table-cell">경고 사유</th>
                                  <th className="text-center text-md-left" style={{ width: '10%' }}>경고 횟수</th>
                                  <th className="text-center text-md-left" style={{ width: '17%' }}>경고 부여자</th>
                                  <th style={{ width: 100 }} />
                                </tr>
                              </thead>
                              <tbody>
                                {filteredWarns}
                              </tbody>
                            </Table>
                          </Row>
                        </Form.Group>
                      </Form>
                      : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
                        height: '500px'
                      }}>
                        <h3 className="pb-4 text-center">경고 목록을 가져오고 있습니다...</h3>
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
  )
}

export default WarnsList