import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { TicketSet } from 'types/dbtypes';
import { Code as CodeIcon } from '@material-ui/icons';
import TextareaAutosize from 'react-textarea-autosize';
import axios from 'axios';
import api from 'datas/api';
import Cookies from 'universal-cookie';
import { Emoji } from 'emoji-mart';
import FormatStrings from 'components/FormatStrings';
import ChangesNotSaved from 'components/ChangesNotSaved';
import Router from 'next/router';

interface MessageSettingsProps {
  ticketSet: TicketSet;
  mutate: Function;
  preload?: boolean;
}

const MessageSettings: React.FC<MessageSettingsProps> = ({
  ticketSet,
  mutate,
  preload = false,
}) => {
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newOpenChannelName, setNewOpenChannelName] = useState<string | null>(
    null
  );
  const [newClosedChannelName, setNewClosedChannelName] = useState<
    string | null
  >(null);
  const [newCreateMessage, setNewCreateMessage] = useState<string | null>(null);
  const [newInitialMessage, setNewInitialMessage] = useState<string | null>(
    null
  );

  const [openChannelNameValidate, setOpenChannelNameValidate] = useState<
    boolean | null
  >(null);
  const [closedChannelNameValidate, setClosedChannelNameValidate] = useState<
    boolean | null
  >(null);
  const [createMessageValidate, setCreateMessageValidate] = useState<
    boolean | null
  >(null);
  const [initialMessageValidate, setInitialMessageValidate] = useState<
    boolean | null
  >(null);

  const [showFormattings, setShowFormattings] = useState<
    'set' | 'ticket' | false
  >(false);

  const [changed, setChanged] = useState(false);

  const initData = () => {
    setNewOpenChannelName(null);
    setNewClosedChannelName(null);
    setNewCreateMessage(null);
    setNewInitialMessage(null);
    setOpenChannelNameValidate(null);
    setClosedChannelNameValidate(null);
    setCreateMessageValidate(null);
    setInitialMessageValidate(null);
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

  const isChanged = () => {
    const rst =
      ((newOpenChannelName !== null &&
        ticketSet.channel_name_open !== newOpenChannelName) ||
        (newClosedChannelName !== null &&
          ticketSet.channel_name_closed !== newClosedChannelName) ||
        (newCreateMessage !== null &&
          ticketSet.create_message !== newCreateMessage) ||
        (newInitialMessage !== null &&
          ticketSet.initial_message !== newInitialMessage)) &&
      ![
        openChannelNameValidate,
        closedChannelNameValidate,
        createMessageValidate,
        initialMessageValidate,
      ].includes(false);

    if (changed !== rst) {
      setChanged(rst);
    }
    return rst;
  };

  const save = () => {
    setSaving(true);

    const patchData: Partial<Omit<TicketSet, 'guild' | 'uuid'>> = {
      create_message: newCreateMessage ?? undefined,
      initial_message: newInitialMessage ?? undefined,
      channel_name_open: newOpenChannelName ?? undefined,
      channel_name_closed: newClosedChannelName ?? undefined,
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
    <Form className="mt-3 px-0">
      <Row className="pt-3 pb-2 px-0">
        <div className="d-flex justify-content-between align-items-center pb-2 w-100">
          <h4 className="pr-5 mb-0">티켓 채널 이름 설정</h4>
          <Button
            variant="dark"
            className="d-flex align-items-center"
            size="sm"
            onClick={() => setShowFormattings('set')}
          >
            <CodeIcon className="mr-2" fontSize="small" />
            서식문자 목록
          </Button>
        </div>

        <FormatStrings
          show={showFormattings === 'set'}
          onHide={() => setShowFormattings(false)}
          data={[
            ['opener_name', '티켓 생성자 이름', 'Aztra'],
            ['opener_tag', '티켓 생성자의 태그', '2412'],
            ['opener_id', '티켓 생성자의 ID', '751339721782722570'],
            ['ticket_number', '티켓 번호', '12'],
            ['ticket_name', '티켓 이름', '신고'],
            [
              'ticket_emoji',
              '티켓 이모지',
              <Emoji key="0" emoji="+1" set="twitter" size={18} />,
            ],
          ]}
        />
      </Row>

      <Row className="mb-3 px-3">
        <Form.Label column sm="auto" className="fw-bold">
          열린 티켓 채널 이름
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              value={newOpenChannelName ?? ticketSet.channel_name_open}
              isInvalid={openChannelNameValidate === false}
              placeholder="예) ${ticket_name}-${ticket_number}"
              onChange={(e) => {
                const value = e.target.value;
                setOpenChannelNameValidate(
                  value.length !== 0 && value.length <= 75
                );
                setNewOpenChannelName(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newOpenChannelName?.length ?? -1) === 0 && '필수 입력입니다.'}
              {(newOpenChannelName?.length ?? -1) > 75 &&
                '75자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="px-3">
        <Form.Label column sm="auto" className="fw-bold">
          닫힌 티켓 채널 이름
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              value={newClosedChannelName ?? ticketSet.channel_name_closed}
              isInvalid={closedChannelNameValidate === false}
              placeholder="예) ${ticket_name}-${ticket_number}-닫힘"
              onChange={(e) => {
                const value = e.target.value;
                setClosedChannelNameValidate(
                  value.length !== 0 && value.length <= 75
                );
                setNewClosedChannelName(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newClosedChannelName?.length ?? -1) === 0 && '필수 입력입니다.'}
              {(newClosedChannelName?.length ?? -1) > 75 &&
                '75자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="py-2 mt-3">
        <div className="d-flex align-items-center justify-content-between pb-2 w-100">
          <h4 className="pr-5 mb-0">메시지 설정</h4>
          <Button
            variant="dark"
            className="d-flex align-items-center"
            size="sm"
            onClick={() => setShowFormattings('ticket')}
          >
            <CodeIcon className="mr-2" fontSize="small" />
            서식문자 목록
          </Button>
        </div>

        <FormatStrings
          show={showFormattings === 'ticket'}
          onHide={() => setShowFormattings(false)}
          data={[
            ['opener_name', '티켓 생성자 이름', 'Aztra'],
            ['opener_tag', '티켓 생성자의 태그', '2412'],
            ['opener_id', '티켓 생성자의 ID', '751339721782722570'],
            ['opener_mention', '티켓 생성자의 멘션', '@Aztra'],
            ['ticket_number', '티켓 번호', '12'],
            ['ticket_name', '티켓 이름', '신고'],
            [
              'ticket_emoji',
              '티켓 이모지',
              <Emoji key="0" emoji="+1" set="twitter" size={18} />,
            ],
          ]}
        />
      </Row>

      <Row className="mb-3 px-3">
        <Form.Label column sm="auto" className="fw-bold">
          티켓 생성 메시지
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              as={TextareaAutosize}
              value={newCreateMessage ?? ticketSet.create_message}
              isInvalid={createMessageValidate === false}
              placeholder="예) 티켓을 생성하려면 아래에 ${ticket_emoji} 로 반응하세요!"
              onChange={(e) => {
                const value = e.target.value;
                setCreateMessageValidate(
                  value.length !== 0 && value.length <= 2048
                );
                setNewCreateMessage(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newCreateMessage?.length ?? -1) === 0 && '필수 입력입니다.'}
              {(newCreateMessage?.length ?? -1) > 2048 &&
                '2048자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="px-3">
        <Form.Label column sm="auto" className="fw-bold">
          티켓 초기 메시지
        </Form.Label>
        <Col>
          <Form.Group>
            <Form.Control
              type="text"
              className="shadow-sm"
              as={TextareaAutosize}
              value={newInitialMessage ?? ticketSet.initial_message}
              isInvalid={initialMessageValidate === false}
              placeholder="예) ${opener_mention} 님의 **${ticket_name}** 입니다. 문의할 내용을 입력해주세요!"
              onChange={(e) => {
                const value = e.target.value;
                setInitialMessageValidate(
                  value.length !== 0 && value.length <= 2048
                );
                setNewInitialMessage(value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {(newInitialMessage?.length ?? -1) === 0 && '필수 입력입니다.'}
              {(newInitialMessage?.length ?? -1) > 2048 &&
                '2048자 이하여야 합니다.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {!saveError && isChanged() && createMessageValidate !== false ? (
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

export default MessageSettings;
