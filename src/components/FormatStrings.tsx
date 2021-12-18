import React from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';

interface Props {
  data: Array<Array<React.ReactNode>>;
  show?: boolean;
  onHide?: Function;
}

const FormatStrings: React.FC<Props> = ({ data, show, onHide }) => (
  <Modal className="modal-dark" show={show} onHide={onHide} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title
        style={{
          fontFamily: 'NanumSquare',
          fontWeight: 900,
        }}
      >
        서식문자 목록
      </Modal.Title>
    </Modal.Header>
    <Modal.Body as={Row} className="py-4">
      {data.map(([c, d, e]) => (
        <Col key={c as string} xs={12} sm={6} className="py-2">
          <div className="fw-bold">${`{${c}}`}</div>
          <div>{d}</div>
          <div>예) {e}</div>
        </Col>
      ))}
    </Modal.Body>
    <Modal.Footer className="justify-content-end">
      <Button variant="dark" onClick={() => onHide && onHide()}>
        닫기
      </Button>
    </Modal.Footer>
  </Modal>
);

export default FormatStrings;
