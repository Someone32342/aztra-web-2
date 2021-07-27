import React from 'react'
import { Nav, Navbar, NavDropdown, Container, OverlayTrigger, Tooltip } from 'react-bootstrap'
import axios from 'axios'
import oauth2 from 'datas/oauth'
import urljoin from 'url-join'
import { User } from 'types/DiscordTypes'
import Link from 'next/link'
import classNames from 'classnames/bind'
import styles from 'styles/components/Navibar.module.scss'
import links from 'datas/links'

import MenuIcon from '@material-ui/icons/Menu';

import Cookies from 'universal-cookie'
import Router from 'next/router'
import { NewReleases as NewReleasesIcon } from '@material-ui/icons'

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
      this.setState({ user: null })
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
          <Container fluid className={styles.NavContainer}>
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
                <Link href="/partners">
                  <Nav.Link href="/partners" className={styles.Navlink}>
                    <div className="d-flex">
                      파트너 서버
                      <div className="ml-2 mt-1 rounded-circle" style={{ width: 5, height: 5, backgroundColor: '#A566FF' }} />
                    </div>
                  </Nav.Link>
                </Link>
                <NavDropdown title="지원 및 문의" id="navdropdown-support" className={cx("dropdown-menu-dark", "Navlink", "NavDropdownWhiteTitle")}>
                  <NavDropdown.Item className="dropdown-item-dark pl-3" href={links.support} target="_blank">
                    <img src="/assets/images/discord-logo-white.png" className="mr-2" style={{ width: 25, height: 25 }} />
                    디스코드 서포트 서버
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav>
                {
                  user
                    ?
                    <>
                      <NavDropdown id="nav-dropdown" className="dropdown-menu-dark" title={
                        <>
                          <img
                            className="rounded-circle overflow-hidden mr-2"
                            alt={user.username}
                            src={
                              user.avatar
                                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
                                : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
                            }
                            style={{ maxHeight: 30 }}
                          />
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
