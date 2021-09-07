import { useEffect } from 'react';
import api from 'datas/api';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Container, Spinner } from 'react-bootstrap';
import Router from 'next/router';

export default function InviteJoin() {
  useEffect(() => {
    axios
      .get(`${api}/oauth2/invite_token`, {
        params: {
          code: new URLSearchParams(window.location.search).get('code'),
        },
      })
      .then((r) => {
        new Cookies().set('INVITE_TOKEN', r.data.access_token, {
          maxAge: r.data.expires_in,
        });
        Router.push(
          `/invite/${localStorage.getItem('fromInviteId')}#join`,
          undefined,
          {
            shallow: true,
          }
        );
      })
      .catch((e) => {
        console.error(e);
      });
  });

  return (
    <Container
      style={{ height: '100vh' }}
      className="d-flex align-items-center justify-content-center"
    >
      <Spinner animation="grow" variant="aztra" />
      <h3 className="text-white my-auto ml-4">로그인하고 있습니다...</h3>
    </Container>
  );
}
