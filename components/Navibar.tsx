import React from 'react'
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap'
import axios from 'axios'
import oauth2 from '../datas/oauth'
import urljoin from 'url-join'
import { User } from '../types/DiscordTypes'
import Link from 'next/link'

import styles from '../styles/components/Navibar.module.scss'
import { GetServerSideProps } from 'next'

interface NavibarProps {
  user?: User | null
}

interface NavibarState {
  expanded: boolean,
}

export const getServerSideProps: GetServerSideProps<Partial<NavibarProps>> = async context => {
  let user = null

  try {
    let res = await axios.get(urljoin(oauth2.api_endpoint, '/users/@me'), {
      headers: { cookie: context.req.headers.cookie }
    })
    user = res.data
  }
  finally {
    return {
      props: { user }
    }
  }
}

export default class Navibar extends React.Component<NavibarProps, NavibarState> {
  state: NavibarState = {
    expanded: false,
  }

  handleOnToggle = (expanded: boolean) => {
    this.setState({ expanded })
  }

  closeNavbar = () => {
    this.setState({ expanded: false })
    console.log('dsds')
  }

  render() {
    const user = this.props.user
    return (
      <div style={{ paddingBottom: 57 }}>
        <Navbar bg="dark" expand="md" onToggle={this.handleOnToggle} expanded={this.state.expanded} fixed="top" className="no-drag navbar-dark shadow">
          <Container fluid="md">
            <Link href="/">
              <Navbar.Brand href="/" style={{
                fontFamily: 'NanumSquare',
                fontWeight: 600
              }}>
                {process.env.NODE_ENV === "production" ? 'Aztra' : 'Aztra βeta'}
              </Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
              <Nav className="mr-auto" onSelect={this.closeNavbar}>
                <Link href="/">
                  <Nav.Link href="/" className={styles.Navlink}>
                    홈
                  </Nav.Link>
                </Link>
                <Link href="/servers">
                  <Nav.Link href="/servers" className={styles.Navlink}>
                    대시보드
                  </Nav.Link>
                </Link>
                <Link href="/docs">
                  <Nav.Link href="/docs" className={styles.Navlink}>
                    봇 가이드
                  </Nav.Link>
                </Link>
              </Nav>
              <Nav>
                {
                  user
                    ?
                    <>
                      <div style={{
                        justifyContent: 'left',
                        display: 'flex'
                      }}>
                        <img alt={user.username} src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}` : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`} style={{
                          maxHeight: 32,
                          borderRadius: '700%',
                          overflow: 'hidden',
                          marginRight: 5,
                          marginTop: 5
                        }} />
                        <NavDropdown title={`${user.username}#${user.discriminator}`} id="nav-dropdown" className="dropdown-menu-dark" style={{
                          fontSize: '12.5pt'
                        }}>

                          <NavDropdown.Item className="dropdown-item-dark" href="/logout">
                            로그아웃
                            </NavDropdown.Item>
                        </NavDropdown>
                      </div>
                    </>
                    : <Nav.Link href="/login">로그인</Nav.Link>
                }
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}
