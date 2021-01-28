import React, { useEffect, useRef, useState } from "react"
import { Button, Col, Form, Row, Table } from "react-bootstrap"
import { Add as AddIcon } from '@material-ui/icons'
import Twemoji from 'react-twemoji'
import RoleBadge from "components/forms/RoleBadge"
import EmojiPickerI18n from "defs/EmojiPickerI18n"
import { Emoji, Picker } from "emoji-mart"

import styles from 'styles/components/autotasking/EmojiRole.module.scss'
import classNames from 'classnames/bind'
import { EmojiRoleData } from "types/autotask/action_data"
const cx = classNames.bind(styles)

const EmojiRole: React.FC = () => {
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<string | null>(null)
  const [emojiRoleNewData, setEmojiRoleNewData] = useState<EmojiRoleData[]>([])

  const [newEmoji, setNewEmoji] = useState<string | null>(null)
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
                <td className="text-lg-center align-middle">
                  <span className="cursor-pointer">
                    <div onClick={() => setEmojiPickerTarget('new')}>
                      {
                        newEmoji
                          ? <Emoji emoji={newEmoji} set="twitter" size={28}  />
                          : <Button size="sm" variant="dark">선택하기</Button>
                      }
                    </div>
                  </span>
                  {emojiPickerTarget === "new" &&
                    <div ref={emojiPickerRef} className="shadow-lg" style={{ position: 'absolute', top: 60, left: 120 }}>
                      <Picker showSkinTones={false} showPreview={false} i18n={EmojiPickerI18n} theme="dark" set="twitter" onClick={emoji => {
                        setNewEmoji(emoji.id ?? null)
                      }} />
                    </div>
                  }
                </td>
                <td className="align-middle">
                  <RoleBadge className="mr-2" name="관리자" color="gold" removeable />
                  <RoleBadge className="mr-2" name="관리자" color="gold" />
                  <RoleBadge className="mr-2" name="관리자" color="gold" />
                  <RoleBadge className="mr-2" name="관리자" color="gold" />
                </td>
                <td className="align-middle">
                  <RoleBadge name="유저" color="red" />
                </td>
                <td className="align-middle">
                  <Button variant="success" className="d-flex align-items-center">
                    <AddIcon className="mr-1" fontSize="small" />
                    추가
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}

export default EmojiRole