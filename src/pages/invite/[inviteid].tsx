import axios, { AxiosError, AxiosResponse } from 'axios';
import api from 'datas/api';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import useSWR from 'swr';
import { PartialInviteGuild } from 'types/DiscordTypes';
import urljoin from 'url-join';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import oauth from 'datas/oauth';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { useRouter } from 'next/router';

interface InviteProps {
  inviteId: string;
  data: (PartialInviteGuild & { message?: string }) | null;
}

export const getServerSideProps: GetServerSideProps<InviteProps> = async (
  context
) => {
  const { inviteid } = context.query;

  try {
    let r = await axios.get<PartialInviteGuild>(
      urljoin(api, `/invites/${inviteid}`)
    );
    return {
      props: {
        inviteId: inviteid as string,
        data: r.data,
      },
    };
  } catch (_e) {
    let e: AxiosError = _e;
    return {
      props: {
        inviteId: inviteid as string,
        data: e.response?.data ?? null,
      },
    };
  }
};

const Invite: NextPage<InviteProps> = ({ inviteId, data }) => {
  const [isJoinDone, setIsJoinDone] = useState(false);
  const [isJoinMode, setIsJoinMode] = useState(false);
  const [isMissingPerm, setIsMissingPerm] = useState(false);
  const [isInviteNotExists, setIsInviteNotExists] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isGuildNotExists, setIsGuildNotExists] = useState(false);

  const router = useRouter();

  useSWR<PartialInviteGuild, AxiosError>(
    isJoinMode ? urljoin(api, `/invites/${inviteId}/join`) : null,
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
        })
        .catch((_e) => {
          let e: AxiosError = _e;
          setIsMissingPerm(e.response?.status === 403);
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data?.message === 'INVITE_EXPIRED') {
      setIsExpired(true);
    } else if (data?.message === 'GUILD_NOT_FOUND') {
      setIsGuildNotExists(true);
    } else if (data?.message === 'INVITE_NOT_FOUND') {
      setIsInviteNotExists(true);
    }

    setIsJoinMode(location.hash === '#join');
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    );
  }, [data?.message]);

  return (
    <>
      <Head>
        <title>
          {isJoinMode
            ? `${data?.name ?? ''} 서버 참가 ${isJoinDone ? '완료' : '중'}`
            : `${data?.name ?? ''} 서버 참가하기`}
        </title>
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:url"
          content={`https://aztra.xyz/invite/${inviteId}`}
        />
        <meta property="twitter:domain" content="aztra.xyz"></meta>
        <meta name="twitter:title" content={`${data?.name} 서버 참가히기`} />
        <meta
          name="twitter:description"
          content={`${data?.memberCount} 멤버`}
        />
        <meta
          name="twitter:image"
          content={`https://cdn.discordapp.com/icons/${data?.id}/${data?.icon}.png`}
        />

        <meta property="og:title" content={`${data?.name} 서버 참가히기`} />
        <meta property="og:site_name" content="Aztra 보안 초대 시스템" />
        <meta
          property="og:url"
          content={`https://aztra.xyz/invite/${inviteId}`}
        />
        <meta property="og:description" content={`${data?.memberCount} 멤버`} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content={`https://cdn.discordapp.com/icons/${data?.id}/${data?.icon}.png`}
        />
      </Head>
      <div
        style={{
          height: '100vh',
          backgroundSize: 'cover',
          // backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url("/assets/02931_amaz_1LzaQ5g3Qe.jpg")',
        }}
      >
        {data !== undefined ? (
          <Container fluid="sm" className="text-white h-100">
            <Row className="justify-content-center align-items-center h-100">
              <Col lg={6}>
                <Card bg="dark" className="shadow">
                  <Card.Body className="text-center">
                    <div className="py-5">
                      {!isGuildNotExists && !isExpired && !isInviteNotExists ? (
                        <>
                          {data?.icon && (
                            <img
                              alt={data?.name}
                              className="rounded-circle mb-3"
                              src={`https://cdn.discordapp.com/icons/${data?.id}/${data?.icon}.png`}
                              style={{ width: 100, height: 100 }}
                            />
                          )}
                          <div className="mb-1">
                            {isJoinMode
                              ? isJoinDone
                                ? '서버 참여 완료!'
                                : '서버에 참여하는 중:'
                              : '서버에 초대됨:'}
                          </div>
                          <h2>{data?.name}</h2>
                          <div className="d-flex justify-content-center align-items-center">
                            {/*
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: 'MediumSeaGreen',
                                }}
                                className="rounded-circle mx-2"
                              />
                              {data?.presenceCount} 온라인
                            */}
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: 'gray',
                              }}
                              className="rounded-circle mr-2"
                            />
                            {data?.memberCount} 멤버
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="pb-3">
                            {isGuildNotExists
                              ? '존재하지 않는 서버입니다.'
                              : isInviteNotExists
                              ? '올바르지 않은 초대 코드'
                              : '초대가 만료되었습니다.'}
                          </h4>
                          <div className="pb-3">
                            {isGuildNotExists
                              ? '서버에서 봇이 추방되었거나 서버가 삭제되었을 수 있습니다.'
                              : isInviteNotExists
                              ? '존재하지 않는 초대 코드입니다. 정확하게 입력했는지 확인해주세요!'
                              : '사용 횟수 또는 기간이 초과되어 만료된 초대입니다.'}
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <Button
                        variant={
                          isMissingPerm
                            ? 'danger'
                            : isJoinDone
                            ? 'success'
                            : 'aztra'
                        }
                        size="lg"
                        disabled={
                          isGuildNotExists ||
                          isExpired ||
                          isInviteNotExists ||
                          (isJoinMode && !isMissingPerm)
                        }
                        className="w-100 mb-3"
                        onClick={() => {
                          setIsMissingPerm(false);
                          setIsJoinMode(false);
                          localStorage.setItem('fromInviteId', inviteId);
                          window.location.assign(oauth.guild_join_oauth2);
                        }}
                      >
                        {!isGuildNotExists ? (
                          isMissingPerm ? (
                            '다시 시도하기'
                          ) : isJoinMode ? (
                            <>
                              <b>{data?.name}</b>{' '}
                              {isJoinDone
                                ? '서버 참여 완료'
                                : '서버 참여하는 중...'}
                            </>
                          ) : (
                            '서버 참가하기'
                          )
                        ) : (
                          '서버에 참여할 수 없습니다!'
                        )}
                      </Button>
                      {!isGuildNotExists &&
                        !isExpired &&
                        !isInviteNotExists &&
                        !isJoinMode && (
                          <a
                            className="text-light cursor-pointer"
                            onClick={() => {
                              window.opener = window.self;
                              window.close();
                            }}
                          >
                            사양할게요
                          </a>
                        )}
                      {isMissingPerm && (
                        <div>
                          <div className="pb-1">
                            오류! 봇에 권한이 없습니다.{' '}
                          </div>
                          <small>
                            서버에 <b>초대 코드 만들기</b> 권한이 필요합니다.
                            서버 관리자에게 문의하세요.
                          </small>
                        </div>
                      )}
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

export default Invite;
