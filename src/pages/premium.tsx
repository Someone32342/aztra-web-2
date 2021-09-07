import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Favorite as FavoriteIcon } from '@material-ui/icons';
import { NextPage } from 'next';
import Layout from 'components/Layout';
import LINKS from 'datas/links';

interface FeaturesListProps {
  feats: string[];
}

function FeaturesList(props: FeaturesListProps) {
  return (
    <>
      {props.feats.map((feat, i) => (
        <div key={i} className="d-flex align-items-center mb-2">
          <FontAwesomeIcon icon={faCheckCircle} color="lime" className="mr-2" />
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
        className="text-light"
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
              <Card bg="dark" className="h-100 shadow">
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
              <Card
                bg="dark"
                className="h-100 shadow"
                onMouseOver={() => console.log('dsdsdsdss')}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 'bold',
                    fontSize: '14pt',
                  }}
                >
                  Aztra Free+ 플랜
                </Card.Header>
                <Card.Body className="pt-5 px-4">
                  <h3 className="pb-4 text-center">무료</h3>
                  <div className="text-center mb-4">
                    Koreanbots 봇 리스트에서
                    <br />
                    Aztra에 하트를 눌러주세요!
                  </div>
                  <FeaturesList feats={['혜택 준비 중입니다.']} />
                </Card.Body>
                <div className="text-center pb-2">
                  <Button
                    className="my-2"
                    variant="danger"
                    disabled
                    style={{
                      minWidth: '60%',
                    }}
                    href={LINKS.koreanbots}
                    target="_blank"
                  >
                    <div className="d-flex justify-content-center align-items-center">
                      <FavoriteIcon className="mr-2" fontSize="small" />
                      하트 누르고 혜택 받기
                    </div>
                  </Button>
                </div>
              </Card>
            </Col>

            <Col sm={4} className="mb-4">
              <Card bg="dark" className="h-100 shadow">
                <Card.Header
                  className="text-center"
                  style={{
                    fontFamily: 'NanumSquare',
                    fontWeight: 'bold',
                    fontSize: '14pt',
                  }}
                >
                  Aztra Pro 플랜
                </Card.Header>
                <Card.Body className="pt-5 px-4">
                  <h3 className="pb-4 text-center">￦2,900/월</h3>
                  <FeaturesList feats={['혜택 준비 중입니다.']} />
                </Card.Body>
                <div className="text-center pb-2">
                  <Button
                    className="my-2"
                    variant="aztra"
                    disabled
                    style={{
                      minWidth: '60%',
                    }}
                  >
                    구매하기
                  </Button>
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
