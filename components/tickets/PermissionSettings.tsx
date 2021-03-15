import { Add as AddIcon, Close as CloseIcon, Check as CheckIcon, Lock as LockIcon } from '@material-ui/icons'
import React, { useState } from 'react'
import { Form, Container, Row, Nav, Col, Dropdown, ButtonGroup, Button, Card } from 'react-bootstrap'
import { Ticket, TicketSet } from 'types/dbtypes'
import { ChannelMinimal, MemberMinimal, PartialGuildExtend, Permissions, Role } from 'types/DiscordTypes'


interface PermissionSettingsProps {
  channels: ChannelMinimal[]
  ticketSet: TicketSet
  tickets: Ticket[]
  guild: PartialGuildExtend
  roles: Role[]
  members: MemberMinimal[]
}

const PermissionSwitch: React.FC<{ state?: boolean | null, onChange?: (state: boolean | null) => void }> = ({ state, onChange }) => {
  const cls = "shadow-none"

  return (
    <ButtonGroup size="sm">
      <Button className={cls} variant={state === false ? "danger" : "outline-danger"} onClick={() => onChange && onChange(false)}><CloseIcon /></Button>
      <Button className={cls} variant={(state ?? null) === null ? "secondary" : "outline-secondary"} onClick={() => onChange && onChange(null)}><span className="px-2">/</span></Button>
      <Button className={cls} variant={state === true ? "success" : "outline-success"} onClick={() => onChange && onChange(true)}><CheckIcon /></Button>
    </ButtonGroup>
  )
}

const PermissionSettings: React.FC<PermissionSettingsProps> = ({ channels, ticketSet, tickets, guild, roles, members }) => {
  const [allowPerms, setAllowPerms] = useState(0)
  const [denyPerms, setDenyPerms] = useState(0)
  const [permType, setPermType] = useState<'open' | 'closed'>('open')

  const permTitleCls = "d-flex justify-content-between align-items-center pr-3 py-3"

  return (
    <Form as={Container} fluid className="mt-3">
      <Card as={Row} bg="transparent border-dark" className="my-3">
        <Card.Body className="px-3 py-2 d-flex">
          <Form.Check id="open-ticket-perm" className="ml-1 mr-3" type="radio" custom label="열린 티켓 권한" checked={permType === "open"} onChange={() => setPermType('open')} />
          <Form.Check id="closed-ticket-perm" className="ml-1 mr-3" type="radio" custom label="닫힌 티켓 권한" checked={permType === "closed"} onChange={() => setPermType('closed')} />
        </Card.Body>
      </Card>
      <Row>
        <Container fluid className="p-0">
          <Row>
            <Col xs={12} xl={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Link className="my-1 bg-only-dark justify-content-between d-flex align-items-center"><b>(티켓 생성자 권한)</b><LockIcon fontSize="small" /></Nav.Link>
                {
                  (permType === "open" ? ticketSet.perms_open : ticketSet.perms_closed).map(o => {
                    return <Nav.Link className={`my-1 ${false ? "bg-only-dark": ""}`}>
                      {o.type === "member" ? members.find(m => m.user.id === o.id)?.user.tag : o.type === "role" ? roles.find(r => r.id === o.id)?.name : null}
                    </Nav.Link>
                  })
                }

                <Dropdown className="dropdown-menu-dark" onSelect={() => { }}>
                  <Dropdown.Toggle as={Nav.Link} id="add-role-member" size="sm" variant="link" className="my-1 remove-after d-flex align-items-center border-0 shadow-none bg-transparent" >
                    <AddIcon className="mr-2" />
                    새 역할/멤버 권한 추가
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-dark" style={{ maxHeight: 300, overflowY: 'scroll' }}>
                    {
                      roles.filter(r => r.id !== guild?.id && !r.managed).sort((a, b) => b.position - a.position).map(r => (
                        <Dropdown.Item key={r.id} eventKey={r.id} active={false} style={{ color: '#' + r.color.toString(16) }}>
                          {r.name}
                        </Dropdown.Item>
                      ))
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Col>
            <Col xs={12} xl={9}>
              <Container fluid>
                <Row style={{ fontSize: 18 }}>
                  {
                    [
                      [Permissions.VIEW_CHANNEL, "채널 보기"],
                      [Permissions.MANAGE_CHANNELS, "채널 관리"],
                      [Permissions.MANAGE_ROLES, "권한 관리"],
                      [Permissions.MANAGE_WEBHOOKS, "웹후크 관리하기"],
                      [Permissions.CREATE_INSTANT_INVITE, "초대 코드 만들기"],
                      [Permissions.SEND_MESSAGES, "메시지 보내기"],
                      [Permissions.EMBED_LINKS, "링크 첨부"],
                      [Permissions.ATTACH_FILES, "파일 첨부"],
                      [Permissions.ADD_REACTIONS, "반응 추가하기"],
                      [Permissions.USE_EXTERNAL_EMOJIS, "외부 이모티콘 사용"],
                      [Permissions.MENTION_EVERYONE, "@everyone, @here, 모든 역할 멘션하기"],
                      [Permissions.MANAGE_MESSAGES, "메시지 관리"],
                      [Permissions.READ_MESSAGE_HISTORY, "메시지 기록 보기"],
                      [Permissions.SEND_TTS_MESSAGES, "텍스트 음성 변환 메시지 전송"],
                    ].map(([n, name]) => {
                      const num = n as number

                      const allow = allowPerms & num
                      const deny = denyPerms & num

                      return <Col xs={12} lg={6} className={permTitleCls} style={{ fontFamily: "NanumSquare" }}>
                        <span className="mr-3">{name}</span>
                        <PermissionSwitch state={allow ? true : deny ? false : null} onChange={state => {
                          switch (state) {
                            case true:
                              setAllowPerms(allowPerms | num)
                              denyPerms & num && setDenyPerms(denyPerms - num)
                              break
                            case false:
                              allowPerms & num && setAllowPerms(allowPerms - num)
                              setDenyPerms(denyPerms | num)
                              break
                            case null:
                              allowPerms & num && setAllowPerms(allowPerms - num)
                              denyPerms & num && setDenyPerms(denyPerms - num)
                              break
                          }
                        }} />
                      </Col>
                    })
                  }
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
      </Row>
    </Form>
  )
}

export default PermissionSettings