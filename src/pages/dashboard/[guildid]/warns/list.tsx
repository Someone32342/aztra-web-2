import React, { useEffect, useRef, useState } from 'react';

import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import { Warns, Warns as WarnsType } from 'types/dbtypes';
import {
  Row,
  Col,
  Form,
  Container,
  Spinner,
  Button,
  Table,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Modal,
  Overlay,
  Collapse,
  Pagination,
  Dropdown,
} from 'react-bootstrap';
import { MemberMinimal } from 'types/DiscordTypes';
import {
  RemoveCircleOutline,
  FileCopy as FileCopyIcon,
  OpenInNew as OpenInNewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import BackTo from 'components/BackTo';
import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import Cookies from 'universal-cookie';
import Layout from 'components/Layout';
import DashboardLayout from 'components/DashboardLayout';
import useSWR from 'swr';
import urljoin from 'url-join';
import Head from 'next/head';
import MemberCell from 'components/MemberCell';
import TextareaAutosize from 'react-textarea-autosize';

export interface WarnsListRouteProps {
  guildId: string;
}

type WarnSearchType = 'reason' | 'target' | 'warnby';

type WarnSortType = 'latest' | 'oldest' | 'count' | 'count_least';

const PER_PAGE = 50;

interface WarnsListCardProps {
  target: MemberMinimal;
  warnby: MemberMinimal;
  warn: WarnsType;
  members: MemberMinimal[];
  guildId: string;
  onEdit?: (data: Warns) => void;
  onDelete?: Function;
  onCheckChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
}

const WarnsListCard: React.FC<WarnsListCardProps> = ({
  target,
  warnby,
  warn,
  members,
  guildId,
  onEdit,
  onDelete,
  onCheckChange,
  checked,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMember, setEditMember] = useState<string | null>(null);
  const [editReason, setEditReason] = useState<string | null>(null);
  const [editCount, setEditCount] = useState<string | null>(null);
  const [editMemberSearch, setEditMemberSearch] = useState('');
  const warnReasonRef = useRef<HTMLParagraphElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const editWarn = (uuid: string) => {
    axios
      .patch(
        `${api}/servers/${guildId}/warns/${uuid}`,
        {
          member: editMember ?? undefined,
          reason: editReason ?? undefined,
          count: editCount ? Number(editCount) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        }
      )
      .then(() => {
        if (onEdit)
          onEdit({
            ...warn,
            member: editMember ?? warn.member,
            reason: editReason ?? warn.reason,
            count: Number(editCount ?? warn.count),
          });
      });
  };

  const delWarn = (uuid: string) => {
    axios
      .delete(`${api}/servers/${guildId}/warns`, {
        data: {
          warns: [uuid],
        },
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      })
      .then(() => {
        if (onDelete) onDelete();
      });
  };

  const ActionBar = (
    <ButtonGroup>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="warn-list-row-remove-warn">경고 취소</Tooltip>}
      >
        <Button
          variant="dark"
          className="d-flex px-1 remove-before bg-transparent border-0"
          onClick={() => setShowDel(true)}
        >
          <RemoveCircleOutline />
        </Button>
      </OverlayTrigger>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="warn-list-row-remove-warn">경고 수정</Tooltip>}
      >
        <Button
          variant="dark"
          className="d-flex px-1 remove-before bg-transparent border-0"
          onClick={() => setShowEdit(true)}
        >
          <EditIcon />
        </Button>
      </OverlayTrigger>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="warn-list-row-remove-warn">자세히 보기</Tooltip>}
      >
        <Button
          variant="dark"
          className="d-flex px-1 remove-before bg-transparent border-0"
          onClick={() => setShowInfo(true)}
        >
          <OpenInNewIcon />
        </Button>
      </OverlayTrigger>
    </ButtonGroup>
  );

  return (
    <>
      <tr className="d-none d-lg-table-row">
        <td className="align-middle text-center">
          <Form.Check
            id={`warn-check-${warn.uuid}`}
            type="checkbox"
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td className="align-middle">
          <div className="d-flex justify-content-center justify-content-lg-start">
            <MemberCell member={target!} guildId={guildId} />
          </div>
        </td>
        <td className="align-middle">
          <span className="d-inline-block text-truncate mw-100 align-middle">
            {warn.reason}
          </span>
        </td>
        <td className="align-middle">{warn.count}회</td>
        <td className="align-middle">
          <div className="d-flex justify-content-center justify-content-lg-start">
            <MemberCell member={warnby!} guildId={guildId} />
          </div>
        </td>
        <td className="align-middle text-center">{ActionBar}</td>
      </tr>
      <tr className="d-lg-none">
        <td className="align-middle text-center">
          <Form.Check
            id={`warn-check-${warn.uuid}`}
            type="checkbox"
            checked={checked}
            onChange={onCheckChange}
          />
        </td>
        <td>
          <div className="pb-1 d-flex align-items-center">
            <b className="pe-2" style={{ fontSize: 15 }}>
              대상 멤버:
            </b>
            <MemberCell member={target!} guildId={guildId} />
          </div>
          <div className="pb-1">
            <b className="pe-2" style={{ fontSize: 15 }}>
              경고 횟수:
            </b>
            <span
              className="d-inline-block text-truncate mw-100 align-middle"
              style={{ fontSize: 14 }}
            >
              {warn.count}회
            </span>
          </div>
          <div className="pb-1">
            <b className="pe-2" style={{ fontSize: 15 }}>
              경고 사유:
            </b>
            <span
              className="d-inline-block text-truncate mw-100 align-middle"
              style={{ fontSize: 14 }}
            >
              {warn.reason}
            </span>
          </div>
          <div className="pb-1 d-flex align-items-center">
            <b className="pe-2" style={{ fontSize: 15 }}>
              경고 부여자:
            </b>
            <MemberCell member={warnby!} guildId={guildId} />
          </div>
          <div>{ActionBar}</div>
        </td>
      </tr>

      <Modal
        className="modal-dark"
        show={showDel}
        onHide={() => setShowDel(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: 'NanumSquare',
              fontWeight: 900,
            }}
          >
            경고 취소하기
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          이 경고를 취소하시겠습니까?
          <div className="pt-3">
            <span className="font-weight-bold">경고 사유</span>: {warn.reason}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button
            variant="aztra"
            onClick={(e) => {
              setShowDel(false);
              delWarn(warn.uuid);
            }}
          >
            확인
          </Button>
          <Button variant="dark" onClick={() => setShowDel(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        className="modal-dark"
        show={showEdit}
        onShow={() => {
          setEditReason(null);
          setEditCount(null);
        }}
        onHide={() => setShowEdit(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: 'NanumSquare',
              fontWeight: 900,
            }}
          >
            경고 수정하기
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <Row className="pb-2">
            <Form.Label column xs="auto" className="me-0">
              대상 멤버
            </Form.Label>
            <Col>
              <Dropdown
                className="dropdown-menu-dark d-inline-block"
                onToggle={() => setEditMemberSearch('')}
                onSelect={(e) => setEditMember(e)}
              >
                <Dropdown.Toggle
                  id="add-role-member"
                  size="sm"
                  variant="dark"
                  className="my-1 remove-after d-flex align-items-center"
                >
                  <MemberCell
                    guildId={guildId}
                    member={
                      editMember
                        ? members.find((m) => m.user.id === editMember)!
                        : target
                    }
                    link={false}
                  />
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
                    placeholder="멤버 검색..."
                    value={editMemberSearch}
                    onChange={(e) => setEditMemberSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {members
                    .filter((one) => {
                      if (!editMemberSearch) return true;
                      let searchLowercase = editMemberSearch
                        .normalize()
                        .toLowerCase();
                      return (
                        one.user.id.startsWith(searchLowercase) ||
                        one.user.tag
                          ?.normalize()
                          .toLowerCase()
                          .includes(searchLowercase) ||
                        one.nickname
                          ?.normalize()
                          .toLowerCase()
                          .includes(searchLowercase)
                      );
                    })
                    .sort(
                      (a, b) => Number(b.displayName) - Number(a.displayName)
                    )
                    .map((m) => (
                      <Dropdown.Item
                        className="my-1 px-3"
                        key={m.user.id}
                        eventKey={m.user.id}
                        active={false}
                      >
                        <img
                          className="rounded-circle me-2"
                          alt=""
                          src={
                            m.user.avatar
                              ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.jpeg?size=32`
                              : m.user.defaultAvatarURL ?? ''
                          }
                          style={{ width: 32, height: 32 }}
                        />
                        {m.displayName}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
          <Row className="pb-2">
            <Form.Label column xs="auto" className="me-0">
              경고 사유
            </Form.Label>
            <Col>
              <Form.Control
                as={TextareaAutosize}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.code == 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
                type="text"
                value={editReason ?? warn.reason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="예) 욕설, 도배 등"
              />
            </Col>
          </Row>
          <Row>
            <Form.Label column xs="auto" className="me-0">
              경고 횟수
            </Form.Label>
            <Col xs={4} sm={3}>
              <Form.Control
                type="text"
                value={editCount ?? warn.count.toString()}
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) return;
                  setEditCount(e.target.value);
                }}
                placeholder="숫자 입력"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button
            variant="aztra"
            className="d-flex align-items-center"
            onClick={() => {
              setShowEdit(false);
              editWarn(warn.uuid);
            }}
          >
            <CheckIcon className="me-2" />
            수정하기
          </Button>
          <Button variant="dark" onClick={() => setShowEdit(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        className="modal-dark"
        show={showInfo}
        onHide={() => setShowInfo(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontFamily: 'NanumSquare',
              fontWeight: 900,
            }}
          >
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
                <p>{warn.count}회</p>
              </Col>
              <Col xs={12} md={6}>
                <h5 className="font-weight-bold">경고 날짜</h5>
                <p>{new Date(warn.dt).toLocaleString()}</p>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <h5 className="font-weight-bold">경고 사유</h5>
                <p ref={warnReasonRef}>{warn.reason}</p>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            <Button
              ref={copyButtonRef}
              size="sm"
              variant="aztra"
              onClick={() => {
                navigator.clipboard.writeText(warn.reason).then(async () => {
                  if (!copied) {
                    setCopied(true);
                    await setTimeout(() => setCopied(false), 800);
                  }
                });
              }}
            >
              <FileCopyIcon
                className="me-2"
                style={{ transform: 'scale(0.9)' }}
              />
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
          <Button variant="success" onClick={() => setShowInfo(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  WarnsListRouteProps
> = async (context) => {
  const { guildid } = context.query;
  return {
    props: {
      guildId: guildid as string,
    },
  };
};

const WarnsList: NextPage<WarnsListRouteProps> = ({ guildId }) => {
  const [warnSearch, setWarnSearch] = useState('');
  const [searchType, setSearchType] = useState<WarnSearchType>('reason');
  const [sortType, setSortType] = useState<WarnSortType>('latest');
  const [selectedWarns, setSelectedWarns] = useState<Set<string>>(new Set());
  const [showSelectedDel, setShowSelectedDel] = useState(false);
  const [page, setPage] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  const parseQs = () => {
    const params = new URLSearchParams(window.location.search);
    let searchtype = params.get('type');
    setWarnSearch(params.get('search') || '');
    setSearchType(
      ['reason', 'target', 'warnby'].includes(searchtype || '')
        ? (searchtype as WarnSearchType)
        : 'reason'
    );
  };

  const { data: warns, mutate: warnsMutate } = useSWR<WarnsType[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/servers/${guildId}/warns`)
      : null,
    (url) =>
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        })
        .then((r) => r.data),
    {
      refreshInterval: 5000,
    }
  );

  const { data: members } = useSWR<MemberMinimal[], AxiosError>(
    new Cookies().get('ACCESS_TOKEN')
      ? urljoin(api, `/discord/guilds/${guildId}/members`)
      : null,
    (url) =>
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        })
        .then((r) => r.data),
    {
      refreshInterval: 5000,
    }
  );

  useEffect(() => {
    if (!new Cookies().get('ACCESS_TOKEN')) {
      const lct = window.location;
      localStorage.setItem('loginFrom', lct.pathname + lct.search);
      window.location.assign('/login');
    } else {
      parseQs();
    }
  }, []);

  const warnsSet = new Set(warns?.map((o) => o.uuid));

  const finalSelectedSet = new Set(
    Array.from(selectedWarns).filter((o) => warnsSet.has(o))
  );

  const filterSortWarns = (search?: string) =>
    warns
      ?.filter((one) => {
        if (!search) return true;
        let searchLowercase = search.normalize().toLowerCase();

        switch (searchType) {
          case 'reason':
            return one.reason
              .normalize()
              .toLowerCase()
              .includes(searchLowercase);
          case 'target':
            let target = members?.find((m) => m.user.id === one.member);
            return (
              target?.user.tag
                ?.normalize()
                .toLowerCase()
                .includes(searchLowercase) ||
              target?.nickname
                ?.normalize()
                .toLowerCase()
                .includes(searchLowercase) ||
              target?.user.id.startsWith(search)
            );
          case 'warnby':
            let warnby = members?.find((m) => m.user.id === one.warnby);
            return (
              warnby?.user.tag
                ?.normalize()
                .toLowerCase()
                .includes(searchLowercase) ||
              warnby?.nickname
                ?.normalize()
                .toLowerCase()
                .includes(searchLowercase) ||
              warnby?.user.id.startsWith(search)
            );
          default:
            return false;
        }
      })
      .sort((a, b) => {
        switch (sortType) {
          case 'latest':
            return new Date(b.dt).getTime() - new Date(a.dt).getTime();
          case 'oldest':
            return new Date(a.dt).getTime() - new Date(b.dt).getTime();
          case 'count':
            return b.count - a.count;
          case 'count_least':
            return a.count - b.count;
          default:
            return 0;
        }
      })!;

  const handleSearchTypeOnChange = (searchType: WarnSearchType) => {
    setSearchType(searchType);
    if (searchRef.current) {
      searchRef.current.value = '';
      setWarnSearch('');
    }
  };

  const handleSortTypeOnChange = (sortType: WarnSortType) => {
    setSortType(sortType);
  };

  const filteredWarns = filterSortWarns(warnSearch) || warns;
  const slicedWarns = filteredWarns?.slice(
    page * PER_PAGE,
    (page + 1) * PER_PAGE
  );

  const PageBar = (
    <div className="pagination-dark d-flex justify-content-center">
      <Pagination>
        <Pagination.First onClick={() => setPage(0)} />
        {Array.from(
          Array(Math.ceil((filteredWarns?.length ?? 0) / PER_PAGE) || 1).keys()
        )
          .filter((o) =>
            page - 3 < 0 ? o < 7 : o >= page - 3 && o <= page + 3
          )
          .map((i) => (
            <Pagination.Item
              key={i + 1}
              active={page === i}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        <Pagination.Last
          onClick={() =>
            setPage(
              (Math.ceil((filteredWarns?.length ?? 0) / PER_PAGE) || 1) - 1
            )
          }
        />
      </Pagination>
    </div>
  );

  const delSelectedWarns = () => {
    axios
      .delete(`${api}/servers/${guildId}/warns`, {
        data: {
          warns: Array.from(finalSelectedSet),
        },
        headers: {
          Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
        },
      })
      .then(() => warnsMutate())
      .finally(() => setSelectedWarns(new Set()));
  };

  return (
    <>
      <Head>
        <title>경고 목록 - Aztra 대시보드</title>
      </Head>
      <Layout>
        <DashboardLayout guildId={guildId}>
          {() => (
            <div
              style={{
                fontFamily: 'NanumBarunGothic',
              }}
            >
              <Row className="dashboard-section">
                <div>
                  <BackTo
                    className="ps-2 mb-4"
                    name="경고 관리"
                    to={`/dashboard/${guildId}/warns`}
                  />
                  <h3>전체 경고 목록</h3>
                </div>
              </Row>
              <Row>
                <Col>
                  {members && warns ? (
                    <Form className="mx-3">
                      <Form.Group>
                        <Row>
                          <Col>{PageBar}</Col>
                        </Row>
                        <Row className="pb-2 justify-content-between">
                          <Col
                            className="d-flex align-items-end mt-4 mt-xl-0 px-0"
                            xs={{
                              span: 0,
                              order: 'last',
                            }}
                            xl={{
                              order: 'first',
                            }}
                            style={{
                              fontSize: '12pt',
                            }}
                          >
                            전체 경고 {warns?.length} 건
                            {finalSelectedSet.size
                              ? finalSelectedSet.size === warns.length
                                ? ', 모두 선택됨'
                                : `, ${finalSelectedSet.size}건 선택됨`
                              : null}
                            {warnSearch && `, ${filteredWarns.length}건 검색됨`}
                          </Col>
                          <Col
                            className="px-0"
                            xs={{
                              span: 12,
                              order: 'first',
                            }}
                            xl={{
                              span: 'auto',
                              order: 'last',
                            }}
                          >
                            <div className="d-flex">
                              <span>검색 조건:</span>
                              <div className="d-lg-flex">
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-search-by-reason"
                                  label="경고 사유"
                                  checked={searchType === 'reason'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSearchTypeOnChange('reason')
                                  }
                                />
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-search-by-target"
                                  label="대상 멤버"
                                  checked={searchType === 'target'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSearchTypeOnChange('target')
                                  }
                                />
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-search-by-warnby"
                                  label="경고 부여자"
                                  checked={searchType === 'warnby'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSearchTypeOnChange('warnby')
                                  }
                                />
                              </div>
                            </div>
                            <div className="d-flex mt-4 mt-lg-0">
                              <span>정렬 조건:</span>
                              <div className="d-lg-flex">
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-sort-latest"
                                  label="최신순"
                                  checked={sortType === 'latest'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSortTypeOnChange('latest')
                                  }
                                />
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-sort-oldest"
                                  label="과거순"
                                  checked={sortType === 'oldest'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSortTypeOnChange('oldest')
                                  }
                                />
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-sort-count"
                                  label="경고수 많은순"
                                  checked={sortType === 'count'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSortTypeOnChange('count')
                                  }
                                />
                                <Form.Check
                                  className="ms-4"
                                  type="radio"
                                  id="radio-sort-count-least"
                                  label="경고수 적은순"
                                  checked={sortType === 'count_least'}
                                  style={{ wordBreak: 'keep-all' }}
                                  onChange={() =>
                                    handleSortTypeOnChange('count_least')
                                  }
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Row className="mb-2">
                          <input hidden />
                          <Form.Control
                            ref={searchRef}
                            type="text"
                            placeholder="경고 검색"
                            defaultValue={warnSearch}
                            onChange={(e) => {
                              setWarnSearch(e.target.value);
                            }}
                          />
                        </Row>

                        <Row className="align-items-center">
                          <Collapse in={!!finalSelectedSet.size}>
                            <div>
                              <div className="pb-2">
                                <span className="me-3">
                                  선택한 것들을({finalSelectedSet.size}개):
                                </span>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setShowSelectedDel(true);
                                  }}
                                >
                                  <DeleteIcon
                                    style={{
                                      marginLeft: '-5px',
                                      transform: 'scale(0.9)',
                                      WebkitTransform: 'scale(0.9)',
                                    }}
                                  />
                                  제거하기
                                </Button>
                              </div>
                            </div>
                          </Collapse>
                        </Row>

                        <Modal
                          className="modal-dark"
                          show={showSelectedDel}
                          onHide={() => setShowSelectedDel(false)}
                          centered
                        >
                          <Modal.Header closeButton>
                            <Modal.Title
                              style={{
                                fontFamily: 'NanumSquare',
                                fontWeight: 900,
                              }}
                            >
                              경고 취소하기
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="py-4">
                            선택한 경고 {finalSelectedSet.size}개를
                            취소하시겠습니까?
                          </Modal.Body>
                          <Modal.Footer className="justify-content-end">
                            <Button
                              variant="danger"
                              onClick={async () => {
                                setShowSelectedDel(false);
                                delSelectedWarns();
                              }}
                            >
                              확인
                            </Button>
                            <Button
                              variant="dark"
                              onClick={() => setShowSelectedDel(false)}
                            >
                              닫기
                            </Button>
                          </Modal.Footer>
                        </Modal>

                        <Row className="flex-column">
                          <Table
                            id="warn-list-table"
                            variant="dark"
                            hover
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
                                    checked={
                                      !!warns.length &&
                                      warnsSet.size === finalSelectedSet.size &&
                                      Array.from(warnsSet).every((value) =>
                                        finalSelectedSet.has(value)
                                      )
                                    }
                                    onChange={() => {
                                      if (
                                        warnsSet.size ===
                                          finalSelectedSet.size &&
                                        Array.from(warnsSet).every((value) =>
                                          finalSelectedSet.has(value)
                                        )
                                      ) {
                                        setSelectedWarns(new Set());
                                      } else {
                                        setSelectedWarns(warnsSet);
                                      }
                                    }}
                                  />
                                </th>
                                <th
                                  className="text-center text-lg-start d-none d-lg-table-cell"
                                  style={{ width: '17%' }}
                                >
                                  대상 멤버
                                </th>
                                <th className="text-center text-lg-start d-none d-lg-table-cell">
                                  경고 사유
                                </th>
                                <th
                                  className="text-center text-lg-start d-none d-lg-table-cell"
                                  style={{ width: '10%' }}
                                >
                                  경고 횟수
                                </th>
                                <th
                                  className="text-center text-lg-start d-none d-lg-table-cell"
                                  style={{ width: '17%' }}
                                >
                                  경고 부여자
                                </th>
                                <th
                                  style={{ width: 125 }}
                                  className="d-none d-lg-table-cell"
                                />
                                <th className="d-lg-none" />
                              </tr>
                            </thead>
                            <tbody>
                              {slicedWarns?.map((one) => (
                                <WarnsListCard
                                  key={one.uuid}
                                  target={
                                    members?.find(
                                      (m) => m.user.id === one.member
                                    )!
                                  }
                                  warnby={
                                    members?.find(
                                      (m) => m.user.id === one.warnby
                                    )!
                                  }
                                  warn={one}
                                  members={members}
                                  guildId={guildId}
                                  onDelete={() => {
                                    const sel = new Set(finalSelectedSet);
                                    sel.delete(one.uuid);
                                    setSelectedWarns(sel);
                                    warnsMutate(
                                      warns.filter((o) => o.uuid !== one.uuid)
                                    );
                                  }}
                                  onEdit={(data) => {
                                    const sel = new Set(finalSelectedSet);
                                    sel.delete(one.uuid);
                                    setSelectedWarns(sel);

                                    let _warns = [...warns];
                                    let _index = _warns.findIndex(
                                      (o) => o.uuid === one.uuid
                                    );
                                    _warns[_index] = data;
                                    warnsMutate(_warns);
                                  }}
                                  checked={finalSelectedSet.has(one.uuid)}
                                  onCheckChange={() => {
                                    console.log(finalSelectedSet.has(one.uuid));
                                    let sel = new Set(finalSelectedSet);

                                    if (sel.has(one.uuid)) sel.delete(one.uuid);
                                    else sel.add(one.uuid);

                                    setSelectedWarns(sel);
                                  }}
                                />
                              ))}
                            </tbody>
                          </Table>
                        </Row>
                        <Row className="justify-content-center mb-5">
                          {!warns.length && (
                            <div
                              className="my-5"
                              style={{ color: 'lightgray' }}
                            >
                              경고가 하나도 없습니다! 평화롭네요.
                            </div>
                          )}
                        </Row>
                        <Row>
                          <Col>{PageBar}</Col>
                        </Row>
                      </Form.Group>
                    </Form>
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
                  )}
                </Col>
              </Row>
            </div>
          )}
        </DashboardLayout>
      </Layout>
    </>
  );
};

export default WarnsList;
