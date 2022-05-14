import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from 'datas/api';

import { GetServerSideProps, NextPage } from 'next';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import { Billboard } from 'types/dbtypes';
import { ChannelMinimal } from 'types/DiscordTypes';
import { animateScroll } from 'react-scroll';

interface AutoTaskingRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<
  AutoTaskingRouterProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

interface BoardListCardProps {
  onCheckChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  billboard: Billboard;
}

const AutoTasking: NextPage<AutoTaskingRouterProps> = ({ guildId }) => {
  const [addNew, setAddNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const { data } = useSWR<Billboard[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/billboards`)
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

  const BoardListCard: React.FC<BoardListCardProps> = ({
    billboard,
    onCheckChange,
    checked,
  }) => {
    return (
      <tr>
        <td className="align-middle text-center">
          <Form.Check
            id={`taskset-check-${billboard.uuid}`}
            type="checkbox"
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <span className="d-inline-block text-truncate mw-100 align-middle cursor-pointer font-weight-bold">
            {channels?.find((o) => o.id === billboard.channel)?.name}
          </span>
        </td>
        <td className="align-middle d-none d-md-table-cell">
          <div className="mw-100 align-middle cursor-pointer font-weight-bold">
            {billboard.value}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Head>
        <title>전광판 채널 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            data && channels ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>전광판 채널 설정</h3>
                    <div className="py-2">
                      채널 이름에 여러 정보를 표시할 수 있습니다. 표시되는
                      내용은 1분마다 업데이트됩니다.
                    </div>
                  </div>
                </Row>
                <Row>
                  <Col>
                    <Form noValidate>
                      {addNew && (
                        <Row className="mb-5">
                          <Col className="p-0">
                            <Card bg="dark" className="m-0 shadow">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span
                                  className="font-weight-bold"
                                  style={{
                                    fontFamily: 'NanumSquare',
                                    fontSize: 18,
                                  }}
                                >
                                  새 작업 추가
                                </span>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  onClick={() => {
                                    setAddNew(false);
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </Button>
                              </Card.Header>
                              <Card.Body>
                                <Form>
                                  <Form.Group className="d-flex">
                                    <Row className="align-items-center">
                                      <Form.Label column sm="auto">
                                        작업 유형 선택
                                      </Form.Label>
                                      <Col>
                                        <Form.Control
                                          className="shadow-sm"
                                          style={{ fontSize: 15 }}
                                          as="select"
                                        >
                                          <option value={0}>유형 선택</option>
                                          <option value="emoji_role">
                                            반응했을 때 역할 추가/제거
                                          </option>
                                        </Form.Control>
                                      </Col>
                                    </Row>
                                  </Form.Group>
                                </Form>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      )}

                      <Row className="justify-content-end pt-2">
                        <Button
                          variant="aztra"
                          size="sm"
                          className="d-flex align-items-center mr-3"
                          onClick={() => {
                            setAddNew(true);
                            animateScroll.scrollToTop({
                              duration: 500,
                            });
                          }}
                        >
                          <AddIcon className="mr-1" />
                          새로 추가
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center"
                        >
                          <DeleteIcon className="mr-1" />
                          선택 항목 삭제
                        </Button>
                      </Row>

                      <Row className="flex-column mt-3">
                        <Table
                          id="warn-list-table"
                          variant="dark"
                          style={{
                            tableLayout: 'fixed',
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                className="align-middle text-center"
                                style={{ width: 50 }}
                              >
                                <Form.Check
                                  id="warn-select-all"
                                  type="checkbox"
                                />
                              </th>
                              <th
                                className="text-center text-md-left"
                                style={{ width: '20%' }}
                              >
                                채널
                              </th>
                              <th className="text-center text-md-left d-none d-md-table-cell">
                                내용
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.map((one) => (
                              <BoardListCard key={one.uuid} billboard={one} />
                            ))}
                          </tbody>
                        </Table>
                      </Row>

                      <Row className="mt-4">
                        <Button
                          variant={saveError ? 'danger' : 'aztra'}
                          style={{
                            minWidth: 140,
                          }}
                        >
                          {saving ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                              <span className="pl-2">저장 중...</span>
                            </>
                          ) : (
                            <span>저장하기</span>
                          )}
                        </Button>
                      </Row>
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

export default AutoTasking;
