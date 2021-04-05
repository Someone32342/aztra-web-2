import React, { useState } from 'react'
import { Form, Container, Row, Col, Button, Spinner, Modal, Table } from 'react-bootstrap'
import { TicketSet } from 'types/dbtypes'
import { Code as CodeIcon } from '@material-ui/icons'
import TextareaAutosize from 'react-textarea-autosize'
import axios from 'axios'
import api from 'datas/api'
import Cookies from 'universal-cookie'
import { Emoji } from 'emoji-mart'

interface MessageSettingsProps {
  ticketSet: TicketSet
  mutate: Function
}

const MessageSettings: React.FC<MessageSettingsProps> = ({ ticketSet, mutate }) => {
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newCreateMessage, setNewCreateMessage] = useState<string | null>(null)
  const [newInitialMessage, setNewInitialMessage] = useState<string | null>(null)
  const [createMessageValidate, setCreateMessageValidate] = useState<boolean | null>(null)
  const [initialMessageValidate, setInitialMessageValidate] = useState<boolean | null>(null)

  const [showFormattings, setShowFormattings] = useState(false)

  const isChanged = () => (
    (newCreateMessage !== null && ticketSet.create_message !== newCreateMessage)
    || (newInitialMessage !== null && ticketSet.initial_message !== newInitialMessage)
  )

  return (
    <Form as={Container} fluid className="mt-3">
      <Row className="py-2">
        <div className="d-flex align-items-center pb-2 w-100">
          <h4 className="pr-5 mb-0">메시지 설정</h4>
          <Button variant="dark" className="ml-auto d-flex align-items-center" size="sm" onClick={() => setShowFormattings(true)} >
            <CodeIcon className="mr-2" fontSize="small" />서식문자 목록
          </Button>
        </div>

        <Modal className="modal-dark" show={showFormattings} onHide={() => setShowFormattings(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title style={{
              fontFamily: "NanumSquare",
              fontWeight: 900,
            }}>
              서식문자 목록
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <Table variant="dark">
              <thead>
                <tr>
                  <th>코드</th>
                  <th>설명</th>
                  <th>예시</th>
                </tr>
              </thead>
              <tbody>
                {
                  [
                    ['opener_name', '티켓 생성자 이름', 'Aztra'],
                    ['opener_tag', '티켓 생성자의 태그', '2412'],
                    ['opener_id', '티켓 생성자의 ID', '751339721782722570'],
                    ['opener_mention', '티켓 생성자를 멘션', '@Aztra'],
                    ['ticket_number', '티켓 번호', '12'],
                    ['ticket_name', '티켓 이름', '신고'],
                    ['ticket_emoji', '티켓 이모지', <Emoji emoji="+1" set="twitter" size={18}/>]
                  ].map(([c, d, e]) => <tr key={c as string}>
                    <td>${`{${c}}`}</td>
                    <td>{d}</td>
                    <td>{e}</td>
                  </tr>)
                }
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer className="justify-content-end">
            <Button variant="dark" onClick={() => setShowFormattings(false)}>
              닫기
            </Button>
          </Modal.Footer>
        </Modal>
      </Row>

      <Row>
        <Form.Label column sm="auto" className="font-weight-bold">티켓 생성 메시지</Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              as={TextareaAutosize}
              value={newCreateMessage ?? ticketSet.create_message}
              isInvalid={createMessageValidate === false}
              placeholder="예) 티켓을 생성하려면 아래에 ${ticket_emoji} 로 반응하세요!"
              onChange={e => {
                const value = e.target.value
                setCreateMessageValidate(value.length !== 0 && value.length <= 100)
                setNewCreateMessage(value)
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newCreateMessage?.length ?? -1) === 0 && "필수 입력입니다."}
              {(newCreateMessage?.length ?? -1) > 100 && "100자 이하여야 합니다."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Form.Label column sm="auto" className="font-weight-bold">티켓 초기 메시지</Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              as={TextareaAutosize}
              value={newInitialMessage ?? ticketSet.initial_message}
              isInvalid={initialMessageValidate === false}
              placeholder="예) ${opener_mention} 님의 **${ticket_name}** 입니다. 문의할 내용을 입력해주세요!"
              onChange={e => {
                const value = e.target.value
                setInitialMessageValidate(value.length !== 0 && value.length <= 100)
                setNewInitialMessage(value)
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newInitialMessage?.length ?? -1) === 0 && "필수 입력입니다."}
              {(newInitialMessage?.length ?? -1) > 100 && "100자 이하여야 합니다."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Button
          variant={saveError ? "danger" : "aztra"}
          disabled={saving || saveError || !isChanged() || createMessageValidate === false}
          onClick={() => {
            setSaving(true)

            const patchData: Partial<Omit<TicketSet, 'guild' | 'uuid'>> = {
              create_message: newCreateMessage ?? undefined,
              initial_message: newInitialMessage ?? undefined
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
          style={{
            minWidth: 140
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
      </Row>
    </Form>
  )
}

export default MessageSettings