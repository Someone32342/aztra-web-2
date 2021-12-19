import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons';
import Link from 'next/link';
import Layout from 'components/Layout';
import Head from 'next/head';

interface DocsCardProps {
  className?: string;
  title: string;
  description: string;
  icon: string;
}

const DocsCard: React.FC<DocsCardProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <Card
      className={`shadow-sm cursor-pointer text-dark text-decoration-none ${className} p-1`}
      style={{
        border: 'none',
      }}
    >
      <Card.Body className="d-flex">
        <img
          alt=""
          className="rounded-circle me-3"
          src={icon}
          style={{ width: 35, height: 35 }}
        />
        <div>
          <Card.Title className="fw-bold">{title}</Card.Title>
          <Card.Text style={{ fontSize: 15 }}>{description}</Card.Text>
        </div>
        <div
          className="my-auto ms-auto ps-2"
          style={{ transform: 'scale(1.5)' }}
        >
          <ArrowForwardIcon />
        </div>
      </Card.Body>
    </Card>
  );
};

const DocsMain: React.FC = () => {
  return (
    <>
      <Head>
        <title>봇 가이드 - Aztra</title>
      </Head>
      <Layout>
        <Container
          fluid
          style={{
            backgroundColor: 'rgb(242, 242, 245)',
          }}
        >
          <Container fluid="sm" className="py-5" style={{ minHeight: '100vh' }}>
            <Row
              className="justify-content-center"
              style={{ padding: '40px 0' }}
            >
              <Col>
                <div className="text-center">
                  <h2>Aztra 봇 가이드</h2>
                  <div style={{ wordBreak: 'keep-all' }}>
                    Aztra를 더 똑똑하게 사용하는 방법들을 살펴보세요.
                  </div>
                </div>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6} lg={4} className="d-flex">
                <Link
                  href="/docs/aztra-commands-guide/getting-started"
                  shallow
                  passHref
                >
                  <a className="d-flex w-100">
                    <DocsCard
                      title="Aztra 명령어 가이드"
                      description="Aztra 전체 명령어 가이드"
                      icon="/assets/docs/aztra-command-guide/icon.png"
                      className="w-100"
                    />
                  </a>
                </Link>
              </Col>
              {process.env.NODE_ENV === 'development' && (
                <Col xs={12} md={6} lg={4} className="d-flex">
                  <Link href="/docs/ticket-guide/add-ticket" shallow passHref>
                    <a className="d-flex w-100">
                      <DocsCard
                        title="티켓 설정 가이드"
                        description="티켓 기능 설정이 어려우신가요? 차근차근 알려드립니다."
                        icon="/assets/docs/aztra-command-guide/icon.png"
                        className="w-100"
                      />
                    </a>
                  </Link>
                </Col>
              )}
            </Row>

            <Row className="text-center" style={{ marginTop: 120 }}>
              <small>가독성 향상을 위해 화이트 모드가 적용됩니다.</small>
            </Row>
          </Container>
        </Container>
      </Layout>
    </>
  );
};

export default DocsMain;
