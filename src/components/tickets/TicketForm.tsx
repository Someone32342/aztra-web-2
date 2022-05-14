import React, { useState } from 'react';
import { Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Row,
  Form,
  Col,
  Card,
  Container,
  Dropdown,
  Button,
  Spinner,
} from 'react-bootstrap';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import filterChannels from 'utils/filterChannels';
import { TicketSetPOST } from 'types/dbtypes';
import { PartialGuild, ChannelMinimal, Role } from 'types/DiscordTypes';
import EmojiPickerI18n from 'defs/EmojiPickerI18n';
import { Emoji, Picker, getEmojiDataFromNative } from 'emoji-mart';
import emojiData from 'emoji-mart/data/all.json';
import emoji from 'node-emoji';
import emoji2 from 'node-emoji-new';
import RoleBadge, { AddRole } from 'components/forms/RoleBadge';

interface EmojiRoleProps {
  guild: PartialGuild | null;
  channels: ChannelMinimal[];
  roles: Role[];
  saving?: boolean;
  saveError?: boolean;
  editMode?: boolean;
  closeButton?: boolean;
  onSubmit?: (
    data: TicketSetPOST,
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  onClose?: Function;
}

const TicketForm: React.FC<EmojiRoleProps> = ({
  guild,
  channels,
  roles,
  saving,
  saveError,
  editMode,
  closeButton,
  onSubmit,
  onClose,
}) => {
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | 'null'>(
    'null'
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [accessRoles, setAccessRoles] = useState<string[]>([]);
  const [ticketName, setTicketName] = useState('');
  const [mentionRoles, setMentionRoles] = useState(false);

  const [ticketNameValidate, setTicketNameValidate] = useState<boolean | null>(
    null
  );

  const filteredChannels = filterChannels(channels ?? [], channelSearch);

  return (
    <>
      <Row className="w-50">
        <Form.Label column sm="auto" className="fw-bold">
          티켓 이름
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              as="input"
              type="text"
              isInvalid={ticketNameValidate ?? undefined}
              className="shadow-sm"
              value={ticketName}
              placeholder="예) 욕설 신고"
              style={{ fontSize: 15 }}
              onChange={(e) => {
                const value = e.target.value;
                setTicketNameValidate(value.length === 0 || value.length > 100);
                setTicketName(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {ticketName.length === 0 && '필수 입력입니다.'}
              {ticketName.length > 100 && '100자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
      <Row className="pb-2">
        <Col>
          <h5>티켓 생성 채널</h5>
          <Form.Text className="pb-3">
            이 채널에서 Aztra가 보낸 메시지에 사용자가 반응을 추가하면 티켓이
            열립니다.
          </Form.Text>
          <Form.Group
            className="p-2 mt-3"
            style={{ backgroundColor: '#424752', borderRadius: 10 }}
          >
            <Container fluid className="px-2 pt-1">
              <Row className="align-items-center mb-2">
                {selectedChannel ? (
                  <>
                    <Card bg="secondary" className="w-100">
                      <Card.Header
                        className="py-1 px-0"
                        style={{
                          fontFamily: 'NanumSquare',
                          fontSize: '13pt',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHashtag}
                          className="me-2 my-auto"
                          size="sm"
                        />
                        {channels.find((o) => o.id === selectedChannel)?.name}
                      </Card.Header>
                    </Card>
                  </>
                ) : (
                  <h5 className="ps-2 my-auto">선택된 채널이 없습니다!</h5>
                )}
              </Row>
              <Row className="pb-2">
                <input hidden={true} />
                <Form.Control
                  type="text"
                  placeholder="채널 검색"
                  onChange={(e) => setChannelSearch(e.target.value)}
                />
                <Form.Text className="py-1 px-2">
                  {filteredChannels.length}개 채널 찾음
                </Form.Text>
              </Row>
              <Row
                style={{
                  maxHeight: 180,
                  overflow: 'auto',
                  borderRadius: '10px',
                  display: 'block',
                }}
              >
                {filteredChannels.map((one) => (
                  <ChannelSelectCard
                    key={one.id}
                    selected={selectedChannel === one.id}
                    channelData={{
                      channelName: one.name,
                      parentChannelName: channels?.find(
                        (c) => c.id === one.parentId
                      )?.name,
                    }}
                    onClick={() => setSelectedChannel(one.id)}
                  />
                ))}
              </Row>
            </Container>
          </Form.Group>
        </Col>
      </Row>
      <hr className="mb-0" style={{ borderColor: '#4e5058', borderWidth: 2 }} />
      <Row className="pt-3 pb-4">
        <Col>
          <div className="d-flex align-items-center">
            <h5 className="me-3 my-auto">티켓 생성 이모지:</h5>
            <Dropdown>
              <Dropdown.Toggle
                id="ds"
                size="sm"
                variant={selectedEmoji ? 'dark' : 'secondary'}
                className="remove-after"
              >
                {selectedEmoji ? (
                  <Emoji
                    emoji={getEmojiDataFromNative(
                      selectedEmoji,
                      'twitter',
                      emojiData as any
                    )}
                    set="twitter"
                    size={28}
                  />
                ) : (
                  '이모지 선택하기'
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="py-0">
                <Picker
                  showSkinTones={false}
                  showPreview={false}
                  i18n={EmojiPickerI18n}
                  theme="dark"
                  set="twitter"
                  onClick={(e) => {
                    if (!e.id) return;
                    setSelectedEmoji(
                      emoji.hasEmoji(e.id) ? emoji.get(e.id) : emoji2.get(e.id)
                    );
                  }}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Form.Text>
            <b>티켓 생성 채널</b>에서 이 이모지로 반응했을 때 티켓이 열립니다.
            이모지를 클릭하면 변경할 수 있습니다.
          </Form.Text>
        </Col>
      </Row>
      <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
      <Row className="pb-4">
        <Col>
          <h5>티켓 채널 카테고리</h5>
          <Form.Text>
            티켓이 열리면 이 카테고리에 티켓 채널을 생성합니다. 선택하지 않으면
            상단에 생성됩니다.
          </Form.Text>
          <Row className="mt-3">
            <Col xs="auto">
              <Form.Select
                className="shadow-sm"
                style={{ fontSize: 15 }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="null">(선택 안 함)</option>
                {channels
                  .filter((o) => o.type === 'GUILD_CATEGORY')
                  .sort((a, b) => a.rawPosition! - b.rawPosition!)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
      </Row>
      <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
      <Row className="pb-4">
        <Col>
          <h5>접근 가능한 역할</h5>
          <Form.Text>
            티켓이 생성되었을 때 접근할 수 있는 역할을 추가할 수 있습니다.
          </Form.Text>
          <Form.Text className="small" as="b">
            이 역할들은 티켓에서 메시지를 읽고 보낼 수 있으며 티켓을 닫거나
            저장하는 등의 관리 권한이 주어집니다.
          </Form.Text>
          <Row className="my-3">
            <Col>
              <Card
                bg="dark"
                style={{ borderColor: '#4e5058', borderWidth: 1 }}
              >
                <Card.Body className="d-flex flex-wrap align-items-center px-3 py-2">
                  {accessRoles.map((one) => {
                    const role = roles.find((r) => r.id === one);
                    return (
                      <RoleBadge
                        key={one}
                        className="pe-2 py-1"
                        name={role?.name ?? ''}
                        color={
                          '#' + (role?.color ? role?.color.toString(16) : 'fff')
                        }
                        removeable
                        onRemove={() => {
                          setAccessRoles(accessRoles.filter((o) => o !== one));
                        }}
                      />
                    );
                  })}
                  <Dropdown
                    className="dropdown-menu-dark"
                    onSelect={(key) => {
                      if (accessRoles.includes(key!)) return;
                      setAccessRoles(accessRoles.concat([key!]));
                    }}
                  >
                    <Dropdown.Toggle
                      className="remove-after py-1"
                      as={AddRole}
                      id="add-role-select-toggle"
                    />
                    <Dropdown.Menu
                      style={{ maxHeight: 300, overflowY: 'scroll' }}
                    >
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
              <Form.Check
                id="ticket-form-mention-checkbox"
                type="checkbox"
                checked={mentionRoles}
                disabled={!accessRoles.length}
                onChange={() => setMentionRoles(!mentionRoles)}
                label={
                  <span className="ps-2">
                    티켓이 열렸을 때 이 역할들을 멘션하기
                  </span>
                }
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <hr
            className="mt-0"
            style={{ borderColor: '#4e5058', borderWidth: 2 }}
          />
          <div className="d-flex">
            <Button
              className="ps-2 d-flex justify-content-center align-items-center"
              variant={saveError ? 'danger' : 'aztra'}
              disabled={
                saving ||
                saveError ||
                ticketName.length === 0 ||
                ticketName.length > 100 ||
                !selectedEmoji ||
                !channels.find((o) => o.id === selectedChannel)
              }
              onClick={(event) => {
                onSubmit &&
                  onSubmit(
                    {
                      guild: guild!.id,
                      channel: selectedChannel!,
                      category:
                        selectedCategory !== 'null'
                          ? selectedCategory.toString()
                          : null,
                      emoji: selectedEmoji!,
                      name: ticketName,
                      access_roles: accessRoles,
                      mention_roles: mentionRoles,
                    },
                    event
                  );
              }}
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
                      {editMode ? '설정 수정하기' : '설정 등록하기'}
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

export default TicketForm;
