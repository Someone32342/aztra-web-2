import React, { useState } from "react"
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import { Check as CheckIcon, Close as CloseIcon } from '@material-ui/icons'

import { JoinRoleData } from "types/autotask/action_data"
import { ChannelMinimal, PartialGuild, Role } from "types/DiscordTypes"
import { TaskSet } from "types/autotask"

interface JoinRoleProps {
  guild: PartialGuild | null
  channels: ChannelMinimal[]
  roles: Role[]
  saving?: boolean
  saveError?: boolean
  editMode?: boolean
  closeButton?: boolean
  defaultTask?: TaskSet<{}, JoinRoleData>
  onSubmit?: (data: { params: {}, data: JoinRoleData }, event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  onClose?: Function
}

const JoinRole: React.FC<JoinRoleProps> = ({ guild, channels, roles, saving, saveError, editMode, closeButton, defaultTask, onSubmit, onClose }) => {
  const [newData, setNewData] = useState<JoinRoleData>({ add: [] })

  return (
    <>
      <Row className="pt-4">
        <Col>
          <Form.Label className="pt-2 h5 font-weight-bold">역할 추가하기:</Form.Label>
          <Form.Text>멤버가 서버에 참여했을 때 자동으로 추가할 역할을 선택하세요.</Form.Text>
        </Col>
      </Row>

      <Row>
        <Col>
          {
            newData.map(one => (
              
            ))
          }
        </Col>
      </Row>

      <Row>
        <Col>
          <hr className="mt-0" style={{ borderColor: '#4e5058', borderWidth: 2 }} />
          <div className="d-flex">
            <Button
              className="pl-2 d-flex justify-content-center align-items-center"
              variant={saveError ? "danger" : "aztra"}
              disabled={saving || saveError || !newData.add.length}
              onClick={event => onSubmit &&
                onSubmit({ params: {}, data: newData }, event)
              }
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
                          {editMode ? "설정 수정하기" : "설정 완료하기"}
                        </>
                    }
                  </span>
              }
            </Button>
            {
              closeButton &&
              <Button variant="danger" className="ml-3 align-items-center d-flex" onClick={() => onClose && onClose()}>
                <CloseIcon className="mr-1" />
                취소하고 닫기
              </Button>
            }
          </div>
        </Col>
      </Row>
    </>
  )
}

export default JoinRole