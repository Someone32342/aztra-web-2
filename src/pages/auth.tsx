import { useEffect } from 'react';
import api from 'datas/api';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'universal-cookie';
import { Container, Spinner } from 'react-bootstrap';

export default function Auth() {
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${api}/oauth2/token`, {
        params: {
          code: new URLSearchParams(window.location.search).get('code'),
        },
      })
      .then((r) => {
        new Cookies().set('ACCESS_TOKEN', r.data.access_token, {
          maxAge: r.data.expires_in,
        });
        router.push(localStorage.getItem('loginFrom') || '/');
      })
      .catch((e) => {
        console.error(e);
      });
  }, [router]);

  return (
    <Container
      style={{ height: '100vh' }}
      className="d-flex align-items-center justify-content-center"
    >
      <Spinner animation="grow" variant="aztra" />
      <h3 className="text-white my-auto ms-4">로그인하고 있습니다...</h3>
    </Container>
  );
}
