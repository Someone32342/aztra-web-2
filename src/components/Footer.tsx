import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import links from 'datas/links';

import styles from 'styles/components/Footer.module.scss';
import classNames from 'classnames/bind';
import Link from 'next/link';

const cx = classNames.bind(styles);

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <Container fluid="sm" className="text-center text-md-start">
        <Row>
          <Col md={5} className="mt-md-0 mt-3">
            <h4 className="text-uppercase no-drag">
              Aztra {process.env.NODE_ENV === 'development' && 'Beta'}
            </h4>
            <p
              className="mb-2"
              style={{
                fontSize: '13pt',
              }}
            >
              미래를 바꿀 디스코드 관리봇.
            </p>
          </Col>
          <Col md={2}>
            <h5>사이트</h5>
            <ul className="list-unstyled">
              <li>
                <Link href="/">홈</Link>
              </li>
              <li>
                <Link href="/servers">대시보드</Link>
              </li>
              <li>
                <Link href="/partners">파트너 서버</Link>
              </li>
            </ul>
          </Col>
          <Col md={2}>
            <h5>팀</h5>
            <ul className="list-unstyled">
              <li>
                <a href={links.teamsite}>팀 홈페이지</a>
              </li>
              <li>
                <a href={links.support}>디스코드 서포트 서버</a>
              </li>
            </ul>
          </Col>
          <Col md={2}>
            <h5>가이드</h5>
            <ul className="list-unstyled">
              <li>
                <a href={links.privacy}>개인정보 처리방침</a>
              </li>
              <li>
                <Link href="/tos">이용약관</Link>
              </li>
              <li>
                <Link href="/docs">봇 가이드</Link>
              </li>
            </ul>
          </Col>
        </Row>
        <div className={cx('FooterCopyright', 'text-center')}>
          Copyright © 2020-2022 InfiniteTeam All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
