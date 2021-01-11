import React from 'react'
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap'
import axios from 'axios'
import oauth2 from '../datas/oauth'
import urljoin from 'url-join'
import { User } from '../types/DiscordTypes'
import Link from 'next/link'
import classNames from 'classnames/bind'
import styles from '../styles/components/Navibar.module.scss'

import MenuIcon from '@material-ui/icons/Menu';

import Cookies from 'universal-cookie'
import Router from 'next/router'

const cx = classNames.bind(styles)

interface NavibarState {
  user?: User | null
  expanded: boolean
}

export default class Navibar extends React.Component<{}, NavibarState> {
  state: NavibarState = {
    expanded: false,
  }

  handleOnToggle = (expanded: boolean) => {
    this.setState({ expanded })
  }

  closeNavbar = () => {
    this.setState({ expanded: false })
  }

  handleLogout = () => {
    new Cookies().remove('ACCESS_TOKEN')
    Router.reload()
  }

  fetchUser = async (token: string) => {
    try {
      let res = await axios.get(urljoin(oauth2.api_endpoint, '/users/@me'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.setState({ user: res.data })
      localStorage.setItem('cached_user', JSON.stringify(res.data))
    }
    catch (_e) {
      this.setState({ user: null })
      localStorage.removeItem('cached_user')
    }
  }

  componentDidMount() {
    const userCache = localStorage.getItem('cached_user')
    this.setState({ user: userCache ? JSON.parse(userCache) : null })
    const token = new Cookies().get('ACCESS_TOKEN')
    !token || this.fetchUser(token)
  }

  render() {
    const { user } = this.state

    return (
      <div style={{ paddingBottom: 57 }}>
        <Navbar bg="dark" expand="md" onToggle={this.handleOnToggle} expanded={this.state.expanded} fixed="top" className={cx("no-drag", "navbar-dark", "NavbarDark")}>
          <Container fluid="md">
            <Link href="/">
              <Navbar.Brand href="/" className="d-flex align-items-center pr-1">
                <img src="/assets/images/aztra-withoutbg-white.png" style={{
                  height: 27,
                }} />
              </Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="navbar-nav" className={styles.NavbarToggle}>
              <MenuIcon style={{ fontSize: '20pt' }} />
            </Navbar.Toggle>
            <Navbar.Collapse id="navbar-nav">
              <Nav className="mr-auto" onSelect={this.closeNavbar}>
                <Link href="/">
                  <Nav.Link href="/" className={styles.Navlink}>
                    홈
                  </Nav.Link>
                </Link>
                <Link href="/servers" shallow>
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
                        <NavDropdown id="nav-dropdown" className="dropdown-menu-dark NavDropdown" title={
                          <>
                            <span style={{
                              fontSize: '12.5pt',
                              fontFamily: 'NanumSquare',
                              color: 'whitesmoke'
                            }}>
                              {user.username}
                            </span>
                            <span style={{
                              fontSize: '10.5pt',
                              fontFamily: 'NanumSquare',
                              color: '#9f9f9f'
                            }}>
                              #{user.discriminator}
                            </span>
                          </>
                        } >
                          <NavDropdown.Item className="dropdown-item-dark" onClick={this.handleLogout}>
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
