import React, { useState } from "react"
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, OverlayTrigger, Row, Spinner, Table, Tooltip } from "react-bootstrap"
import { Add as AddIcon, RemoveCircleOutline, Check as CheckIcon } from '@material-ui/icons'
import Twemoji from 'react-twemoji'
import RoleBadge, { AddRole } from "components/forms/RoleBadge"
import EmojiPickerI18n from "defs/EmojiPickerI18n"
import { Emoji, Picker } from "emoji-mart"

import styles from 'styles/components/autotasking/EmojiRole.module.scss'
import classNames from 'classnames/bind'
import { EmojiRoleData } from "types/autotask/action_data"
import { ChannelMinimal, Role } from "types/DiscordTypes"
import { EmojiRoleParams } from "types/autotask/params"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHashtag } from "@fortawesome/free-solid-svg-icons"
import ChannelSelectCard from "components/forms/ChannelSelectCard"
const cx = classNames.bind(styles)

interface EmojiRoleProps {
  guildId: string
  channels: ChannelMinimal[]
  roles: Role[]
  saving?: boolean
  saveError?: boolean
  onSubmit?: (data: { params: EmojiRoleParams, data: EmojiRoleData[] }, event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

const EmojiRole: React.FC<EmojiRoleProps> = ({ guildId, channels, roles, saving, saveError, onSubmit }) => {
  const [newParams, setNewParams] = useState<Partial<EmojiRoleParams>>({})
  const [newAddedData, setNewAddedData] = useState<EmojiRoleData[]>([])
  const [newData, setNewData] = useState<Omit<EmojiRoleData, 'emoji'> & { emoji?: string | null }>({ add: [], remove: [] })
  const [channelSearch, setChannelSearch] = useState('')

  const filterChannels = () => {
    return channels
      ?.filter(one => one.type === "text")
      ?.filter(one => one.name?.includes(channelSearch))
      ?.sort((a, b) => a.rawPosition - b.rawPosition)
      ?.map(one =>
        <ChannelSelectCard
          key={one.id}
          selected={newParams.channel === one.id}
          channelData={{
            channelName: one.name,
            parentChannelName: channels?.find(c => c.id === one.parentID)?.name
          }}
          onClick={() => setNewParams({ ...newParams, channel: one.id })}
        />
      )
  }

  const filteredChannels = filterChannels()

  return (
    <>
      <Row>
        <Col>
          <Form.Label className="pt-2 h5 font-weight-bold">메시지 채널:</Form.Label>
          <Form.Text className="pb-2">대상이 되는 메시지가 있는 채널을 선택하세요</Form.Text>
          <Form.Group className="p-2" style={{ backgroundColor: '#424752', borderRadius: 10 }}>
            <Container fluid>
              <Row className="mb-3 flex-column">
                {
                  newParams.channel
                    ? <>
                      <Card bg="secondary">
                        <Card.Header className="py-1 px-3" style={{
                          fontFamily: 'NanumSquare',
                          fontSize: '13pt'
                        }}>
                          <FontAwesomeIcon icon={faHashtag} className="mr-2 my-auto" size="sm" />
                          {channels.find(o => o.id === newParams.channel)?.name}
                        </Card.Header>
                      </Card>
                    </>
                    : <Form.Label className="font-weight-bold">선택된 채널이 없습니다!</Form.Label>
                }

              </Row>
              <Row className="pb-2">
                <input hidden={true} />
                <Form.Control type="text" placeholder="채널 검색" onChange={(e) => setChannelSearch(e.target.value)} />
                <Form.Text className="py-1">
                  {channels?.length}개 채널 찾음
                </Form.Text>
              </Row>
              <Row style={{
                maxHeight: 180,
                overflow: 'auto',
                borderRadius: '10px',
                display: 'block'
              }}>
                {
                  channels
                    ? filteredChannels
                    : <h4>불러오는 중</h4>
                }
              </Row>
            </Container>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Label className="pt-3 h5 font-weight-bold">메시지 아이디:</Form.Label>
          <Form.Text className="pb-2">대상이 되는 메시지의 아이디를 입력하세요</Form.Text>
          <Form.Control as="input" type="text" placeholder="메시지 아이디" value={newParams.message ?? ''} onChange={e => {
            if (isNaN(Number(e.target.value))) return
            setNewParams({ ...newParams, message: e.target.value })
          }} />
        </Col>
      </Row>
      <Row className="pt-3">
        <Col>
          <Form.Label className="pt-2 h5 font-weight-bold">추가한 이모지:</Form.Label>
          <Form.Text>* 이모지를 클릭하면 이모지를 변경할 수 있습니다</Form.Text>
          <Table id="warn-list-table" className="mb-0 mt-2" variant="dark" style={{
            tableLayout: 'fixed'
          }} >
            <thead className={cx("EmojiRole-TableHead")} style={{ fontFamily: "NanumSquare" }}>
              <tr>
                <th className="d-lg-none" />
                <th style={{ fontSize: 17, width: 100 }} className="text-center d-none d-lg-table-cell">이모지</th>
                <th style={{ fontSize: 17 }}>추가할 역할</th>
                <th style={{ fontSize: 17 }}>제거할 역할</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              <tr className="d-lg-none">
                <td className="text-lg-center align-middle">
                  <p>
                    <Twemoji options={{ className: cx("Twemoji-lg") }}>
                      <span className="font-weight-bold pr-2">이모지:</span>
                      ❤
                    </Twemoji>
                  </p>
                  <p>
                    <div className="font-weight-bold">추가할 역할:</div>
                    역할 A
                  </p>
                  <p>
                    <div className="font-weight-bold">제거할 역할:</div>
                    역할 B, 역할 C
                  </p>
                  <div className="mt-2">
                    <Button variant="success" className="w-100">
                      <AddIcon className="mr-1" fontSize="small" />
                      추가
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="d-none d-lg-table-row">
                <td className="text-lg-center align-middle position-relative">
                  <Dropdown>
                    <Dropdown.Toggle id="ds" size="sm" variant="dark" className="remove-after">
                      {
                        newData?.emoji
                          ? <Emoji emoji={newData.emoji} set="twitter" size={28} />
                          : "선택하기"
                      }
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="py-0">
                      <Picker showSkinTones={false} showPreview={false} i18n={EmojiPickerI18n} theme="dark" set="twitter" onClick={emoji => {
                        setNewData({
                          ...newData,
                          emoji: emoji.id ?? null
                        })
                      }} />
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap align-items-center position-relative" >
                    {
                      newData?.add?.map(one => {
                        const role = roles.find(r => r.id === one)
                        return <RoleBadge key={one} className="pr-2 py-1" name={role?.name ?? ''} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} removeable onRemove={() => {
                          setNewData({
                            ...newData,
                            add: newData?.add?.filter(r => r !== one)
                          })
                        }} />
                      })
                    }
                    <Dropdown className="dropdown-menu-dark" onSelect={key => {
                      if (newData.add.includes(key!)) return
                      setNewData({
                        ...newData,
                        add: newData?.add?.concat(key!) ?? newData?.add
                      })
                    }}>
                      <Dropdown.Toggle className="remove-after py-1" as={AddRole} id="add-role-select-toggle" />
                      <Dropdown.Menu style={{ maxHeight: 300, overflowY: 'scroll' }}>
                        {
                          roles.filter(r => r.id !== guildId && !r.managed).sort((a, b) => b.position - a.position).map(r => (
                            <Dropdown.Item key={r.id} eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                              {r.name}
                            </Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap align-items-center position-relative" >
                    {
                      newData?.remove?.map(o => {
                        const role = roles.find(r => r.id === o)
                        return <RoleBadge key={o} className="pr-2 py-1" name={role?.name ?? ''} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} removeable onRemove={() => {
                          setNewData({
                            ...newData,
                            remove: newData?.remove?.filter(r => r !== o)
                          })
                        }} />
                      })
                    }
                    <Dropdown className="dropdown-menu-dark" onSelect={key => {
                      if (newData.remove.includes(key!)) return
                      setNewData({
                        ...newData,
                        remove: newData?.remove?.concat(key!) ?? newData?.remove
                      })
                    }}>
                      <Dropdown.Toggle className="remove-after py-1" as={AddRole} id="remove-role-select-toggle" />
                      <Dropdown.Menu style={{ maxHeight: 300, overflowY: 'scroll' }}>
                        {
                          roles.filter(r => r.id !== guildId && !r.managed).sort((a, b) => b.position - a.position).map(r => (
                            <Dropdown.Item key={r.id} eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                              {r.name}
                            </Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex justify-content-end">
                    <Button variant="success" className="d-flex align-items-center" disabled={!(newData.emoji && (newData.add.length || newData.remove.length))} onClick={() => {
                      setNewAddedData(newAddedData.filter(o => o.emoji !== newData.emoji).concat(newData as EmojiRoleData))
                      setNewData({ add: [], remove: [] })
                    }}>
                      <AddIcon className="mr-1" fontSize="small" />
                      추가
                  </Button>
                  </div>
                </td>
              </tr>

              <div className="mb-3" />

              {
                newAddedData.map((o, idx) => (
                  <tr key={o.emoji}>
                    <td className="text-lg-center align-middle position-relative" >
                      <Dropdown>
                        <Dropdown.Toggle id="ds" size="sm" variant="dark" className="remove-after">
                          {
                            o?.emoji
                              ? <Emoji emoji={o.emoji} set="twitter" size={28} />
                              : "선택하기"
                          }
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="py-0">
                          <Picker showSkinTones={false} showPreview={false} i18n={EmojiPickerI18n} theme="dark" set="twitter" onClick={emoji => {
                            const data = { ...o }
                            data.emoji = emoji.id!

                            const datas = newAddedData.filter(a => a.emoji !== o.emoji ? a.emoji !== emoji.id : false)
                            datas.splice(idx, 0, data)
                            setNewAddedData(datas)
                          }} />
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex flex-wrap align-items-center position-relative" >
                        {
                          o.add.map(one => {
                            const role = roles.find(r => r.id === one)
                            return <RoleBadge key={one} className="pr-2 py-1" name={role?.name ?? ''} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} removeable onRemove={() => {
                              const data = { ...o }
                              data.add = o.add.filter(r => r !== one)

                              const datas = newAddedData.filter(a => a.emoji !== o.emoji)
                              datas.splice(idx, 0, data)
                              setNewAddedData(datas)
                            }} />
                          })
                        }
                        <Dropdown className="dropdown-menu-dark" onSelect={key => {
                          const data = { ...o }
                          data.add = o.add.concat(key!) ?? o.add

                          const datas = newAddedData.filter(a => a.emoji !== o.emoji)
                          datas.splice(idx, 0, data)
                          setNewAddedData(datas)
                        }}>
                          <Dropdown.Toggle className="remove-after py-1" as={AddRole} id="add-role-select-toggle" />
                          <Dropdown.Menu style={{ maxHeight: 300, overflowY: 'scroll' }}>
                            {
                              roles.filter(r => r.id !== guildId && !r.managed).sort((a, b) => b.position - a.position).map(r => (
                                <Dropdown.Item key={r.id} eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                                  {r.name}
                                </Dropdown.Item>
                              ))
                            }
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex flex-wrap align-items-center position-relative" >
                        {
                          o.remove.map(one => {
                            const role = roles.find(r => r.id === one)
                            return <RoleBadge key={one} className="pr-2 py-1" name={role?.name ?? ''} color={'#' + (role?.color ? role?.color.toString(16) : 'fff')} removeable onRemove={() => {
                              const data = { ...o }
                              data.remove = o.remove.filter(r => r !== one)

                              const datas = newAddedData.filter(a => a.emoji !== o.emoji)
                              datas.splice(idx, 0, data)
                              setNewAddedData(datas)
                            }} />
                          })
                        }
                        <Dropdown className="dropdown-menu-dark" onSelect={key => {
                          const data = { ...o }
                          data.remove = o.remove.concat(key!) ?? o.remove

                          const datas = newAddedData.filter(a => a.emoji !== o.emoji)
                          datas.splice(idx, 0, data)
                          setNewAddedData(datas)
                        }}>
                          <Dropdown.Toggle className="remove-after py-1" as={AddRole} id="remove-role-select-toggle" />
                          <Dropdown.Menu style={{ maxHeight: 300, overflowY: 'scroll' }}>
                            {
                              roles.filter(r => r.id !== guildId && !r.managed).sort((a, b) => b.position - a.position).map(r => (
                                <Dropdown.Item key={r.id} eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                                  {r.name}
                                </Dropdown.Item>
                              ))
                            }
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex justify-content-end">
                        <ButtonGroup>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`emoji-remove-list-${idx}`}>
                                삭제
                              </Tooltip>
                            }
                          >
                            <Button variant="dark" className="d-flex px-1 remove-before" onClick={() => {
                              setNewAddedData(newAddedData.filter(one => one.emoji !== o.emoji))
                            }}>
                              <RemoveCircleOutline />
                            </Button>
                          </OverlayTrigger>
                        </ButtonGroup>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <hr className="mt-0" style={{ borderColor: '#4e5058', borderWidth: 2 }} />
          <Button
            className="pl-2 d-flex justify-content-center align-items-center"
            variant={saveError ? "danger" : "aztra"}
            disabled={saving || saveError || !(newParams.channel && newParams.message && newAddedData.length)}
            onClick={event => onSubmit && onSubmit({ params: newParams as EmojiRoleParams, data: newAddedData }, event)}
            style={{
              minWidth: 140
            }}
          >
            {
              saving
                ? <>
                  <Spinner as="span" animation="border" size="sm" role="status" />
                  <span className="pl-2">저장 중...</span>
                </>
                : <span>
                  {
                    saveError
                      ? "오류"
                      : <>
                        <CheckIcon className="mr-1" />
                        설정 완료하기
                      </>
                  }
                </span>
            }
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default EmojiRole