import Layout from 'components/Layout';
import { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';

const PaymentPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Aztra 페이먼트 - 결제 완료!</title>
      </Head>
      <Layout>
        <Container
          fluid="sm"
          style={{ minHeight: '80vh', padding: '70px 20px' }}
        >
          <Form noValidate>
            <Row>
              <h2>결제가 완료되었습니다!</h2>
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
                          Aztra Premium Pro 플랜 (1개월)
                        </h5>
                        <h6 style={{ fontSize: 15 }}>4,900원</h6>
                      </div>
                      <div className="me-1 d-flex align-items-center">
                        <span className="ms-2">1개</span>
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <h5
                        className="py-1"
                        style={{ fontFamily: 'NanumSquare' }}
                      >
                        총 결제 금액: <span className="fw-bold">4,900 원</span>
                      </h5>
                      <small>
                        부가세 <b>495원 </b> 포함
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
                      <small className="flex-shrink-0 me-2">결제수단</small>
                      <hr className="w-100" />
                    </div>
                    신용카드 - 카카오뱅크
                    <hr />
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
