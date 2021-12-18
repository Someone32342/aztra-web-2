import React, { useState } from 'react';
import {
  Button,
  Col,
  Dropdown,
  Form,
  Row,
  Spinner,
  Card,
} from 'react-bootstrap';
import { Check as CheckIcon, Close as CloseIcon } from '@material-ui/icons';

import { JoinRoleData } from 'types/autotask/action_data';
import { PartialGuild, Role } from 'types/DiscordTypes';
import { TaskSet } from 'types/autotask';
import RoleBadge, { AddRole } from 'components/forms/RoleBadge';

interface JoinRoleProps {
  guild: PartialGuild | null;
  roles: Role[];
  saving?: boolean;
  saveError?: boolean;
  editMode?: boolean;
  closeButton?: boolean;
  defaultTask?: TaskSet<{}, JoinRoleData>;
  onSubmit?: (
    data: { params: {}; data: JoinRoleData },
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  onClose?: Function;
}

const JoinRole: React.FC<JoinRoleProps> = ({
  guild,
  roles,
  saving,
  saveError,
  editMode,
  closeButton,
  defaultTask,
  onSubmit,
  onClose,
}) => {
  const [newData, setNewData] = useState<JoinRoleData>(
    defaultTask?.data ?? { add: [] }
  );

  return (
    <>
      <Row>
        <Col>
          <h5 className="pt-2">역할 추가하기:</h5>
          <Form.Text>
            멤버가 서버에 참여했을 때 자동으로 추가할 역할을 선택하세요.
          </Form.Text>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card style={{ backgroundColor: '#4b505a' }} className="my-3">
            <Card.Body className="d-flex flex-wrap align-items-center py-2">
              {newData.add.map((one) => {
                const role = roles.find((o) => o.id === one);
                if (!role) return null;

                return (
                  <RoleBadge
                    key={role.id}
                    className="pe-2 py-1"
                    name={role.name ?? ''}
                    color={'#' + (role.color ? role.color.toString(16) : 'fff')}
                    removeable
                    onRemove={() => {
                      setNewData({
                        ...newData,
                        add: newData.add?.filter((r) => r !== one),
                      });
                    }}
                  />
                );
              })}
              <Dropdown
                className="dropdown-menu-dark bg-transparent"
                onSelect={(key) => {
                  if (newData.add.includes(key!)) return;
                  setNewData({
                    ...newData,
                    add: newData?.add?.concat(key!) ?? newData?.add,
                  });
                }}
              >
                <Dropdown.Toggle
                  className="remove-after py-1"
                  as={AddRole}
                  id="add-role-select-toggle"
                />
                <Dropdown.Menu style={{ maxHeight: 300, overflowY: 'scroll' }}>
                  {roles
                    .filter((r) => r.id !== guild?.id && !r.managed)
                    .sort((a, b) => b.position - a.position)
                    .map((r) => (
                      <Dropdown.Item
                        key={r.id}
                        eventKey={r.id}
                        style={{ color: '#' + r.color.toString(16) }}
                      >
                        {r.name}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="d-flex">
            <Button
              className="ps-2 d-flex justify-content-center align-items-center"
              variant={saveError ? 'danger' : 'aztra'}
              disabled={saving || saveError || !newData.add.length}
              onClick={(event) =>
                onSubmit && onSubmit({ params: {}, data: newData }, event)
              }
              style={{
                minWidth: 140,
              }}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                  />
                  <span className="ps-2">저장 중...</span>
                </>
              ) : (
                <span>
                  {saveError ? (
                    '오류'
                  ) : (
                    <>
                      <CheckIcon className="me-1" />
                      {editMode ? '설정 수정하기' : '설정 완료하기'}
                    </>
                  )}
                </span>
              )}
            </Button>
            {closeButton && (
              <Button
                variant="danger"
                className="ms-3 align-items-center d-flex"
                onClick={() => onClose && onClose()}
              >
                <CloseIcon className="me-1" />
                취소하고 닫기
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default JoinRole;
