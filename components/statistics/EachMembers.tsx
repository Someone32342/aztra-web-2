import dayjs from 'dayjs'
import React, { memo, useState } from 'react'
import { Badge, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { MemberMinimal } from 'types/DiscordTypes'

interface EachMembersProps {
  members: MemberMinimal[]
}

type MemberSearchType = 'nick-and-tag' | 'id'

const EachMembers: React.FC<EachMembersProps> = ({ members }) => {
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSearchType, setMemberSearchType] = useState<MemberSearchType>('nick-and-tag')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const MemberCard: React.FC<{ member: MemberMinimal }> = memo(({ member }) => (
    <Card as={Container} fluid bg="dark" className="mb-2 shadow cursor-pointer" onClick={() => setSelectedMemberId(member.user.id)}>
      <Card.Body className="d-flex py-1 px-0">
        <img
          className="my-auto"
          alt={member.user.tag!}
          src={member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpeg?size=64` : member.user.defaultAvatarURL}
          style={{ width: 40, height: 40, marginRight: 15, borderRadius: '70%' }}
        />
        <div>
          <div className="d-flex">
            <span className="text-break">
              {member.displayName}
            </span>
            <span>
              {member.user.bot && <Badge className="ml-2 my-auto" variant="blurple">BOT</Badge>}
            </span>
          </div>
          <div className="text-muted font-weight-bold text-break" style={{
            fontSize: '11pt'
          }}>
            @{member.user.tag}
          </div>
        </div>
      </Card.Body>
    </Card>
  ))

  const filterMembers = (search?: string) => {
    return members
      ?.filter(one => {
        if (!search) return true
        let searchLowercase = search.normalize().toLowerCase()

        switch (memberSearchType) {
          case 'nick-and-tag':
            return one.user.tag?.normalize().toLowerCase().includes(searchLowercase) || one.nickname?.normalize().toLowerCase().includes(searchLowercase)
          case 'id':
            return one.user.id.startsWith(search)
          default:
            return true
        }
      })
      .sort((a, b) => {
        let aDname = a.displayName!
        let bDname = b.displayName!
        if (aDname > bDname) return 1
        else if (aDname < bDname) return -1
        return 0
      })!
  }

  const handleMemberSearchTypeOnChange = (searchType: MemberSearchType) => {
    setMemberSearchType(searchType)
    setMemberSearch('')
  }

  const selectedMember = members.find(o => o.user.id === selectedMemberId)

  return <Container fluid>
    <Row>
      <Col xs={12} lg={6} xl={4}>
        <div className="d-flex pb-2">
          <span>검색 조건:</span>
          <div className="d-lg-flex">
            <Form.Check
              id="member-search-by-name-and-nick"
              custom
              className="ml-4"
              type="radio"
              label="이름 및 닉네임"
              checked={memberSearchType === 'nick-and-tag'}
              style={{ wordBreak: 'keep-all' }}
              onChange={() => handleMemberSearchTypeOnChange('nick-and-tag')}
            />
            <Form.Check
              id="member-search-by-user-id"
              custom
              className="ml-4"
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
          <Form.Control type="text" placeholder={memberSearchType === "id" ? "멤버 아이디 검색 (숫자만 입력할 수 있습니다)" : "멤버 검색"} value={memberSearch} onChange={e => {
            if (memberSearchType === "id" && isNaN(Number(e.target.value))) return
            setMemberSearch(e.target.value)
          }} />
        </div>
        <div style={{ maxHeight: 600, overflowY: 'scroll' }}>
          {(filterMembers(memberSearch) || members)?.map(one => <MemberCard key={one.user.id} member={one} />)}
        </div>
      </Col>
      <Col xs={12} lg={6} xl={8}>
        {
          selectedMember
            ? <>
              <Row>
                <Col className="d-flex align-items-center mb-4">
                  <img
                    className="my-auto rounded-circle"
                    alt={selectedMember.user.tag!}
                    src={selectedMember.user.avatar ? `https://cdn.discordapp.com/avatars/${selectedMember.user.id}/${selectedMember.user.avatar}.jpeg?size=64` : selectedMember.user.defaultAvatarURL}
                    style={{ width: 60, height: 60 }}
                  />
                  <div className="pl-3">
                    <div style={{ fontSize: 28 }}>
                      {selectedMember.displayName}
                      {
                        selectedMember.user.bot &&
                        <Badge variant="blurple" className="ml-2 font-weight-bold mt-2 align-text-top" style={{
                          fontSize: '11pt'
                        }}>
                          BOT
                        </Badge>
                      }
                    </div>
                    <div className="font-weight-bold" style={{
                      color: '#8f8f8f',
                      fontSize: '13pt'
                    }}>
                      {selectedMember.user.username}#{selectedMember.user.discriminator}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row as="ul">
                <Col>
                  <li>
                    <div className="font-weight-bold">계정 생성 날짜</div>
                    {dayjs.utc(selectedMember.user.createdAt).toDate().toLocaleString()}
                    {" "}({dayjs().diff(dayjs.utc(selectedMember.user.createdAt ?? undefined), 'days')}일 지남)
                  </li>
                </Col>
                <Col>
                  <li>
                    <div className="font-weight-bold">서버 참여 날짜</div>
                    {dayjs.utc(selectedMember.joinedAt!).toDate().toLocaleString()}
                    {" "}({dayjs().diff(dayjs.utc(selectedMember.joinedAt ?? undefined), 'days')}일 지남)
                  </li>
                </Col>
              </Row>
            </>
            : <div className="d-flex align-items-center justify-content-center h-100">
              <div className="my-4" style={{ color: 'lightgray' }}>먼저 멤버를 선택해주세요.</div>
            </div>
        }
      </Col>
    </Row>
  </Container>
}

export default EachMembers