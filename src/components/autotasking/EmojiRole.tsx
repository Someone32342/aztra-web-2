import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Table,
  Tooltip,
} from 'react-bootstrap';
import {
  Add as AddIcon,
  RemoveCircleOutline,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import RoleBadge, { AddRole } from 'components/forms/RoleBadge';
import EmojiPickerI18n from 'defs/EmojiPickerI18n';
import { Emoji, Picker, getEmojiDataFromNative } from 'emoji-mart';

import styles from 'styles/components/autotasking/EmojiRole.module.scss';
import classNames from 'classnames/bind';
import { EmojiRoleData } from 'types/autotask/action_data';
import { ChannelMinimal, PartialGuild, Role } from 'types/DiscordTypes';
import { EmojiRoleParams } from 'types/autotask/params';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import api from 'datas/api';
import prefixes from 'datas/prefixes';
import Cookies from 'universal-cookie';
import { TaskSet } from 'types/autotask';
import filterChannels from 'utils/filterChannels';
import emoji from 'node-emoji';
import emoji2 from 'node-emoji-new';
import emojiData from 'emoji-mart/data/all.json';
const cx = classNames.bind(styles);

interface EmojiRoleProps {
  guild: PartialGuild | null;
  channels: ChannelMinimal[];
  roles: Role[];
  saving?: boolean;
  saveError?: boolean;
  editMode?: boolean;
  closeButton?: boolean;
  defaultTask?: TaskSet<EmojiRoleParams, EmojiRoleData[]>;
  onSubmit?: (
    data: { params: EmojiRoleParams; data: EmojiRoleData[] },
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  onClose?: Function;
}

const EmojiRole: React.FC<EmojiRoleProps> = ({
  guild,
  channels,
  roles,
  saving,
  saveError,
  editMode,
  closeButton,
  defaultTask,
  onSubmit,
  onClose,
}) => {
  const [newParams, setNewParams] = useState<Partial<EmojiRoleParams>>(
    defaultTask?.params ?? {}
  );
  const [newAddedData, setNewAddedData] = useState<EmojiRoleData[]>(
    defaultTask?.data ?? []
  );
  const [newData, setNewData] = useState<
    Omit<EmojiRoleData, 'emoji'> & { emoji?: string | null }
  >({ add: [], remove: [] });
  const [channelSearch, setChannelSearch] = useState('');
  const [inputMessageId, setInputMessageId] = useState(false);

  const [selectMessage, setSelectMessage] = useState(false);
  const [selectMessageToken, setSelectMessageToken] = useState<string | null>(
    null
  );
  const [selectMessageStatus, setSelectMessageStatus] = useState<
    'pending' | 'done' | 'timeout' | 'error' | null
  >(null);
  const [cancelSelectMessage, setCancelSelectMessage] =
    useState<CancelTokenSource | null>(null);

  const MessageSelectionReq = () => {
    const token = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0'); // Math.random().toString(36).slice(2, 7)
    setSelectMessageToken(token);

    const source = axios.CancelToken.source();
    setCancelSelectMessage(source);

    setSelectMessageStatus('pending');

    axios
      .get(
        `${api}/discord/guilds/${guild?.id}/channels/${newParams.channel}/select-message?token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
          cancelToken: source.token,
        }
      )
      .then(({ data }) => {
        setSelectMessageToken(null);
        setSelectMessageStatus('done');
        setNewParams({ ...newParams, message: data.messageId });
      })
      .catch((_e) => {
        if (_e.isAxiosError) {
          const e: AxiosError = _e;
          if (e.response?.data.message === 'AWAIT_TIMEOUT') {
            setSelectMessageStatus('timeout');
          } else {
            setSelectMessageStatus('error');
          }
        }
      });
  };

  const CancelMessageSelectionReq = () => {
    setSelectMessage(false);
    if (cancelSelectMessage) cancelSelectMessage.cancel();
  };

  const emd = newData.emoji
    ? getEmojiDataFromNative(newData.emoji, 'twitter', emojiData as any)
    : null;

  const filteredChannels = filterChannels(channels, channelSearch);

  return (
    <>
      <Row>
        <Col>
          <Form.Label className="pt-2 h5 font-weight-bold">
            메시지 채널:
          </Form.Label>
          <Form.Text className="pb-3">
            대상이 되는 메시지가 있는 채널을 선택하세요
          </Form.Text>
          <Form.Group
            className="p-2"
            style={{ backgroundColor: '#424752', borderRadius: 10 }}
          >
            <Container fluid>
              <Row className="align-items-center mb-2">
                {newParams.channel ? (
                  <>
                    <Card bg="secondary" className="w-100">
                      <Card.Header
                        className="py-1 px-3"
                        style={{
                          fontFamily: 'NanumSquare',
                          fontSize: '13pt',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faHashtag}
                          className="mr-2 my-auto"
                          size="sm"
                        />
                        {channels.find((o) => o.id === newParams.channel)?.name}
                      </Card.Header>
                    </Card>
                  </>
                ) : (
                  <Form.Label className="font-weight-bold pl-2 my-auto">
                    선택된 채널이 없습니다!
                  </Form.Label>
                )}
              </Row>
              <Row className="pb-2">
                <input hidden={true} />
                <Form.Control
                  type="text"
                  placeholder="채널 검색"
                  onChange={(e) => setChannelSearch(e.target.value)}
                />
                <Form.Text className="py-1">
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
                {channels ? (
                  filteredChannels.map((one) => (
                    <ChannelSelectCard
                      key={one.id}
                      selected={newParams.channel === one.id}
                      channelData={{
                        channelName: one.name,
                        parentChannelName: channels?.find(
                          (c) => c.id === one.parentId
                        )?.name,
                      }}
                      onClick={() =>
                        setNewParams({ ...newParams, channel: one.id })
                      }
                    />
                  ))
                ) : (
                  <h4>불러오는 중</h4>
                )}
              </Row>
            </Container>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Label className="pt-3 h5 font-weight-bold">
            메시지 아이디:
          </Form.Label>
          <Form.Text className="pb-3">
            {inputMessageId ? (
              <>
                대상이 되는 메시지 아이디를 입력하세요. 또는{' '}
                <a
                  className="cursor-pointer"
                  style={{ color: 'DeepSkyBlue' }}
                  onClick={() => setInputMessageId(false)}
                >
                  빠르게 메시지 선택하기
                </a>
              </>
            ) : (
              <>
                메시지 선택하기 버튼으로 빠르게 메시지를 선택할 수 있습니다.
                또는{' '}
                <a
                  className="cursor-pointer"
                  style={{ color: 'DeepSkyBlue' }}
                  onClick={() => setInputMessageId(true)}
                >
                  직접 아이디 입력하기
                </a>
              </>
            )}
          </Form.Text>
        </Col>
      </Row>
      <Row>
        {(inputMessageId || newParams.message) && (
          <Col sm="auto" md={4} className="pr-sm-0">
            <Form.Control
              className="mb-2"
              as="input"
              type="text"
              placeholder="메시지 아이디"
              value={newParams.message ?? ''}
              readOnly={!inputMessageId}
              onChange={(e) => {
                if (isNaN(Number(e.target.value))) return;
                setNewParams({ ...newParams, message: e.target.value });
              }}
            />
          </Col>
        )}
        {!inputMessageId && (
          <>
            <Col>
              <Button
                variant={newParams.channel ? 'aztra' : 'danger'}
                size={!newParams.channel ? 'sm' : undefined}
                disabled={selectMessage || !newParams.channel}
                onClick={() => setSelectMessage(true)}
              >
                {newParams.channel
                  ? `메시지 ${newParams.message ? '다시' : ''} 선택하기`
                  : '위에서 먼저 채널을 선택해주세요!'}
              </Button>
            </Col>
            <Modal
              className="modal-dark"
              show={selectMessage}
              centered
              size="lg"
              onShow={MessageSelectionReq}
              onHide={() => {}}
            >
              <Modal.Header>
                <Modal.Title
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 900,
                  }}
                >
                  메시지 선택하기
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4">
                {selectMessageStatus !== 'done' && (
                  <div>
                    <h5>1. 메시지 답장 버튼 누르기</h5>
                    <p className="pl-2">
                      <span className="font-weight-bold h5">{guild?.name}</span>{' '}
                      서버에서{' '}
                      <span className="font-weight-bold h5">
                        #
                        {channels.find((o) => o.id === newParams.channel)?.name}
                      </span>{' '}
                      채널에서 원하는 메시지를 우클릭해 표시되는 메뉴에서{' '}
                      <b>답장</b>을 클릭합니다.
                    </p>
                    <h5>2. 명령어 입력</h5>
                    <p className="pl-2">
                      <span
                        className="font-weight-bold text-monospace p-1"
                        style={{ backgroundColor: '#4e5052', borderRadius: 8 }}
                      >{`${prefixes}메시지설정 ${selectMessageToken}`}</span>{' '}
                      을 입력합니다.{' '}
                      <a
                        className="cursor-pointer"
                        style={{ color: 'DeepSkyBlue' }}
                        onClick={(e) => {
                          navigator.clipboard.writeText(
                            `${prefixes}메시지설정 ${selectMessageToken}`
                          );
                        }}
                      >
                        복사하기
                      </a>
                    </p>
                    <p className="mb-5">
                      <ul>
                        <li>
                          Aztra가 해당 채널에서 <b>메시지 읽기</b> 권한이 있어야
                          합니다!
                        </li>
                      </ul>
                    </p>
                  </div>
                )}
                <div className="text-center">
                  {selectMessageStatus === 'pending' && (
                    <div className="d-flex justify-content-center align-items-center">
                      <Spinner animation="grow" variant="aztra" />
                      <span className="h5 ml-2 my-auto">명령어 대기 중</span>
                    </div>
                  )}
                  {selectMessageStatus === 'timeout' &&
                    '오류! 시간이 초과되었습니다.'}
                  {selectMessageStatus === 'done' && (
                    <>
                      <b>메시지를 찾았어요! 확인 버튼을 눌러 계속하세요!</b>
                      <div>(메시지 아이디: {newParams.message})</div>
                    </>
                  )}
                  {selectMessageStatus === 'error' && (
                    <b>오류가 발생했습니다!</b>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="justify-content-end">
                <Button
                  variant={selectMessageStatus === 'done' ? 'success' : 'dark'}
                  onClick={
                    selectMessageStatus === 'error'
                      ? MessageSelectionReq
                      : CancelMessageSelectionReq
                  }
                >
                  {selectMessageStatus === 'done' ? (
                    <>
                      <CheckIcon className="mr-2" />
                      완료하기
                    </>
                  ) : selectMessageStatus === 'error' ? (
                    '다시 시도하기'
                  ) : (
                    '취소하고 닫기'
                  )}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </Row>
      <Row className="pt-4">
        <Col>
          <Form.Label className="pt-2 h5 font-weight-bold">
            이모지와 역할 추가하기:
          </Form.Label>
          <Form.Text>
            이모지를 선택하고, 역할을 추가하세요. 아래의 추가버튼을 클릭하면
            이모지를 더 추가할 수 있습니다.
          </Form.Text>
          <Form.Text>* 이모지를 클릭하면 이모지를 변경할 수 있습니다</Form.Text>

          <Button
            variant="success"
            className="d-flex align-items-center mt-4"
            disabled={
              !(newData.emoji && (newData.add.length || newData.remove.length))
            }
            onClick={() => {
              setNewAddedData(
                newAddedData
                  .filter((o) => o.emoji !== newData.emoji)
                  .concat(newData as EmojiRoleData)
              );
              setNewData({ add: [], remove: [] });
            }}
          >
            <AddIcon className="mr-1" fontSize="small" />
            이모지 더 추가
          </Button>

          <Table
            id="warn-list-table"
            className="mb-0 mt-3"
            variant="dark"
            style={{
              tableLayout: 'fixed',
            }}
          >
            <thead
              className={cx('EmojiRole-TableHead')}
              style={{ fontFamily: 'NanumSquare' }}
            >
              <tr>
                <th className="d-lg-none" />
                <th
                  style={{ fontSize: 17, width: 150 }}
                  className="text-center d-none d-lg-table-cell"
                >
                  이모지
                </th>
                <th style={{ fontSize: 17 }}>반응했을 때 추가할 역할</th>
                <th style={{ fontSize: 17 }}>반응 제거했을 때 제거할 역할</th>
                <th style={{ width: 170 }} />
              </tr>
            </thead>
            <tbody>
              {/* 모바일 전용 */}
              <tr className="d-lg-none">
                {
                  <td className="align-middle">
                    <div className="position-relative mb-3 d-flex align-items-center">
                      {newData?.emoji && (
                        <span className="mr-3">
                          {emd ? (
                            <Emoji size={28} emoji={emd} set="twitter" />
                          ) : (
                            newData.emoji
                          )}
                        </span>
                      )}
                      <Dropdown>
                        <Dropdown.Toggle
                          id="ds"
                          size="sm"
                          variant="secondary"
                          className="remove-after"
                        >
                          이모지 선택하기
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="py-0">
                          <Picker
                            showSkinTones={false}
                            showPreview={false}
                            i18n={EmojiPickerI18n}
                            theme="dark"
                            set="twitter"
                            onSelect={(e) => {
                              if (!e.id) return;
                              setNewData({
                                ...newData,
                                emoji:
                                  (emoji.hasEmoji(e.id)
                                    ? emoji.get(e.id)
                                    : emoji2.get(e.id)) ?? null,
                              });
                            }}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    <span className="pr-2">반응했을 때 추가할 역할:</span>
                    <div className="d-flex flex-wrap align-items-center mb-2">
                      {newData?.add?.map((one) => {
                        const role = roles.find((r) => r.id === one);
                        return (
                          <RoleBadge
                            key={one}
                            className="pr-2 py-1"
                            name={role?.name ?? ''}
                            color={
                              '#' +
                              (role?.color ? role?.color.toString(16) : 'fff')
                            }
                            removeable
                            onRemove={() => {
                              setNewData({
                                ...newData,
                                add: newData?.add?.filter((r) => r !== one),
                              });
                            }}
                          />
                        );
                      })}
                      <Dropdown
                        className="dropdown-menu-dark"
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
                    </div>

                    <span className="pr-2">반응 제거했을 때 제거할 역할:</span>
                    <div className="d-flex flex-wrap align-items-center mb-2">
                      {newData?.remove?.map((o) => {
                        const role = roles.find((r) => r.id === o);
                        return (
                          <RoleBadge
                            key={o}
                            className="pr-2 py-1"
                            name={role?.name ?? ''}
                            color={
                              '#' +
                              (role?.color ? role?.color.toString(16) : 'fff')
                            }
                            removeable
                            onRemove={() => {
                              setNewData({
                                ...newData,
                                remove: newData?.remove?.filter((r) => r !== o),
                              });
                            }}
                          />
                        );
                      })}
                      <Dropdown
                        className="dropdown-menu-dark"
                        onSelect={(key) => {
                          if (newData.remove.includes(key!)) return;
                          setNewData({
                            ...newData,
                            remove:
                              newData?.remove?.concat(key!) ?? newData?.remove,
                          });
                        }}
                      >
                        <Dropdown.Toggle
                          className="remove-after py-1"
                          as={AddRole}
                          id="remove-role-select-toggle"
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
                    </div>
                  </td>
                }
              </tr>

              {newAddedData.map((o, idx) => {
                const em = getEmojiDataFromNative(
                  o.emoji,
                  'twitter',
                  emojiData as any
                );

                return (
                  <tr key={o.emoji} className="d-lg-none">
                    <td className="align-middle w-100">
                      <div className="position-relative d-flex align-items-center my-2">
                        {o.emoji && (
                          <span className="mr-3">
                            {em ? (
                              <Emoji size={28} emoji={em} set="twitter" />
                            ) : (
                              o.emoji
                            )}
                          </span>
                        )}
                        <Dropdown>
                          <Dropdown.Toggle
                            id="ds"
                            size="sm"
                            variant="secondary"
                            className="remove-after"
                          >
                            이모지 변경하기
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="py-0">
                            <Picker
                              showSkinTones={false}
                              showPreview={false}
                              i18n={EmojiPickerI18n}
                              theme="dark"
                              set="twitter"
                              onSelect={(e) => {
                                if (!e.id) return;
                                const data = { ...o };
                                data.emoji = emoji.hasEmoji(e.id)
                                  ? emoji.get(e.id)
                                  : emoji2.get(e.id);

                                const datas = newAddedData.filter((a) =>
                                  a.emoji !== o.emoji
                                    ? a.emoji !== data.emoji
                                    : false
                                );
                                datas.splice(idx, 0, data);
                                setNewAddedData(datas);
                              }}
                            />
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      <div className="d-flex flex-wrap align-items-center position-relative my-1">
                        <span className="pr-2">반응했을 때 추가할 역할:</span>
                        {o.add.map((one) => {
                          const role = roles.find((r) => r.id === one);
                          return (
                            <RoleBadge
                              key={one}
                              className="pr-2 py-1"
                              name={role?.name ?? ''}
                              color={
                                '#' +
                                (role?.color ? role?.color.toString(16) : 'fff')
                              }
                              removeable
                              onRemove={() => {
                                const data = { ...o };
                                data.add = o.add.filter((r) => r !== one);

                                const datas = newAddedData.filter(
                                  (a) => a.emoji !== o.emoji
                                );
                                datas.splice(idx, 0, data);
                                setNewAddedData(datas);
                              }}
                            />
                          );
                        })}
                        <Dropdown
                          className="dropdown-menu-dark"
                          onSelect={(key) => {
                            const data = { ...o };
                            data.add = o.add.concat(key!) ?? o.add;

                            const datas = newAddedData.filter(
                              (a) => a.emoji !== o.emoji
                            );
                            datas.splice(idx, 0, data);
                            setNewAddedData(datas);
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
                      </div>

                      <div className="d-flex flex-wrap align-items-center position-relative my-1">
                        <span className="pr-2">
                          반응 제거했을 때 제거할 역할:
                        </span>
                        {o.remove.map((one) => {
                          const role = roles.find((r) => r.id === one);
                          return (
                            <RoleBadge
                              key={one}
                              className="pr-2 py-1"
                              name={role?.name ?? ''}
                              color={
                                '#' +
                                (role?.color ? role?.color.toString(16) : 'fff')
                              }
                              removeable
                              onRemove={() => {
                                const data = { ...o };
                                data.remove = o.remove.filter((r) => r !== one);

                                const datas = newAddedData.filter(
                                  (a) => a.emoji !== o.emoji
                                );
                                datas.splice(idx, 0, data);
                                setNewAddedData(datas);
                              }}
                            />
                          );
                        })}
                        <Dropdown
                          className="dropdown-menu-dark"
                          onSelect={(key) => {
                            const data = { ...o };
                            data.remove = o.remove.concat(key!) ?? o.remove;

                            const datas = newAddedData.filter(
                              (a) => a.emoji !== o.emoji
                            );
                            datas.splice(idx, 0, data);
                            setNewAddedData(datas);
                          }}
                        >
                          <Dropdown.Toggle
                            className="remove-after py-1"
                            as={AddRole}
                            id="remove-role-select-toggle"
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
                      </div>

                      <div className="my-2">
                        <ButtonGroup>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="d-flex remove-before align-items-center"
                            onClick={() => {
                              setNewAddedData(
                                newAddedData.filter(
                                  (one) => one.emoji !== o.emoji
                                )
                              );
                            }}
                          >
                            <RemoveCircleOutline className="mr-2" />
                            삭제
                          </Button>
                        </ButtonGroup>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* PC 전용 */}
              <tr className="d-none d-lg-table-row">
                <td className="text-lg-center align-middle position-relative">
                  <Dropdown>
                    <Dropdown.Toggle
                      id="ds"
                      size="sm"
                      variant={newData?.emoji ? 'dark' : 'secondary'}
                      className="remove-after"
                    >
                      {newData?.emoji ? (
                        emd ? (
                          <Emoji size={28} emoji={emd} set="twitter" />
                        ) : (
                          newData.emoji
                        )
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
                        onSelect={(e) => {
                          if (!e.id) return;
                          setNewData({
                            ...newData,
                            emoji:
                              (emoji.hasEmoji(e.id)
                                ? emoji.get(e.id)
                                : emoji2.get(e.id)) ?? null,
                          });
                        }}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap align-items-center">
                    {newData?.add?.map((one) => {
                      const role = roles.find((r) => r.id === one);
                      return (
                        <RoleBadge
                          key={one}
                          className="pr-2 py-1"
                          name={role?.name ?? ''}
                          color={
                            '#' +
                            (role?.color ? role?.color.toString(16) : 'fff')
                          }
                          removeable
                          onRemove={() => {
                            setNewData({
                              ...newData,
                              add: newData?.add?.filter((r) => r !== one),
                            });
                          }}
                        />
                      );
                    })}
                    <Dropdown
                      className="dropdown-menu-dark"
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
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap align-items-center">
                    {newData?.remove?.map((o) => {
                      const role = roles.find((r) => r.id === o);
                      return (
                        <RoleBadge
                          key={o}
                          className="pr-2 py-1"
                          name={role?.name ?? ''}
                          color={
                            '#' +
                            (role?.color ? role?.color.toString(16) : 'fff')
                          }
                          removeable
                          onRemove={() => {
                            setNewData({
                              ...newData,
                              remove: newData?.remove?.filter((r) => r !== o),
                            });
                          }}
                        />
                      );
                    })}
                    <Dropdown
                      className="dropdown-menu-dark"
                      onSelect={(key) => {
                        if (newData.remove.includes(key!)) return;
                        setNewData({
                          ...newData,
                          remove:
                            newData?.remove?.concat(key!) ?? newData?.remove,
                        });
                      }}
                    >
                      <Dropdown.Toggle
                        className="remove-after py-1"
                        as={AddRole}
                        id="remove-role-select-toggle"
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
                  </div>
                </td>
              </tr>

              <div className="mb-3" />

              {newAddedData.map((o, idx) => {
                const em = getEmojiDataFromNative(
                  o.emoji,
                  'twitter',
                  emojiData as any
                );

                return (
                  <tr key={o.emoji} className="d-none d-lg-table-row">
                    <td className="text-lg-center align-middle position-relative">
                      <Dropdown>
                        <Dropdown.Toggle
                          id="ds"
                          size="sm"
                          variant={o.emoji ? 'dark' : 'secondary'}
                          className="remove-after"
                        >
                          {o.emoji ? (
                            em ? (
                              <Emoji size={28} emoji={em} set="twitter" />
                            ) : (
                              o.emoji
                            )
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
                            onSelect={(e) => {
                              if (!e.id) return;
                              const data = { ...o };
                              data.emoji = emoji.hasEmoji(e.id)
                                ? emoji.get(e.id)
                                : emoji2.get(e.id);

                              const datas = newAddedData.filter((a) =>
                                a.emoji !== o.emoji
                                  ? a.emoji !== data.emoji
                                  : false
                              );
                              datas.splice(idx, 0, data);
                              setNewAddedData(datas);
                            }}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex flex-wrap align-items-center position-relative">
                        {o.add.map((one) => {
                          const role = roles.find((r) => r.id === one);
                          return (
                            <RoleBadge
                              key={one}
                              className="pr-2 py-1"
                              name={role?.name ?? ''}
                              color={
                                '#' +
                                (role?.color ? role?.color.toString(16) : 'fff')
                              }
                              removeable
                              onRemove={() => {
                                const data = { ...o };
                                data.add = o.add.filter((r) => r !== one);

                                const datas = newAddedData.filter(
                                  (a) => a.emoji !== o.emoji
                                );
                                datas.splice(idx, 0, data);
                                setNewAddedData(datas);
                              }}
                            />
                          );
                        })}
                        <Dropdown
                          className="dropdown-menu-dark"
                          onSelect={(key) => {
                            const data = { ...o };
                            data.add = o.add.concat(key!) ?? o.add;

                            const datas = newAddedData.filter(
                              (a) => a.emoji !== o.emoji
                            );
                            datas.splice(idx, 0, data);
                            setNewAddedData(datas);
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
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex flex-wrap align-items-center position-relative">
                        {o.remove.map((one) => {
                          const role = roles.find((r) => r.id === one);
                          return (
                            <RoleBadge
                              key={one}
                              className="pr-2 py-1"
                              name={role?.name ?? ''}
                              color={
                                '#' +
                                (role?.color ? role?.color.toString(16) : 'fff')
                              }
                              removeable
                              onRemove={() => {
                                const data = { ...o };
                                data.remove = o.remove.filter((r) => r !== one);

                                const datas = newAddedData.filter(
                                  (a) => a.emoji !== o.emoji
                                );
                                datas.splice(idx, 0, data);
                                setNewAddedData(datas);
                              }}
                            />
                          );
                        })}
                        <Dropdown
                          className="dropdown-menu-dark"
                          onSelect={(key) => {
                            const data = { ...o };
                            data.remove = o.remove.concat(key!) ?? o.remove;

                            const datas = newAddedData.filter(
                              (a) => a.emoji !== o.emoji
                            );
                            datas.splice(idx, 0, data);
                            setNewAddedData(datas);
                          }}
                        >
                          <Dropdown.Toggle
                            className="remove-after py-1"
                            as={AddRole}
                            id="remove-role-select-toggle"
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
                            <Button
                              variant="dark"
                              className="d-flex px-1 remove-before"
                              onClick={() => {
                                setNewAddedData(
                                  newAddedData.filter(
                                    (one) => one.emoji !== o.emoji
                                  )
                                );
                              }}
                            >
                              <RemoveCircleOutline />
                            </Button>
                          </OverlayTrigger>
                        </ButtonGroup>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
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
              className="pl-2 d-flex justify-content-center align-items-center"
              variant={saveError ? 'danger' : 'aztra'}
              disabled={
                saving ||
                saveError ||
                !(
                  newParams.channel &&
                  newParams.message &&
                  (newAddedData.length ||
                    (newData.emoji &&
                      (newData.add.length || newData.remove.length)))
                ) ||
                (!!newAddedData.length &&
                  !newAddedData.some((o) => o.add.length || o.remove.length))
              }
              onClick={(event) =>
                onSubmit &&
                onSubmit(
                  {
                    params: newParams as EmojiRoleParams,
                    data: newAddedData
                      .filter((o) => o.add.length || o.remove.length)
                      .concat(
                        newData.emoji &&
                          (newData.add.length || newData.remove.length)
                          ? [newData as EmojiRoleData]
                          : []
                      ),
                  },
                  event
                )
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
                  <span className="pl-2">저장 중...</span>
                </>
              ) : (
                <span>
                  {saveError ? (
                    '오류'
                  ) : (
                    <>
                      <CheckIcon className="mr-1" />
                      {editMode ? '설정 수정하기' : '설정 완료하기'}
                    </>
                  )}
                </span>
              )}
            </Button>
            {closeButton && (
              <Button
                variant="danger"
                className="ml-3 align-items-center d-flex"
                onClick={() => onClose && onClose()}
              >
                <CloseIcon className="mr-1" />
                취소하고 닫기
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default EmojiRole;
