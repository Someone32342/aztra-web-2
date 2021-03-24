import { Add as AddIcon, Close as CloseIcon, Check as CheckIcon, Lock as LockIcon, RemoveCircleOutline as RemoveCircleOutlineIcon } from '@material-ui/icons'
import axios from 'axios'
import api from 'datas/api'
import React, { useState } from 'react'
import { Form, Container, Row, Nav, Col, Dropdown, ButtonGroup, Button, Card, Spinner } from 'react-bootstrap'
import { TicketPerms, TicketSet } from 'types/dbtypes'
import { MemberMinimal, PartialGuildExtend, Permissions, Role } from 'types/DiscordTypes'
import Cookies from 'universal-cookie'


interface PermissionSettingsProps {
  ticketSet: TicketSet
  guild: PartialGuildExtend
  roles: Role[]
  members: MemberMinimal[]
  mutate: Function
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

const PermissionSettings: React.FC<PermissionSettingsProps> = ({ ticketSet, guild, roles, members, mutate }) => {
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)

  const [permType, setPermType] = useState<'open' | 'closed'>('open')

  const [openPermSets, setOpenPermSets] = useState(ticketSet.perms_open)
  const [closedPermSets, setClosedPermSets] = useState(ticketSet.perms_closed)
  const [currentPermSets, setCurrentPermSets] = permType === 'open' ? [openPermSets, setOpenPermSets] : [closedPermSets, setClosedPermSets]

  const openerPerms = currentPermSets.find(o => o.type === 'opener')!
  const [active, setActive] = useState<Pick<TicketPerms, 'id' | 'type'>>({ type: openerPerms.type })

  const [addSearch, setAddSearch] = useState('')

  const permTitleCls = "d-flex justify-content-between align-items-center pr-3 py-3"

  const AddableRoles = roles.filter(r => r.id !== guild?.id && !r.managed && !currentPermSets.find(o => o.id === r.id))
  const AddableMembers = members.filter(m => !currentPermSets.find(o => o.id === m.user.id))

  const isChanged = () => (
    (ticketSet.perms_open.length !== openPermSets.length || !ticketSet.perms_open.every(o => openPermSets.some(r => o.id === r.id && o.type === r.type && o.allow === r.allow && o.deny === r.deny && o.mention === r.mention)))
    || (ticketSet.perms_closed.length !== closedPermSets.length || !ticketSet.perms_closed.every(o => closedPermSets.some(r => o.id === r.id && o.type === r.type && o.allow === r.allow && o.deny === r.deny && o.mention === r.mention)))
  )

  return (
    <Form as={Container} fluid className="mt-3">
      <Row className="align-items-center mb-5 mb-md-2">
        <Col className="px-0 pr-md-3">
          <Card bg="transparent border-dark">
            <Card.Body className="px-3 py-0 d-md-flex align-items-center justify-content-between">
              <div className="d-md-flex">
                <Form.Check id="open-ticket-perm" className="ml-1 mr-3 my-2" type="radio" custom label="열린 티켓 권한" checked={permType === "open"} onChange={() => {
                  setPermType('open')
                  setActive({ type: 'opener' })
                }} />
                <Form.Check id="closed-ticket-perm" className="ml-1 mr-3 my-2" type="radio" custom label="닫힌 티켓 권한" checked={permType === "closed"} onChange={() => {
                  setPermType('closed')
                  setActive({ type: 'opener' })
                }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md="auto" className="px-0 d-flex">
          <Button
            variant={saveError ? "danger" : "aztra"}
            disabled={saving || saveError || !isChanged()}
            className="mt-md-2 mb-2 mt-3 font-weight-bold w-100"
            style={{
              minWidth: 160
            }}
            onClick={() => {
              setSaving(true)

              const patchData: Partial<Omit<TicketSet, 'guild' | 'uuid'>> = {
                perms_open: openPermSets,
                perms_closed: closedPermSets,
              }

              axios.patch(`${api}/servers/${ticketSet.guild}/ticketsets/${ticketSet.uuid}`, patchData, {
                headers: {
                  Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`
                },
              })
                .then(() => mutate())
                .catch(() => setSaveError(false))
                .finally(() => setSaving(false))
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
        </Col>
      </Row>
      <Row>
        <Container fluid className="p-0">
          <Row>
            <Col xs={12} xl={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Link className={`my-1 justify-content-between d-flex align-items-center ${active.id === openerPerms.id && active.type === 'opener' ? "bg-only-dark" : ""}`} onClick={() => setActive({ id: openerPerms.id, type: 'opener' })}><b>(티켓 생성자 권한)</b><LockIcon fontSize="small" /></Nav.Link>
                {
                  currentPermSets
                    .filter(o => o.type === "role")
                    .sort((a, b) => (roles.find(r => r.id === b.id)?.position ?? -1) - (roles.find(r => r.id === a.id)?.position ?? -1))
                    .map(o => {
                      const role = roles.find(r => r.id === o.id)

                      return <Nav.Link key={`${o.type}-${o.id}`} className={`py-0 d-flex justify-content-between align-items-center ${active.id === o.id && active.type === o.type ? "bg-only-dark" : ""}`}>
                        <span className="py-2 w-100" onClick={() => setActive({ id: o.id, type: o.type })} style={{ color: '#' + role?.color.toString(16) }}>
                          {role?.name}
                        </span>
                        <span className="d-flex align-items-center" onClick={() => {
                          setCurrentPermSets(currentPermSets.filter(c => c.id !== o.id || c.type !== o.type))
                          setActive({ type: 'opener' })
                        }}>
                          <RemoveCircleOutlineIcon htmlColor="lightgray" fontSize="small" />
                        </span>
                      </Nav.Link>
                    })
                }
                {
                  currentPermSets
                    .filter(o => o.type === "member")
                    .sort((a, b) => {
                      let aName = members.find(m => m.user.id === a.id)?.displayName ?? ''
                      let bName = members.find(m => m.user.id === b.id)?.displayName ?? ''
                      if (aName > bName) return 1
                      else if (aName < bName) return -1
                      return 0
                    })
                    .map(o => {
                      const member = members.find(m => m.user.id === o.id)

                      return <Nav.Link key={`${o.type}-${o.id}`} className={`py-0 d-flex justify-content-between align-items-center ${active.id === o.id && active.type === o.type ? "bg-only-dark" : ""}`}>
                        <span className="py-2 w-100 d-flex align-items-center" onClick={() => setActive({ id: o.id, type: o.type })}>
                          <img className="rounded-circle mr-2" src={member?.user.avatar ? `https://cdn.discordapp.com/avatars/${member?.user.id}/${member?.user.avatar}.jpeg?size=32` : member?.user.defaultAvatarURL} style={{ width: 28, height: 28 }} />
                          {member?.user.tag}
                        </span>
                        <span className="d-flex align-items-center" onClick={() => {
                          setCurrentPermSets(currentPermSets.filter(c => c.id !== o.id || c.type !== o.type))
                          setActive({ type: 'opener' })
                        }}>
                          <RemoveCircleOutlineIcon htmlColor="lightgray" fontSize="small" />
                        </span>
                      </Nav.Link>
                    })
                }

                <Dropdown className="dropdown-menu-dark" onSelect={e => {
                  const [type, id] = e!.split(' ')

                  if (type === "role") {
                    const role = roles.find(r => r.id === id)
                    if (!role) return
                    setActive({ id: role.id, type: 'role' })
                    setCurrentPermSets(currentPermSets.concat({ id: role.id, allow: 0, deny: 0, type: 'role', mention: false }))
                  }
                  else {
                    const member = members.find(m => m.user.id === id)
                    if (!member) return
                    setActive({ id: member.user.id, type: 'member' })
                    setCurrentPermSets(currentPermSets.concat({ id: member.user.id, allow: 0, deny: 0, type: 'member', mention: false }))
                  }
                }}>
                  <Dropdown.Toggle disabled={!AddableRoles.length} as={Nav.Link} id="add-role-member" size="sm" variant="link" className="my-1 remove-after d-flex align-items-center border-0 shadow-none bg-transparent" >
                    <AddIcon className="mr-2" />
                    새 역할/멤버 권한 추가
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-dark" style={{ maxHeight: 300, minWidth: 240, overflowY: 'scroll' }}>
                    <Form.Control id="add-role-member-search" className="mb-2" type="text" placeholder="역할 또는 멤버 검색..." value={addSearch} onChange={e => setAddSearch(e.target.value)} />
                    {
                      AddableRoles
                        .filter(one => {
                          if (!addSearch) return true
                          let searchLowercase = addSearch.normalize().toLowerCase()
                          return one.name.normalize().toLowerCase().includes(searchLowercase)
                        })
                        .sort((a, b) => b.position - a.position)
                        .map(r => (
                          <Dropdown.Item key={r.id} eventKey={`role ${r.id}`} active={false} style={{ color: '#' + r.color.toString(16) }}>
                            {r.name}
                          </Dropdown.Item>
                        ))
                    }
                    <hr className="my-2" />
                    {
                      AddableMembers
                        .filter(one => {
                          if (!addSearch) return true
                          let searchLowercase = addSearch.normalize().toLowerCase()
                          return one.user.tag?.normalize().toLowerCase().includes(searchLowercase) || one.nickname?.normalize().toLowerCase().includes(searchLowercase)
                        })
                        .sort((a, b) => Number(b.displayName) - Number(a.displayName))
                        .map(m => (
                          <Dropdown.Item className="my-1" key={m.user.id} eventKey={`member ${m.user.id}`} active={false}>
                            <img className="rounded-circle mr-2" src={m.user.avatar ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.jpeg?size=32` : m.user.defaultAvatarURL} style={{ width: 32, height: 32 }} />
                            {m.displayName}
                          </Dropdown.Item>
                        ))
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Col>
            <Col className="d-xl-none">
              <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
            </Col>
            <Col xs={12} xl={9}>
              <Container fluid>
                <Row className="py-3">
                  <Col>
                    <Form.Check id="mention-on-ticket-open" type="checkbox" custom label="티켓이 열릴 때 이 역할/멤버 멘션하기" checked={currentPermSets.find(o => o.id === active.id && o.type === active.type)?.mention} onChange={() => {
                      const activePerm = currentPermSets.find(o => o.id === active.id && o.type === active.type)
                      if (!activePerm) return
                      setCurrentPermSets(currentPermSets.filter(o => o.id !== active.id || o.type !== active.type).concat({ ...activePerm, mention: !activePerm.mention }))
                    }} />
                  </Col>
                </Row>
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

                      const activePerms = currentPermSets.find(o => o.id === active.id && o.type === active.type)
                      if (!activePerms) return null

                      const allow = activePerms.allow & num
                      const deny = activePerms.deny & num

                      return <Col key={n} xs={12} lg={6} className={permTitleCls} style={{ fontFamily: "NanumSquare" }}>
                        <span className="mr-3">{name}</span>
                        <PermissionSwitch state={allow ? true : deny ? false : null} onChange={state => {
                          console.log(currentPermSets)

                          const otherPerms = currentPermSets.filter(o => o.id !== active.id || o.type !== active.type)

                          switch (state) {
                            case true:
                              setCurrentPermSets(otherPerms.concat([{ ...activePerms, allow: activePerms.allow | num, ...(deny ? { deny: activePerms.deny - num } : {}) }]))
                              break
                            case false:
                              setCurrentPermSets(otherPerms.concat([{ ...activePerms, deny: activePerms.deny | num, ...(allow ? { allow: activePerms.allow - num } : {}) }]))
                              break
                            case null:
                              allow && setCurrentPermSets(otherPerms.concat([{ ...activePerms, allow: activePerms.allow - num }]))
                              deny && setCurrentPermSets(otherPerms.concat([{ ...activePerms, deny: activePerms.deny - num }]))
                              break
                          }
                        }} />
                      </Col>
                    })
                  }
                </Row>
                {
                  active.type !== "opener" && (
                    <Row className="mt-4">
                      <Button variant="outline-danger" onClick={() => {
                        setCurrentPermSets(currentPermSets.filter(o => o.id !== active.id || o.type !== active.type))
                        setActive({ type: 'opener' })
                      }}>
                        이 역할/멤버 권한 제거
                      </Button>
                    </Row>
                  )
                }
              </Container>
            </Col>
          </Row>
        </Container>
      </Row>
    </Form>
  )
}

export default PermissionSettings