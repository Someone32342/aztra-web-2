import React, { useEffect, useRef, useState } from 'react';
import {
  Row,
  Spinner,
  Container,
  Form,
  Col,
  Badge,
  Button,
  Modal,
  Overlay,
  Tooltip,
  Card,
  Dropdown,
} from 'react-bootstrap';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  FileCopyOutlined as FileCopyOutlinedIcon,
} from '@material-ui/icons';
import useSWR from 'swr';
import { SecureInvite } from 'types/dbtypes';
import urljoin from 'url-join';
import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import Link from 'next/link';

interface SecurityRouterProps {
  guildId: string;
}

export const getServerSideProps: GetServerSideProps<SecurityRouterProps> =
  async (context) => {
    const { guildid } = context.query;
    return {
      props: {
        guildId: guildid as string,
      },
    };
  };

const Security: NextPage<SecurityRouterProps> = ({ guildId }) => {
  const [newInvite, setNewInvite] = useState(false);
  const [newValidity, setNewValidity] = useState(0);
  const [newMaxUses, setNewMaxUses] = useState(0);
  const [useBlockForeign, setUseBlockForeign] = useState(false);
  const [excludedForeigns, setExcludedForeigns] = useState(new Set(['KR']));
  const [searchCountry, setSearchCountry] = useState('');
  const [copied, setCopied] = useState(false);
  const [, setTime] = useState(0);
  const [showHowItProtects, setShowHowItProtects] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const { data, mutate } = useSWR<SecureInvite[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/security/invites`)
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

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location;
      localStorage.setItem('loginFrom', lct.pathname + lct.search);
      window.location.assign('/login');
    } else {
      const interval = setInterval(() => setTime(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <>
      <Head>
        <title>보안 설정 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() =>
            true ? (
              <div>
                <Row className="dashboard-section">
                  <div>
                    <h3>보안 설정</h3>
                    <div className="py-2">
                      여러분의 서버를 악의적인 공격으로부터 보호할 기능들을
                      제공합니다.
                    </div>
                  </div>
                </Row>

                <Row className="pb-2 align-items-center">
                  <div>
                    <h4>멤버 초대 보안</h4>
                    <small>
                      추가 인증이 적용된 초대 링크를 발급하여 악성 멤버(매크로를
                      통한 자동 참여, 셀프봇 등)가 참여하는 것을 막습니다.
                      <br />
                      <strong>
                        <span className="text-warning">
                          초대 링크 생성하기 권한이 필요합니다!
                        </span>{' '}
                        또한 기존 디스코드 초대 링크에는 이 기능이 적용되지
                        않으니 반드시 아래의 자체 초대 링크를 사용하세요!
                      </strong>
                    </small>
                    <div>
                      <a
                        className="small cursor-pointer"
                        style={{ color: 'deepskyblue' }}
                        onClick={() => setShowHowItProtects(true)}
                      >
                        어떻게 악성 멤버의 참여를 막나요?
                      </a>
                    </div>
                  </div>
                </Row>

                <Modal
                  className="modal-dark"
                  show={showHowItProtects}
                  centered
                  size="lg"
                  onHide={() => setShowHowItProtects(false)}
                >
                  <Modal.Header>
                    <Modal.Title
                      style={{
                        fontFamily: 'NanumSquare',
                        fontWeight: 900,
                      }}
                    >
                      보안 초대 원리
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="p-4">
                    <p>
                      멤버가 서버에 참여할 때 reCAPTCHA v3 인증을 거쳐 웹
                      사이트에서의 상호작용을 기반으로 자동으로 봇 유저 여부를
                      판단합니다.
                    </p>
                    <p>
                      정상적인 사용자일 경우 다른 복잡한 절차 필요없이 버튼 클릭
                      한두 번이면 참여가 완료됩니다.
                    </p>
                  </Modal.Body>
                </Modal>

                <Row className="py-3">
                  <Col>
                    <Button variant="aztra" onClick={() => setNewInvite(true)}>
                      <AddIcon className="mr-2" />
                      보안 초대 링크 추가
                    </Button>
                  </Col>
                </Row>

                {data?.map((one) => {
                  let date = new Date(one.created_at);
                  date.setSeconds(date.getSeconds() + one.max_age);

                  let delta = date.getTime() - Date.now();

                  var days = Math.floor(delta / 1000 / (3600 * 24));
                  var hours = Math.floor(((delta / 1000) % (3600 * 24)) / 3600);
                  var minutes = Math.floor(((delta / 1000) % 3600) / 60);
                  var seconds = Math.floor((delta / 1000) % 60);

                  if (one.max_age !== 0 && delta <= 0) return null;

                  return (
                    <Row key={one.id} className="pb-3">
                      <Col xs={12} md={8} xl={6} className="pr-0 w-100">
                        <Card
                          bg="dark"
                          className="shadow w-100"
                          style={{ height: 38 }}
                        >
                          <div className="mx-2 my-auto text-truncate">{`${location.origin}/invite/${one.id}`}</div>
                        </Card>
                      </Col>
                      <Col xs="auto" className="pl-md-2">
                        <div className="d-flex">
                          <Button
                            ref={copyButtonRef}
                            size="sm"
                            variant="aztra"
                            className="mr-2 d-flex align-items-center"
                            onClick={() => {
                              navigator.clipboard
                                .writeText(
                                  `${location.origin}/invite/${one.id}`
                                )
                                .then(() => {
                                  if (!copied) {
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 800);
                                  }
                                });
                            }}
                          >
                            <FileCopyOutlinedIcon className="mr-2" />
                            복사하기
                          </Button>

                          <Overlay target={copyButtonRef.current} show={copied}>
                            {(props) => (
                              <Tooltip id="wan-copied-tooltop" {...props}>
                                복사됨!
                              </Tooltip>
                            )}
                          </Overlay>

                          <Button
                            variant="dark"
                            className="bg-transparent border-0 px-2"
                            onClick={() => {
                              axios
                                .delete(
                                  `${api}/servers/${guildId}/security/invites/${one.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${new Cookies().get(
                                        'ACCESS_TOKEN'
                                      )}`,
                                    },
                                  }
                                )
                                .then(() => mutate());
                            }}
                          >
                            <RemoveCircleOutlineIcon />
                          </Button>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <small>
                          {one.max_uses !== 0 && `${one.max_uses}회 중 `}
                          {one.uses}회 사용됨
                          {one.max_age !== 0 &&
                            `, 
                            ${days !== 0 ? `${days}일` : ''}
                            ${hours !== 0 ? `${hours}시간` : ''} 
                            ${minutes !== 0 ? `${minutes}분` : ''} 
                            ${seconds}초 남음`}
                        </small>
                      </Col>
                    </Row>
                  );
                })}

                <Modal
                  className="modal-dark"
                  show={newInvite}
                  centered
                  size="lg"
                  onLoad={() => {
                    setNewValidity(0);
                    setNewMaxUses(0);
                    setUseBlockForeign(false);
                    setExcludedForeigns(new Set(['KR']));
                  }}
                  onHide={() => setNewInvite(false)}
                >
                  <Modal.Header>
                    <Modal.Title
                      style={{
                        fontFamily: 'NanumSquare',
                        fontWeight: 900,
                      }}
                    >
                      보안 초대 링크 생성하기
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="p-4">
                    <Row className="pb-3">
                      <Form.Label column xs={12} md="auto" className="pr-0">
                        커스텀 초대 링크:
                      </Form.Label>
                      <Col className="pr-0">
                        <Form.Control
                          className="mb-1 shadow"
                          type="text"
                          placeholder="https://aztra.xyz/invite/CustomInviteCode"
                          readOnly
                        />
                        <small>
                          <Badge variant="aztra" className="ml-1">
                            PRO
                          </Badge>{' '}
                          <Link href="/premium" shallow>
                            <a style={{ color: 'deepskyblue' }}>
                              Aztra Pro로 업그레이드
                            </a>
                          </Link>
                          하면 커스텀 링크를 사용할 수 있습니다! (출시 예정)
                        </small>
                      </Col>
                      <Col xs="auto" className="pl-2">
                        <Button
                          variant="aztra"
                          disabled
                          className="d-flex align-items-center py-auto"
                        >
                          <FileCopyOutlinedIcon className="mr-2" />
                          복사하기
                        </Button>
                      </Col>
                    </Row>

                    <Row className="pt-2 pb-3">
                      <Form.Label column xs="auto">
                        잔여 유효 기간:
                      </Form.Label>
                      <Col xs={6}>
                        <Form.Control
                          id="max-age"
                          as="select"
                          className="shadow"
                          onChange={(e) =>
                            setNewValidity(Number(e.target.value))
                          }
                        >
                          <option value={0}>만료 기간 없음</option>
                          <option value={30 * 60}>30분</option>
                          <option value={60 * 60}>1시간</option>
                          <option value={6 * 60 * 60}>6시간</option>
                          <option value={12 * 60 * 60}>12시간</option>
                          <option value={24 * 60 * 60}>1일</option>
                          <option value={7 * 24 * 60 * 60}>7일</option>
                        </Form.Control>
                      </Col>
                    </Row>

                    <Row className="pb-3">
                      <Form.Label column xs="auto">
                        최대 사용 횟수:
                      </Form.Label>
                      <Col xs={6}>
                        <Form.Control
                          id="max-uses"
                          as="select"
                          className="shadow"
                          onChange={(e) =>
                            setNewMaxUses(Number(e.target.value))
                          }
                        >
                          <option value={0}>제한 없음</option>
                          {[1, 5, 10, 25, 50, 100].map((i) => (
                            <option key={i} value={i}>
                              {i}회
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>

                    <Row className="pt-2 pb-3">
                      <Col xs={12}>
                        <Form.Check
                          id="by-discord-oauth"
                          custom
                          checked
                          onChange={() => {}}
                          type="checkbox"
                          label="디스코드 추가 인증 사용 (기본)"
                        />
                      </Col>
                    </Row>

                    <Row className="pb-3">
                      <Col xs={12}>
                        <Form.Check
                          id="block-foreign-ip"
                          custom
                          disabled
                          checked={useBlockForeign}
                          onChange={() => setUseBlockForeign(!useBlockForeign)}
                          type="checkbox"
                          label="해외 IP 차단하기 (개발중)"
                        />

                        {useBlockForeign && (
                          <div className="pl-3 pt-2">
                            {/*
                            <Form.Control as="select">
                              <option value={0}>예외 국가 선택...</option>
                              <Countries />
                            </Form.Control>
                          */}

                            <Dropdown
                              className="dropdown-menu-dark"
                              onSelect={(e) => {
                                excludedForeigns.add(e!);
                                setExcludedForeigns(new Set(excludedForeigns));
                              }}
                              onToggle={(isOpen) => {
                                isOpen && setSearchCountry('');
                              }}
                            >
                              <Dropdown.Toggle
                                id="select-country"
                                variant="outline-light"
                                size="sm"
                                className="my-1 remove-after d-flex align-items-cente shadow-none"
                              >
                                예외 국가 추가
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                className="bg-dark"
                                style={{
                                  maxHeight: 300,
                                  minWidth: 240,
                                  overflowY: 'scroll',
                                }}
                              >
                                <Form.Control
                                  id="add-role-member-search"
                                  className="mb-2"
                                  type="text"
                                  placeholder="국가 검색..."
                                  autoComplete="off"
                                  value={searchCountry}
                                  onChange={(e) =>
                                    setSearchCountry(e.target.value)
                                  }
                                />
                                {COUNTRIES.filter(
                                  (one) =>
                                    one[0].startsWith(
                                      searchCountry.normalize().toUpperCase()
                                    ) || one[1].includes(searchCountry)
                                ).map((one) => (
                                  <Dropdown.Item
                                    className="my-1"
                                    key={one[0]}
                                    eventKey={one[0]}
                                    active={false}
                                  >
                                    {one[1]}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>

                            {!!excludedForeigns.size && (
                              <div className="pt-2">
                                {[...excludedForeigns].map((one) => (
                                  <Badge
                                    key={one}
                                    className="d-inline-flex align-items-center mr-2 mb-2"
                                    variant="secondary"
                                    style={{ fontSize: 15 }}
                                  >
                                    {COUNTRIES.find((c) => c[0] === one)![1]}{' '}
                                    <ClearIcon
                                      className="ml-1 cursor-pointer"
                                      onClick={() => {
                                        excludedForeigns.delete(one);
                                        setExcludedForeigns(
                                          new Set(excludedForeigns)
                                        );
                                      }}
                                      style={{ fontSize: 16 }}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Col>
                    </Row>

                    <Row className="pb-3">
                      <Col xs={12}>
                        <Form.Check
                          id="block-vpn"
                          disabled
                          custom
                          type="checkbox"
                          label="VPN 차단하기 (개발중)"
                        />
                      </Col>
                    </Row>

                    <Row className="pb-3">
                      <Col xs={12}>
                        <Form.Check
                          id="by-naver-oauth"
                          disabled
                          custom
                          type="checkbox"
                          label={
                            <>
                              네이버 아이디로 인증 (개발중)
                              <Badge variant="aztra" className="ml-2">
                                PRO
                              </Badge>
                            </>
                          }
                        />
                      </Col>
                    </Row>
                  </Modal.Body>
                  <Modal.Footer className="justify-content-end">
                    <Button
                      variant="aztra"
                      onClick={() => {
                        let data: Pick<SecureInvite, 'max_age' | 'max_uses'> = {
                          max_age: newValidity,
                          max_uses: newMaxUses,
                        };

                        axios
                          .post(
                            `${api}/servers/${guildId}/security/invites`,
                            data,
                            {
                              headers: {
                                Authorization: `Bearer ${new Cookies().get(
                                  'ACCESS_TOKEN'
                                )}`,
                              },
                            }
                          )
                          .then(() => {
                            mutate();
                            setNewInvite(false);
                          });
                      }}
                    >
                      <CheckIcon className="mr-2" />
                      생성하기
                    </Button>
                    <Button variant="dark" onClick={() => setNewInvite(false)}>
                      취소
                    </Button>
                  </Modal.Footer>
                </Modal>

                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Row>
                      <hr
                        className="my-1 w-100"
                        style={{ borderColor: '#4e5058', borderWidth: 2 }}
                      />
                    </Row>

                    <Row className="py-3 align-items-center">
                      <div>
                        <h4>메시지 도배 방지</h4>
                        <small>악성 유저의 메시지 도배를 막습니다.</small>
                      </div>
                    </Row>

                    <Form.Group>
                      <Row className="pb-3">
                        <Col xs="auto" className="my-auto">
                          <Form.Check
                            id="limit-message-check"
                            custom
                            type="checkbox"
                            label="일정 시간동안 메시지 개수 제한하기:"
                          />
                        </Col>
                        <Col className="pl-0">
                          <div className="d-flex align-items-center">
                            <Form.Control
                              id="spamming-limit-max-per-seconds"
                              className="mr-2"
                              defaultValue="60"
                              style={{ width: 60 }}
                            />
                            <span>초 동안 최대</span>
                            <Form.Control
                              id="spamming-limit-max-count"
                              className="mx-2"
                              defaultValue="20"
                              style={{ width: 60 }}
                            />
                            <span>개</span>
                          </div>
                        </Col>
                      </Row>
                    </Form.Group>

                    <Row>
                      <hr
                        className="my-1 w-100"
                        style={{ borderColor: '#4e5058', borderWidth: 2 }}
                      />
                    </Row>

                    <Row className="py-3 align-items-center">
                      <div>
                        <h4>멘션 제한</h4>
                        <small>
                          악성 유저의 무분별한 멘션 도배를 막습니다.
                        </small>
                      </div>
                    </Row>

                    <Form.Group>
                      <Row className="pb-3">
                        <Col xs="auto" className="my-auto">
                          <Form.Check
                            id="max-by-one-message-check"
                            custom
                            type="checkbox"
                            label="한 메시지당 멘션 최대:"
                          />
                        </Col>
                        <Col className="pl-0">
                          <div className="d-flex align-items-center">
                            <Form.Control
                              id="mention-limit-max-count"
                              className="mr-2"
                              defaultValue="10"
                              style={{ width: 60 }}
                            />
                            <span>개</span>
                          </div>
                        </Col>
                      </Row>
                      <Row className="pb-3">
                        <Col xs="auto" className="my-auto">
                          <Form.Check
                            id="max-by-all-timein-message-check"
                            custom
                            type="checkbox"
                            label="일정 시간동안 모든 메시지의 멘션 최대:"
                          />
                        </Col>
                        <Col className="pl-0">
                          <div className="d-flex align-items-center">
                            <Form.Control
                              id="mention-limit-seconds"
                              className="mr-2"
                              defaultValue="60"
                              style={{ width: 60 }}
                            />
                            <span>초 동안 최대</span>
                            <Form.Control
                              id="mention-limit-counts-per-seconds"
                              className="mx-2"
                              defaultValue="20"
                              style={{ width: 60 }}
                            />
                            <span>개</span>
                          </div>
                        </Col>
                      </Row>
                      <Row className="pt-2">
                        <Col>
                          <Form.Label className="font-weight-bold h5">
                            위반 시:
                          </Form.Label>
                        </Col>
                      </Row>
                      <Row className="pl-4">
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-add-role"
                            custom
                            type="checkbox"
                            label="역할 추가하기"
                          />
                        </Col>
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-remove-role"
                            custom
                            type="checkbox"
                            label="역할 제거하기"
                          />
                        </Col>
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-kick"
                            custom
                            type="checkbox"
                            label="해당 멤버 추방하기"
                          />
                        </Col>
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-ban"
                            custom
                            type="checkbox"
                            label="해당 멤버 차단하기"
                          />
                        </Col>
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-add-warn"
                            custom
                            type="checkbox"
                            label="경고 부여하기"
                          />
                        </Col>
                        <Col xs={12} className="pt-3">
                          <Form.Check
                            id="on-violate-mute"
                            custom
                            type="checkbox"
                            label="멤버 뮤트하기"
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </>
                )}
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

const COUNTRIES = [
  ['GH', '가나'],
  ['GA', '가봉'],
  ['GY', '가이아나'],
  ['GM', '감비아'],
  ['GG', '건지섬'],
  ['GP', '과달루페'],
  ['GT', '과테말라'],
  ['GU', '괌'],
  ['VA', '교황청'],
  ['GD', '그레나다'],
  ['GE', '그루지야'],
  ['GR', '그리스'],
  ['GL', '그린랜드'],
  ['GW', '기네비소'],
  ['GN', '기니'],
  ['ZY', '기타주소'],
  ['NA', '나미비아'],
  ['NR', '나우루 공화국'],
  ['NG', '나이지리아'],
  ['SS', '남수단'],
  ['ZA', '남아프리카공화국'],
  ['NL', '네덜란드'],
  ['NP', '네팔'],
  ['NO', '노르웨이'],
  ['NF', '노퍽제도'],
  ['NC', '뉴 켈레도니아'],
  ['NZ', '뉴질랜드'],
  ['NU', '니우에'],
  ['NE', '니제르'],
  ['NI', '니카라과'],
  ['TW', '대만'],
  ['KR', '대한민국'],
  ['DK', '덴마크'],
  ['DM', '도미니카'],
  ['DO', '도미니카 공화국'],
  ['DE', '독일'],
  ['LA', '라오스'],
  ['LR', '라이베리아'],
  ['LV', '라트비아'],
  ['RU', '러시아'],
  ['LB', '레바논'],
  ['LS', '레소토'],
  ['RO', '루마니아'],
  ['LU', '룩셈부르크 대공화국'],
  ['RW', '르완다'],
  ['LY', '리비아 인민사회주의공화국'],
  ['LT', '리투아니아'],
  ['LI', '리히텐슈타인'],
  ['MG', '마다가스카르'],
  ['MQ', '마르티니크'],
  ['MH', '마쉘 아일랜드'],
  ['YT', '마요트'],
  ['FM', '마이크로네시아'],
  ['MO', '마카오'],
  ['MK', '마케도니아'],
  ['MW', '말라위'],
  ['MY', '말레이지아'],
  ['ML', '말리'],
  ['IM', '맨섬'],
  ['MX', '멕시코'],
  ['MC', '모나코'],
  ['MA', '모로코'],
  ['MU', '모리셔스'],
  ['MR', '모리타니'],
  ['MZ', '모잠비크'],
  ['ME', '몬테네그로'],
  ['MS', '몬트세라트'],
  ['MD', '몰도바'],
  ['MV', '몰디브'],
  ['MT', '몰타'],
  ['MN', '몽골'],
  ['US', '미국'],
  ['VI', '미국령 버진제도'],
  ['AS', '미국령 사모아'],
  ['UM', '미국령 소군도'],
  ['MM', '미얀마 연방'],
  ['ZZ', '미할당'],
  ['VU', '바누아투'],
  ['BH', '바레인'],
  ['BB', '바베이도스'],
  ['BS', '바하마'],
  ['BD', '방글라데시'],
  ['BM', '버뮤다'],
  ['VE', '베네수엘라'],
  ['BJ', '베넹'],
  ['VN', '베트남'],
  ['BE', '벨기에'],
  ['BY', '벨라루스'],
  ['BZ', '벨리즈'],
  ['BQ', '보네르섬'],
  ['BA', '보스니아-헤르체고비나'],
  ['BW', '보츠와나'],
  ['BO', '볼리비아'],
  ['BF', '부루키나파소'],
  ['BI', '부룬디'],
  ['BT', '부탄'],
  ['MP', '북 마리아나 제도'],
  ['BG', '불가리아'],
  ['BR', '브라질'],
  ['BN', '브루나이'],
  ['WS', '사모아'],
  ['SA', '사우디 아라비아'],
  ['SM', '산 마리노'],
  ['ST', '상토메 프린시페'],
  ['BL', '생바르텔레미'],
  ['EH', '서 사하라'],
  ['SN', '세네겔'],
  ['RS', '세르비아'],
  ['CS', '세르비아 몬테네그로'],
  ['SC', '세이셀'],
  ['PM', '세이트 피에레 앤 미켈론'],
  ['KN', '세인트 키트 앤 네비스'],
  ['SH', '세인트 헬레나'],
  ['MF', '세인트마틴'],
  ['LC', '센인트 루시아'],
  ['VC', '센인트 빈센트와 그레나다'],
  ['SO', '소말리아'],
  ['SB', '솔로몬 제도'],
  ['SD', '수단'],
  ['SR', '수리남'],
  ['LK', '스리랑카'],
  ['SZ', '스와질랜드'],
  ['SE', '스웨덴'],
  ['CH', '스위스'],
  ['ES', '스페인'],
  ['SK', '슬로바키아'],
  ['SI', '슬로베니아'],
  ['SY', '시리아'],
  ['SL', '시에라 리온'],
  ['SX', '신트마르턴'],
  ['SG', '싱가폴'],
  ['AE', '아랍에미리트 연합국'],
  ['AW', '아루바'],
  ['AM', '아르메니아'],
  ['AR', '아르헨티나'],
  ['AP', '아시아태평양 주소관리기구'],
  ['IS', '아이슬랜드'],
  ['HT', '아이티'],
  ['IE', '아일랜드'],
  ['AZ', '아제르바이잔'],
  ['AF', '아프가니스탄'],
  ['AD', '안도라'],
  ['AL', '알바니아'],
  ['DZ', '알제리'],
  ['AO', '앙골라'],
  ['AI', '앙귈라'],
  ['AN', '앤틸리스 열도'],
  ['ER', '에리트레아'],
  ['EE', '에스토니아'],
  ['EC', '에콰도로'],
  ['ET', '에티오피아'],
  ['AG', '엔티가 바부다'],
  ['SV', '엘 살바도르'],
  ['IO', '영구령 인도양'],
  ['UK', '영국'],
  ['GB', '영국'],
  ['VG', '영국령 버진제도'],
  ['YE', '예멘'],
  ['OM', '오만'],
  ['AU', '오스트레일리아'],
  ['AT', '오스트리아'],
  ['HN', '온두라스'],
  ['AX', '욀란드'],
  ['JO', '요르단'],
  ['UG', '우간다'],
  ['UY', '우루과이'],
  ['UZ', '우즈베키스탄'],
  ['UA', '우크라이나'],
  ['WF', '웰 앤 퓨투나 제도'],
  ['YU', '유고슬라비아'],
  ['EU', '유럽연합'],
  ['IQ', '이라크'],
  ['IR', '이란'],
  ['IL', '이스라엘'],
  ['EG', '이집트'],
  ['IT', '이탈리아'],
  ['IN', '인도'],
  ['ID', '인도네시아'],
  ['JP', '일본'],
  ['JM', '자메이카'],
  ['ZM', '잠비아'],
  ['JE', '저지섬'],
  ['GQ', '적도 기네'],
  ['KP', '조선민주주의인민공화국'],
  ['CN', '중국'],
  ['CF', '중앙 아프리카 공화국'],
  ['DJ', '지부티'],
  ['GI', '지브롤터'],
  ['ZW', '짐바브웨'],
  ['TD', '차드'],
  ['CZ', '체코 공화국'],
  ['CL', '칠레'],
  ['CM', '카메룬'],
  ['CV', '카보 베르데'],
  ['KZ', '카자흐스탄'],
  ['QA', '카타르'],
  ['KH', '캄보디아'],
  ['CA', '캐나다'],
  ['KE', '케냐'],
  ['KY', '케이맨제도'],
  ['KM', '코모로 이슬람연방공화국'],
  ['CR', '코스타리카'],
  ['CI', '코트 디브와르'],
  ['CO', '콜롬비아'],
  ['CD', '콩고공화국'],
  ['CG', '콩코'],
  ['CU', '쿠바'],
  ['KW', '쿠웨이트'],
  ['CK', '쿡제도'],
  ['CW', '퀴라소'],
  ['HR', '크로아티아'],
  ['KG', '키리기스스탄'],
  ['KI', '키리바시'],
  ['CY', '키프러스'],
  ['TH', '타이'],
  ['TJ', '타지키스탄'],
  ['TZ', '탄자니아'],
  ['TC', '터기 앤 카이코스 제도'],
  ['TR', '터어키 공화국'],
  ['TG', '토고'],
  ['TK', '토켈라우 제도'],
  ['TO', '통가'],
  ['TM', '투르크메니스탄'],
  ['TV', '투발루'],
  ['TN', '튀니지'],
  ['TT', '트리니다드 토바고'],
  ['TL', '티모르 레스테'],
  ['PA', '파나마 공화국'],
  ['PY', '파라과이'],
  ['PK', '파키스탄'],
  ['PG', '파푸아 뉴기아'],
  ['PW', '팔라우'],
  ['PS', '팔레스타인'],
  ['FO', '페로스 제도'],
  ['PE', '페루'],
  ['PT', '포루투갈'],
  ['FK', '포클랜드 제도'],
  ['PL', '폴란드'],
  ['PR', '푸에르토 리코'],
  ['FR', '프랑스'],
  ['GF', '프랑스령 기아나'],
  ['PF', '프랑스령 폴리네시아'],
  ['RE', '프랑스령리유니온'],
  ['FJ', '피지'],
  ['PN', '피트케언'],
  ['FI', '핀란드'],
  ['PH', '필리핀'],
  ['HU', '헝가리'],
  ['HK', '홍콩'],
];

export default Security;
