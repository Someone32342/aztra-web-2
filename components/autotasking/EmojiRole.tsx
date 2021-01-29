import React, { useEffect, useRef, useState } from "react"
import { Button, Col, Container, Dropdown, Form, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap"
import { Add as AddIcon } from '@material-ui/icons'
import Twemoji from 'react-twemoji'
import RoleBadge, { AddRole } from "components/forms/RoleBadge"
import EmojiPickerI18n from "defs/EmojiPickerI18n"
import { Emoji, Picker } from "emoji-mart"

import styles from 'styles/components/autotasking/EmojiRole.module.scss'
import classNames from 'classnames/bind'
import { EmojiRoleData } from "types/autotask/action_data"
import { Role } from "types/DiscordTypes"
const cx = classNames.bind(styles)

interface EmojiRoleProps {
  guildId: string
  roles: Role[]
}

const EmojiRole: React.FC<EmojiRoleProps> = ({ guildId, roles }) => {
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<string | null>(null)
  const [newAddedData, setNewAddedData] = useState<EmojiRoleData[]>([])

  const [newData, setNewData] = useState<Omit<EmojiRoleData, 'emoji'> & { emoji?: string | null }>({ add: [], remove: [] })
  const emojiPickerRef = useRef<any>(null)

  useEffect(() => {
    if (!emojiPickerTarget) return

    const handleOnClick = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerTarget(null)
      }
    }
    window.addEventListener("click", handleOnClick);

    return () => window.removeEventListener("click", handleOnClick)
  })

  return (
    <>
      <Form.Label className="pt-2">추가한 이모지:</Form.Label>
      <Row className="pt-2">
        <Col>
          <small>* 이모지를 클릭하면 이모지를 변경할 수 있습니다</small>
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
                  <span className="cursor-pointer">
                    {
                      newData?.emoji
                        ? <Emoji emoji={newData.emoji} set="twitter" size={28} onClick={() => setEmojiPickerTarget('new')} />
                        : <Button size="sm" variant="dark" onClick={() => setEmojiPickerTarget('new')}>선택하기</Button>
                    }
                  </span>
                  {emojiPickerTarget === "new" &&
                    <div ref={emojiPickerRef} className="shadow-lg" style={{ position: 'absolute', top: 60, zIndex: 99999 }}>
                      <Picker showSkinTones={false} showPreview={false} i18n={EmojiPickerI18n} theme="dark" set="twitter" onClick={emoji => {
                        setEmojiPickerTarget(null)
                        setNewData({
                          ...newData,
                          emoji: emoji.id ?? null
                        })
                      }} />
                    </div>
                  }
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
                          roles.filter(r => r.id !== guildId).sort((a, b) => b.position - a.position).map(r => (
                            <Dropdown.Item eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
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
                          roles.filter(r => r.id !== guildId).sort((a, b) => b.position - a.position).map(r => (
                            <Dropdown.Item eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                              {r.name}
                            </Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </td>
                <td className="align-middle">
                  <Button variant="success" className="d-flex align-items-center" disabled={!(newData.emoji && (newData.add.length || newData.remove.length))} onClick={() => {
                    setNewAddedData(newAddedData.filter(o => o.emoji !== newData.emoji).concat(newData as EmojiRoleData))
                    setNewData({ add: [], remove: [] })
                  }}>
                    <AddIcon className="mr-1" fontSize="small" />
                    추가
                  </Button>
                </td>
              </tr>

              <div className="mb-3" />

              {
                newAddedData.map((o, idx) => (
                  <tr key={o.emoji}>
                    <td className="text-lg-center align-middle position-relative" >
                      <span className="cursor-pointer">
                        {
                          o?.emoji
                            ? <Emoji emoji={o.emoji} set="twitter" size={28} onClick={() => setEmojiPickerTarget(o.emoji)} />
                            : <Button size="sm" variant="dark" onClick={() => setEmojiPickerTarget(o.emoji)}>선택하기</Button>
                        }
                      </span>
                      {emojiPickerTarget === o.emoji &&
                        <div ref={emojiPickerRef} className="shadow-lg" style={{ position: 'absolute', top: 60, zIndex: 99999 }}>
                          <Picker showSkinTones={false} showPreview={false} i18n={EmojiPickerI18n} theme="dark" set="twitter" onClick={emoji => {
                            setEmojiPickerTarget(null)
                            const data = { ...o }
                            data.emoji = emoji.id!

                            const datas = newAddedData.filter(a => a.emoji !== o.emoji ? a.emoji !== emoji.id : false)
                            datas.splice(idx, 0, data)
                            setNewAddedData(datas)
                          }} />
                        </div>
                      }
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
                              roles.filter(r => r.id !== guildId).sort((a, b) => b.position - a.position).map(r => (
                                <Dropdown.Item eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
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
                              roles.filter(r => r.id !== guildId).sort((a, b) => b.position - a.position).map(r => (
                                <Dropdown.Item eventKey={r.id} style={{ color: '#' + r.color.toString(16) }}>
                                  {r.name}
                                </Dropdown.Item>
                              ))
                            }
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex">
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}

export default EmojiRole