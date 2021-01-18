import React from 'react'
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap'
import axios from 'axios'
import oauth2 from 'datas/oauth'
import urljoin from 'url-join'
import { User } from 'types/DiscordTypes'
import Link from 'next/link'
import classNames from 'classnames/bind'
import styles from 'styles/components/Navibar.module.scss'

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

  mounted: boolean = false

  handleOnToggle = (expanded: boolean) => {
    this.setState({ expanded })
  }

  closeNavbar = () => {
    this.setState({ expanded: false })
  }

  handleLogin = () => {
    const lct = window.location
    localStorage.setItem('loginFrom', lct.pathname + lct.search)
    Router.push('/login')
  }

  handleLogout = () => {
    new Cookies().remove('ACCESS_TOKEN')
    if (Router.pathname == '/') {
      Router.reload()
    }
    else {
      Router.push('/')
    }
  }

  fetchUser = async (token: string) => {
    try {
      let res = await axios.get(urljoin(oauth2.api_endpoint, '/users/@me'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (this.mounted) {
        this.setState({ user: res.data })
        localStorage.setItem('cached_user', JSON.stringify(res.data))
      }
    }
    catch (_e) {
      if (this.mounted) {
        this.setState({ user: null })
        localStorage.removeItem('cached_user')
      }
    }
  }

  componentDidMount() {
    this.mounted = true
    const token = new Cookies().get('ACCESS_TOKEN')
    const cachedUser = localStorage.getItem('cached_user')
    if (token) {
      this.setState({ user: cachedUser ? JSON.parse(cachedUser) : null })
      this.fetchUser(token)
    }
    else {
      localStorage.removeItem('cached_user')
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { user } = this.state

    return (
      <div className={cx("NavbarMargin")}>
        <Navbar bg="dark" expand="md" onToggle={this.handleOnToggle} expanded={this.state.expanded} fixed="top" className={cx("no-drag", "navbar-dark", "shadow", "NavbarDark")}>
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
                      <div className="d-flex align-items-center">
                        <img
                          className="rounded-circle overflow-hidden"
                          alt={user.username}
                          src={
                            user.avatar
                              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
                              : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
                          }
                          style={{ maxHeight: 30 }}
                        />
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
                    : <Nav.Link onClick={this.handleLogin}>로그인</Nav.Link>
                }
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}
