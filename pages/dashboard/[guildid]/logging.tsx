import axios, { AxiosError } from 'axios'
import DashboardLayout from 'components/DashboardLayout'
import Layout from 'components/Layout'
import api from 'datas/api'
import { GetServerSideProps, NextPage } from 'next'
import React, { useState } from 'react'
import { Button, Col, Form, FormCheckProps, Row, Spinner } from 'react-bootstrap'
import useSWR from 'swr'
import { LoggingSet as LoggingSetType } from 'types/dbtypes'
import Cookies from 'universal-cookie'
import urljoin from 'url-join'

interface LoggingOptionCheckboxProps extends FormCheckProps {
  label?: string
  flag: number
}



interface LoggingRouterProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<LoggingRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Logging: NextPage<LoggingRouterProps> = ({ guildId }) => {
  const [useLogging, setUseLogging] = useState(false)
  const [flag, setFlag] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { data } = useSWR<LoggingSetType, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/logging`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      onSuccess: data => {
        setUseLogging(!!Number(data.flags))
        setFlag(data.flags)
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const LoggingOptionCheckbox: React.FC<Omit<LoggingOptionCheckboxProps, 'custom' | 'type' | 'as' | 'defaultChecked' | 'onChange'>> = props => {
    return <Form.Check
      {...props}
      as="input"
      custom
      type="checkbox"
      label={
        <div className="pl-2" style={{ fontSize: '11pt' }}>{props.label}</div>
      }
      defaultChecked={getDefaultFlag(props.flag)}
      onChange={() => toggleFlag(props.flag)}
    />
  }

  const toggleFlag = (flagBit: number) => {
    let fl = Number(flag)
    if (fl && flagBit) {
      setFlag((fl - flagBit).toString())
    }
    else {
      setFlag((fl | flagBit).toString())
    }
  }

  const getDefaultFlag = (flagBit: number) => {
    return !!(Number(data?.flags ?? 0) & flagBit)
  }

  return (
    <Layout>
      <DashboardLayout guildId={guildId}>
        {
          () => (
            <div>
              <Row className="dashboard-section">
                <div>
                  <h3>로깅 설정</h3>
                  <div className="py-2">
                    서버에서 무언가 새로 추가되거나, 변경되거나, 제거되었을 때 그 내용을 특정 채널에 기록합니다.
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
                          <div className="pl-2 font-weight-bold">
                            로깅 사용하기
                            </div>
                        }
                        checked={useLogging}
                        onChange={() => setUseLogging(!useLogging)}
                        aria-controls="useLogging"
                        aria-expanded={!!useLogging}
                      />
                    </Form.Group>
                    {
                      useLogging &&
                      <Row>
                        <Col xs={12} sm={6} xl={3} className="pb-4">
                          <h4 className="pb-2">
                            메시지 로깅
                              </h4>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-message-deleted" className="pb-1" label="메시지가 삭제되었을 때" flag={0x1} />
                            <LoggingOptionCheckbox id="logging-message-edited" className="pb-1" label="메시지가 수정되었을 때" flag={0x2} />
                            <LoggingOptionCheckbox id="logging-message-pinned" className="pb-1" label="메시지가 고정되었을 때" flag={0x4} />
                            <LoggingOptionCheckbox id="logging-message-unpinned" className="pb-1" label="메시지가 고정 해제되었을 때" flag={0x8} />
                          </Form.Group>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-reaction-removed" className="pb-1" label="반응이 제거되었을 때" flag={0x10} />
                            <LoggingOptionCheckbox id="logging-reaction-cleared" className="pb-1" label="모든 반응이 제거되었을 때" flag={0x20}  />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} xl={3} className="pb-4">
                          <h4 className="pb-2">
                            채널 로깅
                              </h4>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-guild-channel-created" className="pb-1" label="채널이 생성되었을 때" flag={0x40} />
                            <LoggingOptionCheckbox id="logging-guild-channel-deleted" className="pb-1" label="채널이 삭제되었을 때" flag={0x80} />
                            <LoggingOptionCheckbox id="logging-guild-channel-edited" className="pb-1" label="채널이 수정되었을 때" flag={0x100} />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} xl={3} className="pb-4">
                          <h4 className="pb-2">
                            멤버 로깅
                              </h4>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-member-joined" className="pb-1" label="멤버가 참여했을 때" flag={0x200} />
                            <LoggingOptionCheckbox id="logging-member-left" className="pb-1" label="멤버가 나갔을 때" flag={0x400} />
                            <LoggingOptionCheckbox id="logging-member-edited" className="pb-1" label="멤버가 수정되었을 때" flag={0x800} />
                          </Form.Group>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-member-banned" className="pb-1" label="멤버가 차단되었을 때" flag={0x1000} />
                            <LoggingOptionCheckbox id="logging-member-unbanned" className="pb-1" label="멤버의 차단이 해제되었을 때" flag={0x2000} />
                          </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} xl={3} className="pb-4">
                          <h4 className="pb-2">
                            서버 로깅
                              </h4>
                          <Form.Group>
                            <LoggingOptionCheckbox id="logging-guild-updated" className="pb-1" label="서버 설정이 변경되었을 때" flag={0x4000} />
                            <LoggingOptionCheckbox id="logging-guild-role-created" className="pb-1" label="역할이 생성되었을 때" flag={0x8000} />
                            <LoggingOptionCheckbox id="logging-guild-role-deleted" className="pb-1" label="역할이 삭제되었을 때" flag={0x10000} />
                            <LoggingOptionCheckbox id="logging-guild-role-edited" className="pb-1" label="역할이 수정되었을 때" flag={0x20000} />
                          </Form.Group>
                        </Col>
                      </Row>
                    }
                    <Row className="mt-4">
                      <Button
                        variant={saveError ? "danger" : "aztra"}
                        style={{
                          minWidth: 140
                        }}
                      >
                        {
                          saving
                            ? <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="pl-2">저장 중...</span>
                            </>
                            : <span>저장하기</span>
                        }
                      </Button>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </div>
          )
        }
      </DashboardLayout>
    </Layout>
  )
}

export default Logging