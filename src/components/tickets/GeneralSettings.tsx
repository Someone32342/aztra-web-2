import React, { useEffect, useState } from 'react';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChannelSelectCard from 'components/forms/ChannelSelectCard';
import {
  Form,
  Container,
  Row,
  Col,
  Card,
  Button,
  Dropdown,
  Modal,
} from 'react-bootstrap';
import { Ticket, TicketSet } from 'types/dbtypes';
import { ChannelMinimal } from 'types/DiscordTypes';
import filterChannels from 'utils/filterChannels';
import EmojiPickerI18n from 'defs/EmojiPickerI18n';
import { Emoji, Picker, getEmojiDataFromNative } from 'emoji-mart';
import emoji from 'node-emoji';
import emoji2 from 'node-emoji-new';
import emojiData from 'emoji-mart/data/all.json';
import axios, { AxiosError } from 'axios';
import api from 'datas/api';
import Cookies from 'universal-cookie';
import Router from 'next/router';
import ChangesNotSaved from 'components/ChangesNotSaved';

interface GeneralSettingsProps {
  channels: ChannelMinimal[];
  ticketSet: TicketSet;
  tickets: Ticket[];
  mutate: Function;
  preload?: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  channels,
  ticketSet,
  tickets,
  mutate,
  preload = false,
}) => {
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState<string | null>(null);
  const [newEmoji, setNewEmoji] = useState<string | null>(null);
  const [newOpenCategory, setNewOpenCategory] = useState<string | null | 0>(
    null
  );
  const [newClosedCategory, setNewClosedCategory] = useState<string | null | 0>(
    null
  );
  const [channelSearch, setChannelSearch] = useState<string>('');
  const [resend, setResend] = useState<
    'wating' | 'error' | 'limited' | 'done' | false
  >(false);

  const [ticketNameValidate, setTicketNameValidate] = useState<boolean | null>(
    null
  );

  const [changed, setChanged] = useState(false);

  const initData = () => {
    setNewName(null);
    setNewChannel(null);
    setNewEmoji(null);
    setNewOpenCategory(null);
    setTicketNameValidate(null);
  };

  useEffect(() => {
    const message = '저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?';

    const routeChangeStart = (url: string) => {
      if (Router.asPath !== url && changed && !confirm(message)) {
        Router.events.emit('routeChangeError');
        Router.replace(Router, Router.asPath);
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e: BeforeUnloadEvent) => {
      if (changed) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', beforeunload);
    Router.events.on('routeChangeStart', routeChangeStart);

    return () => {
      window.removeEventListener('beforeunload', beforeunload);
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [changed]);

  const ticketChannels = tickets.map((o) => o.channel);

  const isChanged = () => {
    const rst =
      (newName !== null && ticketSet.name !== newName) ||
      (newChannel !== null && ticketSet.channel !== newChannel) ||
      (newEmoji !== null && ticketSet.emoji !== newEmoji) ||
      (newOpenCategory !== null &&
        ticketSet.category_opened !== (newOpenCategory || null)) ||
      (newClosedCategory !== null &&
        ticketSet.category_closed !== (newClosedCategory || null));

    if (changed !== rst) {
      setChanged(rst);
    }
    return rst;
  };

  const filteredChannels = filterChannels(
    channels.filter((o) => !ticketChannels.includes(o.id)),
    channelSearch
  );

  const emd = getEmojiDataFromNative(
    newEmoji ?? ticketSet.emoji,
    'twitter',
    emojiData as any
  );

  const save = () => {
    setSaving(true);

    const patchData: Partial<Omit<TicketSet, 'guild' | 'uuid'>> = {
      name: newName ?? undefined,
      channel: newChannel ?? undefined,
      emoji: newEmoji ?? undefined,
      category_opened:
        newOpenCategory === 0
          ? null
          : newOpenCategory === null
          ? undefined
          : newOpenCategory,
      category_closed:
        newClosedCategory === 0
          ? null
          : newClosedCategory === null
          ? undefined
          : newClosedCategory,
    };

    axios
      .patch(
        `${api}/servers/${ticketSet.guild}/ticketsets/${ticketSet.uuid}`,
        patchData,
        {
          headers: {
            Authorization: `Bearer ${new Cookies().get('ACCESS_TOKEN')}`,
          },
        }
      )
      .then(() => mutate())
      .catch(() => setSaveError(false))
      .finally(() => setSaving(false));
  };

  return (
    <Form as={Container} fluid className="mt-3">
      <Row className="pt-3 pb-2">
        <h4 className="pe-5">기본 설정</h4>
      </Row>

      <Row className="mb-3">
        <Form.Label column sm="auto" className="fw-bold">
          티켓 이름
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              value={newName ?? ticketSet.name}
              isInvalid={ticketNameValidate === false}
              onChange={(e) => {
                const value = e.target.value;
                setTicketNameValidate(
                  value.length !== 0 && value.length <= 100
                );
                setNewName(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newName?.length ?? -1) === 0 && '필수 입력입니다.'}
              {(newName?.length ?? -1) > 100 && '100자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Form.Label column sm="auto" className="fw-bold">
          생성 이모지
        </Form.Label>
        <Col>
          <Dropdown>
            <Dropdown.Toggle
              id="ds"
              size="sm"
              variant="dark"
              className="remove-after d-flex align-items-center border-0 shadow-none bg-transparent"
            >
              {emd ? (
                <Emoji size={28} emoji={emd} set="twitter" />
              ) : (
                newEmoji ?? ticketSet.emoji
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
                  setNewEmoji(
                    emoji.hasEmoji(e.id) ? emoji.get(e.id) : emoji2.get(e.id)
                  );
                }}
              />
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row>
        <Col className="p-0">
          <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
        </Col>
      </Row>

      <Row className="py-3">
        <h4 className="pe-5">생성 메시지 채널</h4>
      </Row>
      <Row>
        <Col md={8}>
          <Form.Group>
            <Container fluid>
              <Row className="mb-3 flex-column">
                {channels?.find(
                  (one) => one.id === (newChannel ?? ticketSet?.channel)
                ) ? (
                  <>
                    <h5 className="pe-2 px-0">현재 선택됨: </h5>
                    <Card bg="secondary">
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
                        {
                          channels?.find(
                            (one) =>
                              one.id === (newChannel ?? ticketSet?.channel)
                          )?.name
                        }
                      </Card.Header>
                    </Card>
                  </>
                ) : (
                  <h5 className="px-0">선택된 채널이 없습니다!</h5>
                )}
              </Row>
              <Row className="pb-2">
                <input hidden={true} />
                <Form.Control
                  type="text"
                  placeholder="채널 검색"
                  onChange={(e) => setChannelSearch(e.target.value)}
                />
                <Form.Text className="py-1 px-0">
                  {filteredChannels.length}개 채널 찾음
                </Form.Text>
              </Row>
              <Row
                style={{
                  maxHeight: 220,
                  overflow: 'auto',
                  borderRadius: '10px',
                  display: 'block',
                }}
              >
                {filteredChannels
                  .filter((o) => !tickets.find((t) => t.channel === o.id))
                  .map((one) => (
                    <ChannelSelectCard
                      key={one.id}
                      selected={
                        newChannel === one.id ||
                        (!newChannel && one.id === ticketSet?.channel)
                      }
                      channelData={{
                        channelName: one.name,
                        parentChannelName: channels?.find(
                          (c) => c.id === one.parentId
                        )?.name,
                      }}
                      onClick={() => setNewChannel(one.id)}
                    />
                  ))}
              </Row>
            </Container>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="p-0">
          <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
        </Col>
      </Row>

      <Row className="pt-3 pb-2">
        <h4 className="pe-5">티켓 카테고리</h4>
      </Row>
      <Row className="pb-2">
        <Form.Label column sm="auto" className="fw-bold">
          티켓이 열렸을 때
        </Form.Label>
        <Col xs={6}>
          <Form.Select
            className="shadow-sm"
            style={{ fontSize: 15 }}
            value={newOpenCategory ?? ticketSet.category_opened ?? 0}
            onChange={(e) =>
              setNewOpenCategory(e.target.value === '0' ? 0 : e.target.value)
            }
          >
            <option value={0}>(선택 안 함)</option>
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
      <Row className="pb-3">
        <Form.Label column sm="auto" className="fw-bold">
          티켓이 닫혔을 때
        </Form.Label>
        <Col xs={6}>
          <Form.Select
            className="shadow-sm"
            style={{ fontSize: 15 }}
            value={newClosedCategory ?? ticketSet.category_closed ?? 0}
            onChange={(e) =>
              setNewClosedCategory(e.target.value === '0' ? 0 : e.target.value)
            }
          >
            <option value={0}>(선택 안 함)</option>
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

      <Row>
        <Col className="p-0">
          <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
        </Col>
      </Row>

      <Row className="py-2">
        티켓 생성 메시지를 실수로 삭제하셨거나 찾을 수 없나요? 다시 보낼 수
        있습니다!
      </Row>
      <Row className="pb-3 d-inline-flex">
        <Button
          className="text-white"
          variant="blurple"
          size="sm"
          onClick={() => {
            setResend('wating');
            axios
              .post(
                `${api}/servers/${ticketSet.guild}/ticketsets/${ticketSet.uuid}/resend`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${new Cookies().get(
                      'ACCESS_TOKEN'
                    )}`,
                  },
                }
              )
              .then(() => {
                setResend(false);
              })
              .catch((_e) => {
                let e: AxiosError = _e;
                if (e.response?.status === 429) setResend('limited');
                else setResend('error');
              });
          }}
        >
          생성 메시지 다시 보내기
        </Button>
      </Row>

      <Modal
        className="modal-dark"
        show={resend !== false}
        onHide={() => setResend(false)}
        centered
      >
        <Modal.Body className="py-4">
          {resend === 'wating'
            ? '티켓 생성 메시지를 다시 보내고 있습니다...'
            : resend === 'limited'
            ? '봇 과부하 방지를 위해 1분에 한 번만 보낼 수 있습니다. 1분 후에 다시 시도하세요!'
            : resend === 'error' && '오류가 발생했습니다!'}
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button variant="dark" onClick={() => setResend(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col className="p-0">
          <hr style={{ borderColor: '#4e5058', borderWidth: 2 }} />
        </Col>
      </Row>

      {!saveError && isChanged() && ticketNameValidate !== false ? (
        <ChangesNotSaved
          key="changesNotSaved1"
          onSave={save}
          onReset={initData}
          isSaving={saving}
          isSaveError={saveError}
        />
      ) : (
        <div style={{ opacity: preload ? 0 : 1 }}>
          <ChangesNotSaved key="changesNotSaved2" close />
        </div>
      )}
    </Form>
  );
};

export default GeneralSettings;
