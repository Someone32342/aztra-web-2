import dayjs from 'dayjs';
import Image from 'next/image';
import React, { memo, useCallback, useState } from 'react';
import {
  Badge,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
} from 'react-bootstrap';
import { MemberMinimal } from 'types/DiscordTypes';

interface EachMembersProps {
  members: MemberMinimal[];
}

type MemberSearchType = 'nick-and-tag' | 'id';

const PER_PAGE = 10;

const EachMembers: React.FC<EachMembersProps> = ({ members }) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchType, setMemberSearchType] =
    useState<MemberSearchType>('nick-and-tag');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const MemberCard: React.FC<{ member: MemberMinimal }> = memo(({ member }) => {
    const onClick = useCallback(
      () => setSelectedMemberId(member.user.id),
      [member.user.id]
    );
    return (
      <Card
        as={Container}
        fluid
        bg="dark"
        className="mb-2 shadow cursor-pointer px-3"
        onClick={onClick}
      >
        <Card.Body className="d-flex py-1 px-0">
          <div className="d-flex align-items-center me-3">
            <Image
              className="my-auto rounded-circle"
              alt={member.user.tag!}
              src={
                member.user.avatar
                  ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpeg?size=64`
                  : member.user.defaultAvatarURL
              }
              width={40}
              height={40}
            />
          </div>
          <div>
            <div className="d-flex">
              <span className="text-break">{member.displayName}</span>
              <span>
                {member.user.bot && (
                  <Badge className="ms-2 my-auto" bg="blurple">
                    BOT
                  </Badge>
                )}
              </span>
            </div>
            <div className="text-muted fw-bold">@{member.user.tag}</div>
          </div>
        </Card.Body>
      </Card>
    );
  });

  MemberCard.displayName = 'MemberCard';

  const filterMembers = (search?: string) => {
    return members
      .filter((one) => {
        if (!search) return true;
        let searchLowercase = search.normalize().toLowerCase();

        switch (memberSearchType) {
          case 'nick-and-tag':
            return (
              one.user.tag
                ?.normalize()
                .toLowerCase()
                .includes(searchLowercase) ||
              one.nickname?.normalize().toLowerCase().includes(searchLowercase)
            );
          case 'id':
            return one.user.id.startsWith(search);
          default:
            return true;
        }
      })
      .sort((a, b) => {
        let aDname = a.displayName!;
        let bDname = b.displayName!;
        if (aDname > bDname) return 1;
        else if (aDname < bDname) return -1;
        return 0;
      });
  };

  const handleMemberSearchTypeOnChange = (searchType: MemberSearchType) => {
    setMemberSearchType(searchType);
    setMemberSearch('');
  };

  const selectedMember = members.find((o) => o.user.id === selectedMemberId);

  const filteredMembers = filterMembers(memberSearch) || members;
  const slicedMembers = filteredMembers?.slice(
    page * PER_PAGE,
    (page + 1) * PER_PAGE
  );

  return (
    <Container fluid className="px-0">
      <Row>
        <Col xs={12} lg={6} xl={4}>
          <div className="d-flex pb-2">
            <span>검색 조건:</span>
            <div className="d-lg-flex">
              <Form.Check
                id="member-search-by-name-and-nick"
                className="ms-4"
                type="radio"
                label="이름 및 닉네임"
                checked={memberSearchType === 'nick-and-tag'}
                style={{ wordBreak: 'keep-all' }}
                onChange={() => handleMemberSearchTypeOnChange('nick-and-tag')}
              />
              <Form.Check
                id="member-search-by-user-id"
                className="ms-4"
                type="radio"
                label="사용자 ID"
                checked={memberSearchType === 'id'}
                style={{ wordBreak: 'keep-all' }}
                onChange={() => handleMemberSearchTypeOnChange('id')}
              />
            </div>
          </div>
          <div className="mb-2">
            <input hidden={true} />
            <Form.Control
              type="text"
              placeholder={
                memberSearchType === 'id'
                  ? '멤버 아이디 검색 (숫자만 입력할 수 있습니다)'
                  : '멤버 검색'
              }
              value={memberSearch}
              onChange={(e) => {
                if (memberSearchType === 'id' && isNaN(Number(e.target.value)))
                  return;
                setPage(0);
                setMemberSearch(e.target.value);
              }}
            />
          </div>
          <div>
            {slicedMembers?.map((one) => (
              <MemberCard key={one.user.id} member={one} />
            ))}
          </div>
          <div className="pagination-dark d-flex justify-content-center mb-4">
            <Pagination>
              <Pagination.First onClick={() => setPage(0)} />
              {Array.from(
                Array(Math.trunc(filteredMembers.length / PER_PAGE) || 1).keys()
              )
                .filter((o) =>
                  page - 3 < 0 ? o < 7 : o >= page - 3 && o <= page + 3
                )
                .map((i) => (
                  <Pagination.Item
                    key={i}
                    active={page === i}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              <Pagination.Last
                onClick={() =>
                  setPage(
                    (Math.trunc(filteredMembers.length / PER_PAGE) || 1) - 1
                  )
                }
              />
            </Pagination>
          </div>
        </Col>
        <Col xs={12} lg={6} xl={8}>
          {selectedMember ? (
            <>
              <Row>
                <Col className="d-flex align-items-center mb-4">
                  <Image
                    className="my-auto rounded-circle"
                    alt={selectedMember.user.tag!}
                    src={
                      selectedMember.user.avatar
                        ? `https://cdn.discordapp.com/avatars/${selectedMember.user.id}/${selectedMember.user.avatar}.jpeg?size=64`
                        : selectedMember.user.defaultAvatarURL
                    }
                    width={60}
                    height={60}
                  />
                  <div className="ps-3">
                    <div style={{ fontSize: 28 }}>
                      {selectedMember.displayName}
                      {selectedMember.user.bot && (
                        <Badge
                          bg="blurple"
                          className="ms-2 fw-bold mt-2 align-text-top px-1"
                          style={{
                            fontSize: '11pt',
                          }}
                        >
                          BOT
                        </Badge>
                      )}
                    </div>
                    <div
                      className="fw-bold"
                      style={{
                        color: '#8f8f8f',
                        fontSize: '13pt',
                      }}
                    >
                      {selectedMember.user.username}#
                      {selectedMember.user.discriminator}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row as="ul">
                <Col>
                  <li>
                    <div className="fw-bold">계정 생성 날짜</div>
                    {dayjs
                      .utc(selectedMember.user.createdAt)
                      .toDate()
                      .toLocaleString()}{' '}
                    (
                    {dayjs().diff(
                      dayjs.utc(selectedMember.user.createdAt ?? undefined),
                      'days'
                    )}
                    일 지남)
                  </li>
                </Col>
                <Col>
                  <li>
                    <div className="fw-bold">서버 참여 날짜</div>
                    {dayjs
                      .utc(selectedMember.joinedAt!)
                      .toDate()
                      .toLocaleString()}{' '}
                    (
                    {dayjs().diff(
                      dayjs.utc(selectedMember.joinedAt ?? undefined),
                      'days'
                    )}
                    일 지남)
                  </li>
                </Col>
              </Row>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="my-4" style={{ color: 'lightgray' }}>
                먼저 멤버를 선택해주세요.
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EachMembers;
