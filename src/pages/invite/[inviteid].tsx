import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import {
  Button,
  Card,
  Col,
  Container,
  FormControl,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import useSWR from 'swr';
import { PartialInviteGuild, User } from 'types/DiscordTypes';
import urljoin from 'url-join';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Check as CheckIcon,
} from '@material-ui/icons';
import oauth from 'datas/oauth';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import oauth2 from 'datas/oauth';

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
    let e = _e as AxiosError;
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
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [emailVerificationStep, setEmailVerificationStep] = useState(0);
  const [codeNums, setCodeNums] = useState(Array(6).fill(''));
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const parseJwt = (token: string) => {
    if (!token) {
      return;
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  const { data: user } = useSWR<User, AxiosError>(
    urljoin(oauth2.api_endpoint, '/users/@me'),
    (url) =>
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${
              parseJwt(new Cookies().get('INVITE_TOKEN') ?? '').authData
                .access_token
            }`,
          },
        })
        .then((r) => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { mutate } = useSWR<PartialInviteGuild, AxiosError>(
    isJoinMode && !data?.isRequiredEmailVerification
      ? urljoin(api, `/invites/${inviteId}/join`)
      : null,
    (url) =>
      axios
        .post(url, undefined, {
          headers: {
            'Invite-Token': new Cookies().get('INVITE_TOKEN'),
          },
        })
        .then((r) => r.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        setIsJoinMode(true);
        setIsJoinDone(true);
      },
      onError: (_e) => {
        let e: AxiosError = _e;
        setIsMissingPerm(e.response?.status === 403);
      },
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

    console.log(location.hash === '#join');
    if (!isJoinMode && location.hash === '#join') {
      setIsJoinMode(true);
    }
    if (data?.isRequiredEmailVerification && isJoinMode && !isJoinDone) {
      setIsJoinMode(false);
      setEmailVerificationStep(0);
      setIsInvalidCode(false);
      setEmailVerificationOpen(true);
    }

    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    );
  }, [
    data?.isRequiredEmailVerification,
    data?.message,
    isJoinDone,
    isJoinMode,
  ]);

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
                              className="rounded-circle me-2"
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
                          window.location.assign(
                            data?.isRequiredEmailVerification
                              ? oauth.guild_join_oauth2_with_email
                              : oauth.guild_join_oauth2
                          );
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
                            className="cursor-pointer"
                            onClick={() => {
                              window.opener = window.self;
                              window.close();
                            }}
                            style={{ color: 'lightgray' }}
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
                    <LockOutlinedIcon className="me-1" fontSize="small" />
                    Aztra 보안 초대 시스템
                  </small>
                </div>
              </Col>
            </Row>

            <Modal className="modal-dark" show={emailVerificationOpen} centered>
              <Modal.Header>
                <Modal.Title className="d-flex align-items-center">
                  <EmailIcon className="me-2" />
                  <b>이메일 인증하기</b>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-center mt-3">
                {emailVerificationStep === 0 && (
                  <div className="pb-3">
                    <b style={{ fontSize: 20 }}>
                      이 서버에 참여하려면 이메일 인증이 필요합니다!
                    </b>
                    <div className="mt-3 mb-4">
                      이메일 인증을 완료하시면 서버에 참여할 수 있습니다.
                    </div>
                    <hr />
                    <div className="mt-4" style={{ wordBreak: 'keep-all' }}>
                      계속하면 <b>{user?.email}</b> 메일로{' '}
                      <b>6자리 인증 코드</b>가 전송됩니다. 이 코드를
                      입력해주세요.
                    </div>
                  </div>
                )}
                {emailVerificationStep === 1 && (
                  <div className="pb-3 d-flex justify-content-center align-items-center">
                    <Spinner
                      animation="border"
                      variant="aztra"
                      className="me-3"
                    />
                    <b style={{ fontSize: 20 }}>인증 메일을 전송하는 중...</b>
                  </div>
                )}

                {emailVerificationStep === 2 && (
                  <div className="pb-3">
                    <div
                      className="mb-2"
                      style={{ fontSize: 20, wordBreak: 'keep-all' }}
                    >
                      <b>{user?.email}</b> 메일로 전송된 <br />
                      인증 코드를 입력해주세요.
                    </div>

                    {isInvalidCode && (
                      <div className="mt-2 text-danger">
                        인증 코드가 올바르지 않거나 만료되었습니다.
                      </div>
                    )}

                    {/*
                      <a
                      style={{
                        color: 'deepskyblue',
                        textDecoration: 'underline',
                      }}
                    >
                      다시 보내기
                    </a>
                       */}

                    <div className="d-flex gap-3 justify-content-center">
                      {Array.from(Array(6).keys()).map((i) => (
                        <FormControl
                          autoComplete="off"
                          onKeyDown={(e) => {
                            if (i === 0) return;
                            if (codeNums[i].length > 0) return;

                            if (e.key === 'Backspace') {
                              const newNums = [...codeNums];
                              newNums[i - 1] = '';
                              setCodeNums(newNums);

                              document.getElementById(`code-${i - 1}`)?.focus();
                            }
                          }}
                          id={`code-${i}`}
                          key={i}
                          value={codeNums[i]}
                          onChange={(e) => {
                            if (e.target.value.length > 1) return;
                            if (isNaN(Number(e.target.value))) return;

                            const newNums = [...codeNums];
                            newNums[i] = e.target.value;
                            setCodeNums(newNums);

                            if (e.target.value.length !== 0) {
                              document.getElementById(`code-${i + 1}`)?.focus();
                            }
                          }}
                          className="shadow mt-4 text-center"
                          type="text"
                          style={{
                            fontSize: 26,
                            width: '3.5rem',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="d-flex justify-content-center gap-3">
                <Button
                  className="px-4"
                  variant="aztra"
                  hidden={emailVerificationStep !== 0}
                  onClick={() => {
                    setIsVerifying(false);
                    setCodeNums(Array(6).fill(''));
                    setEmailVerificationStep(1);

                    axios
                      .post(
                        urljoin(
                          api,
                          `/invites/${inviteId}/email-verification/send`
                        ),
                        undefined,
                        {
                          headers: {
                            'Invite-Token': new Cookies().get('INVITE_TOKEN'),
                          },
                        }
                      )
                      .then(() => setEmailVerificationStep(2));
                  }}
                >
                  메일 전송하기
                </Button>
                <Button
                  className="px-4"
                  variant="aztra"
                  hidden={emailVerificationStep !== 2}
                  disabled={isVerifying || codeNums.some((num) => !num.length)}
                  onClick={() => {
                    if (isVerifying) return;

                    setIsVerifying(true);

                    setIsInvalidCode(false);
                    axios
                      .post(
                        urljoin(
                          api,
                          `/invites/${inviteId}/email-verification/verify`
                        ),
                        {
                          code: codeNums.join(''),
                        },
                        {
                          headers: {
                            'Invite-Token': new Cookies().get('INVITE_TOKEN'),
                          },
                        }
                      )
                      .then(() => {
                        setEmailVerificationOpen(false);
                        mutate().then(() => {
                          setIsJoinDone(true);
                          setIsJoinMode(true);
                        });
                      })
                      .catch((_e) => {
                        let e: AxiosError = _e;
                        if (e.response?.status === 403) {
                          setIsInvalidCode(true);
                        }
                      })
                      .finally(() => {
                        setIsVerifying(false);
                      });
                  }}
                >
                  <CheckIcon className="me-2" />
                  완료
                </Button>
                <Button
                  className="px-2"
                  variant="dark"
                  onClick={() => setEmailVerificationOpen(false)}
                >
                  취소하고 닫기
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        ) : null}
      </div>
    </>
  );
};

export default Invite;
