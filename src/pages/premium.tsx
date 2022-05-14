import React from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { NextPage } from 'next';
import Layout from 'components/Layout';
import LINKS from 'datas/links';
import Link from 'next/link';

interface FeaturesListProps {
  feats: string[];
}

function FeaturesList(props: FeaturesListProps) {
  return (
    <>
      {props.feats.map((feat, i) => (
        <div key={i} className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={faCheckCircle} color="lime" className="me-2" />
          <div>{feat}</div>
        </div>
      ))}
    </>
  );
}

const Premium: NextPage = () => {
  return (
    <Layout>
      <Container
        fluid="sm"
        className="text-light px-5"
        style={{
          paddingTop: 60,
          paddingBottom: 100,
        }}
      >
        <h4
          className="pb-5"
          style={{
            fontFamily: 'NanumSquare',
          }}
        >
          Aztra 프리미엄으로, 서버를 더욱 풍요롭게.
        </h4>
        <Container>
          <Row>
            <Col sm={4} className="mb-4">
              <Card bg="dark" className="h-100 shadow mx-2">
                <Card.Header
                  className="text-center"
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 'bold',
                    fontSize: '14pt',
                  }}
                >
                  Aztra Free 플랜
                </Card.Header>
                <Card.Body className="pt-5 px-4">
                  <h3 className="pb-4 text-center">기본</h3>
                  <FeaturesList
                    feats={[
                      '환영 메시지',
                      '경고 관리',
                      '레벨링',
                      '로깅 기능',
                      '자동 작업',
                      '서버 통계',
                      '티켓 기능',
                      '서버 초대 보안',
                    ]}
                  />
                </Card.Body>
                <div className="text-center pb-2">
                  <Button
                    className="my-2"
                    variant="dark"
                    disabled
                    style={{
                      minWidth: '60%',
                    }}
                  >
                    사용 중
                  </Button>
                </div>
              </Card>
            </Col>

            <Col sm={4} className="mb-4">
              <Card bg="dark" className="h-100 shadow mx-2">
                <Card.Header
                  className="text-center"
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 'bold',
                    fontSize: '14pt',
                  }}
                >
                  Aztra Pro Monthly 플랜
                </Card.Header>
                <Card.Body className="pt-5 px-4">
                  <h3 className="pb-4 text-center">￦4,900/월</h3>
                  <FeaturesList
                    feats={['혜택 준비 중입니다. 아직 구매할 수 없습니다.']}
                  />
                </Card.Body>
                <div className="text-center pb-2">
                  <Link href="/payments/aztra-pro-monthly" passHref>
                    <Button
                      className="my-2"
                      variant="aztra"
                      style={{
                        minWidth: '60%',
                      }}
                      disabled={process.env.NODE_ENV === 'production'}
                    >
                      구매하기
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>

            <Col sm={4} className="mb-4">
              <Card bg="dark" className="h-100 shadow mx-2">
                <Card.Header
                  className="text-center"
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 'bold',
                    fontSize: '14pt',
                  }}
                >
                  Aztra Pro Yearly 플랜
                </Card.Header>
                <Card.Body className="pt-5 px-4">
                  <h3 className="pb-2 text-center">￦49,980/년</h3>
                  <span className="d-flex w-100 mb-3">
                    <Badge bg="aztra" className="h5 mx-auto">
                      <b>-15%</b> 할인
                    </Badge>
                  </span>
                  <FeaturesList
                    feats={['혜택 준비 중입니다. 아직 구매할 수 없습니다.']}
                  />
                </Card.Body>
                <div className="text-center pb-2">
                  <Link href="/payments/aztra-pro-yearly" passHref>
                    <Button
                      className="my-2"
                      variant="aztra"
                      style={{
                        minWidth: '60%',
                      }}
                      disabled={process.env.NODE_ENV === 'production'}
                    >
                      구매하기
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </Layout>
  );
};

export default Premium;
