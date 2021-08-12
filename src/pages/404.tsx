import Head from 'next/head';
import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import Layout from '../components/Layout';

export default class NotFound extends Component {
  render() {
    return (
      <>
        <Head>
          <title>Aztra - 404</title>
        </Head>
        <Layout>
          <Container
            fluid
            className="text-center no-drag"
            style={{
              paddingTop: 250,
            }}
          >
            <h1
              style={{
                fontFamily: 'NanumSquare',
                fontSize: '60pt',
                color: 'white',
              }}
            >
              404
            </h1>
            <h3
              style={{
                fontFamily: 'NanumSquare',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: 400,
              }}
            >
              존재하지 않는 페이지입니다!
            </h3>
          </Container>
        </Layout>
      </>
    );
  }
}
