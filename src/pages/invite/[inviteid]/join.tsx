import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import { PartialInviteGuild } from 'types/DiscordTypes';
import urljoin from 'url-join';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import Cookies from 'universal-cookie';
import { useState } from 'react';

interface InviteProps {
  inviteId: string;
}

export const getServerSideProps: GetServerSideProps<InviteProps> = async (
  context
) => {
  const { inviteid } = context.query;
  return {
    props: {
      inviteId: inviteid as string,
    },
  };
};

const Join: NextPage<InviteProps> = ({ inviteId }) => {
  const [isJoinDone, setIsJoinDone] = useState(false);

  const { data } = useSWR<PartialInviteGuild, AxiosError>(
    urljoin(api, `/invites/${inviteId}`),
    (url) => axios.get(url).then((r) => r.data)
  );

  const { data: joinData } = useSWR<PartialInviteGuild, AxiosError>(
    urljoin(api, `/invites/${inviteId}/join`),
    (url) =>
      axios
        .post(url, undefined, {
          headers: {
            'Invite-Token': new Cookies().get('INVITE_TOKEN'),
          },
        })
        .then((r) => {
          setIsJoinDone([201, 204].includes(r.status));
          return r.data;
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <>
      <Head>
        <title>
          {data?.name} 서버 참가 {isJoinDone ? '완료' : '중'}
        </title>
      </Head>
      <div
        style={{
          height: '100vh',
          backgroundSize: 'cover',
          // backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url("/assets/02931_amaz_1LzaQ5g3Qe.jpg")',
        }}
      >
        {data ? (
          <Container fluid="sm" className="text-white h-100">
            <Row className="justify-content-center align-items-center h-100">
              <Col lg={6}>
                <Card bg="dark" className="shadow">
                  <Card.Body className="text-center">
                    <div className="py-5">
                      <img
                        alt={data.name}
                        className="rounded-circle mb-3"
                        src={`https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png`}
                        style={{ width: 100, height: 100 }}
                      />
                      <div className="mb-1">
                        {isJoinDone ? '서버 참여 완료!' : '서버에 참여하는 중:'}
                      </div>
                      <h2>{data.name}</h2>
                      <div className="d-flex justify-content-center align-items-center">
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: 'gray',
                          }}
                          className="rounded-circle mr-2"
                        />
                        {data.memberCount} 멤버
                      </div>
                    </div>

                    <div>
                      <Button
                        variant={isJoinDone ? 'success' : 'aztra'}
                        size="lg"
                        disabled
                        className="w-100 mb-3 d-flex justify-content-center align-items-center"
                      >
                        <Spinner
                          animation="border"
                          className="mr-2"
                          hidden={isJoinDone}
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <b>{data.name}</b>{' '}
                        {isJoinDone ? '서버 참여 완료' : '서버 참여하는 중...'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                <div className="mt-2 text-right" style={{ color: 'darkgray' }}>
                  <small className="d-inline-flex align-items-center">
                    <LockOutlinedIcon className="mr-1" fontSize="small" />
                    Aztra 보안 초대 시스템
                  </small>
                </div>
              </Col>
            </Row>
          </Container>
        ) : null}
      </div>
    </>
  );
};

export default Join;
