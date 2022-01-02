import { loadTossPayments } from '@tosspayments/payment-sdk';
import Layout from 'components/Layout';
import { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import numberWithCommas from 'utils/numberWithCommas';
import { CreditCard as CreditCardIcon } from '@material-ui/icons';

const clientKey = 'test_ck_4vZnjEJeQVxO9z7g9NM3PmOoBN0k';

const paymentMethods = {
  카드: (
    <div className="d-flex align-items-center">
      <CreditCardIcon className="me-2" />
      <span>신용카드/체크카드</span>
    </div>
  ),
  토스결제: (
    <div className="d-flex align-items-center">
      <img
        className="me-2"
        src="/assets/images/symbol-toss-blue.png"
        alt=""
        style={{ width: 24, height: 24 }}
      />
      <span>토스로 결제하기</span>
    </div>
  ),
  가상계좌: '무통장 입금',
  계좌이체: '계좌이체',
  휴대폰: '휴대폰 결제',
};

const PaymentPage: NextPage = () => {
  const [tossPayments, setTossPayments] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);

  useEffect(() => {
    loadTossPayments(clientKey).then((r) => setTossPayments(r));
  }, []);

  return (
    <>
      <Head>
        <title>Aztra 페이먼트</title>
      </Head>
      <Layout>
        <Container
          fluid="sm"
          style={{ minHeight: '80vh', padding: '70px 20px' }}
        >
          <Form noValidate>
            <Row>
              <h2>결제 정보</h2>
            </Row>
            <hr />
            <Row>
              <Col xs={12} lg={8} className="mb-3 mb-lg-0">
                <Card
                  bg="dark"
                  className="shadow-sm px-1"
                  style={{ borderRadius: '10px' }}
                >
                  <Card.Header className="d-flex py-3">
                    <h5
                      className="my-auto"
                      style={{ fontFamily: 'NanumSquare' }}
                    >
                      상품 정보
                    </h5>
                  </Card.Header>
                  <Card.Body className="px-4 pt-4 pb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 style={{ fontFamily: 'NanumSquare', fontSize: 18 }}>
                          Aztra Pro Monthly 플랜
                        </h5>
                        <h6 style={{ fontSize: 15 }}>4,900원/월</h6>
                      </div>
                      <div className="me-1 d-flex align-items-center">
                        <InputGroup>
                          <Button
                            variant="outline-secondary"
                            className="text-white"
                            onClick={() => setAmount(Math.max(amount - 1, 1))}
                          >
                            -
                          </Button>
                          <Form.Control
                            className="mx-1"
                            style={{ width: 50 }}
                            value={amount}
                            onChange={(e) => {
                              if (e.target.value.length > 2) {
                                setAmount(Number(e.target.value.slice(1, 3)));
                                return;
                              }
                              setAmount(
                                Math.min(Number(e.target.value) || 1, 99)
                              );
                            }}
                          />
                          <Button
                            variant="outline-secondary"
                            className="text-white"
                            onClick={() => setAmount(Math.min(amount + 1, 99))}
                          >
                            +
                          </Button>
                        </InputGroup>
                        <span className="ms-2" style={{ whiteSpace: 'nowrap' }}>
                          개 서버
                        </span>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <h5
                        className="py-1"
                        style={{ fontFamily: 'NanumSquare' }}
                      >
                        총 결제 금액:{' '}
                        <span className="fw-bold">
                          {numberWithCommas(4900 * amount)} 원
                        </span>{' '}
                        <small>/월</small>
                      </h5>
                      <small>
                        부가세{' '}
                        <b>
                          {numberWithCommas(
                            Math.floor((4900 * amount * 10) / 110)
                          )}
                          원/월
                        </b>{' '}
                        포함
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card
                  bg="dark"
                  className="shadow-sm px-0"
                  style={{ borderRadius: '10px' }}
                >
                  <Card.Header className="d-flex py-3">
                    <h5
                      className="my-auto"
                      style={{ fontFamily: 'NanumSquare' }}
                    >
                      결제 수단
                    </h5>
                  </Card.Header>
                  <Card.Body className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      <small className="flex-shrink-0 me-2">
                        결제수단 선택
                      </small>
                      <hr className="w-100" />
                    </div>
                    <Dropdown
                      className="mt-2"
                      onSelect={(eventKey) =>
                        setPaymentMethod(eventKey == '0' ? null : eventKey)
                      }
                    >
                      <Dropdown.Toggle
                        variant="dark"
                        className="w-100 d-flex justify-content-between align-items-center border-gray"
                      >
                        {paymentMethod
                          ? (paymentMethods as any)[paymentMethod]
                          : '결제수단 선택'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu variant="dark" className="w-100">
                        <Dropdown.Item key="0" eventKey="0" className="py-2">
                          결제수단 선택
                        </Dropdown.Item>
                        {Object.entries(paymentMethods).map(([key, value]) => (
                          <Dropdown.Item
                            key={key}
                            eventKey={key}
                            active={paymentMethod === key}
                            className="py-2"
                          >
                            {value}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <hr />

                    <Button
                      variant="aztra"
                      className="w-100"
                      disabled={!paymentMethod}
                      onClick={() => {
                        tossPayments.requestPayment(paymentMethod, {
                          amount: 4900,
                          orderId: 'yy8oFARUK-AtW6tr63D_O',
                          orderName: 'Aztra Premium Pro 플랜 (1개월)',
                          customerName: 'ArpaAP#1234',
                          successUrl: 'http://localhost:8080/success',
                          failUrl: 'http://localhost:8080/fail',
                        });
                      }}
                    >
                      결제하기
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </Container>
      </Layout>
    </>
  );
};

export default PaymentPage;
