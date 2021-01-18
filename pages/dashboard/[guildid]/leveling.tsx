import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import api from 'datas/api'

import { ServerData } from 'types/dbtypes/serverdata'
import { GetServerSideProps, NextPage } from 'next'
import Cookies from 'universal-cookie'
import Layout from 'components/Layout'
import DashboardLayout from 'components/DashboardLayout'
import useSWR from 'swr'
import urljoin from 'url-join'

interface LevelingRouterProps {
  guildId: string
}

export const getServerSideProps: GetServerSideProps<LevelingRouterProps> = async context => {
  const { guildid } = context.query
  return {
    props: {
      guildId: guildid as string
    }
  }
}

const Leveling: NextPage<LevelingRouterProps> = ({ guildId }) => {
  const [useLevelupMessage, setUseLevelupMessage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { data, mutate } = useSWR<ServerData, AxiosError>(
    new Cookies().get('ACCESS_TOKEN') ? urljoin(api, `/servers/${guildId}/serverdata`) : null,
    url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
      }
    })
      .then(r => r.data),
    {
      onSuccess: data => setUseLevelupMessage(data.sendLevelMessage),
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  const save = async () => {
    setSaving(true)
    let saveData: ServerData = {
      sendLevelMessage: useLevelupMessage,
      noticeChannel: data?.noticeChannel!
    }

    try {
      await axios.post(`${api}/servers/${guildId}/serverdata`, saveData, {
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
        },
      })
      mutate(saveData)
    }
    catch (e) {
      setSaveError(true)
    }
    finally {
      setSaving(false)
    }
  }

  const handleSubmit = (e: React.MouseEvent<HTMLElement>) => save()

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location
      localStorage.setItem('loginFrom', lct.pathname + lct.search)
      window.location.assign('/login')
    }
  }, [])

  const isChanged = () => {
    if (!data) {
      return false
    }

    return (
      data.sendLevelMessage !== useLevelupMessage
    )
  }

  return (
    <Layout>
      <DashboardLayout guildId={guildId}>
        {
          () => data ? (
            <div>
              <Row className="dashboard-section">
                <div>
                  <h3>레벨링 설정</h3>
                  <div className="py-2">
                    멤버가 메시지를 보낼 때 마다 경험치를 얻고, 레벨을 올릴 수 있습니다.
                    </div>
                </div>
              </Row>
              <Row>
                <Col>
                  <Form noValidate>
                    <Row className="pb-2">
                      <h4>레벨 메시지 설정</h4>
                    </Row>

                    <Form.Group controlId="levelingSetting">
                      <Form.Check
                        type="switch"
                        label={
                          <div className="pl-2">
                            멤버의 레벨이 올랐을 때 메시지 보내기
                            </div>
                        }
                        checked={useLevelupMessage}
                        onChange={() => setUseLevelupMessage(!useLevelupMessage)}
                        aria-controls="incomingForm"
                        aria-expanded={!!useLevelupMessage}
                      />
                    </Form.Group>

                    <Row className="mt-4">
                      <Button
                        variant={saveError ? "danger" : "aztra"}
                        disabled={saving || saveError || !isChanged()}
                        onClick={handleSubmit}
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
                            : <span>{saveError ? "오류" : isChanged() ? "저장하기" : "저장됨"}</span>
                        }
                      </Button>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </div>
          ) : <Container className="d-flex align-items-center justify-content-center flex-column" style={{
            height: '500px'
          }}>
              <h3 className="pb-4">불러오는 중</h3>
              <Spinner animation="border" variant="aztra" />
            </Container>
        }
      </DashboardLayout>
    </Layout>
  )
}

export default Leveling