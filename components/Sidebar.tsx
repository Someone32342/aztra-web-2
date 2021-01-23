import React, { useEffect, useState } from 'react'
import { Badge, Nav } from 'react-bootstrap'
import { PartialGuild } from 'types/DiscordTypes'
import {
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  ReportProblemRounded as ReportProblemRoundedIcon,
  DataUsage as DataUsageIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@material-ui/icons'
import Link from 'next/link'

interface SidebarProps {
  guild: PartialGuild
  onSelect?: (eventKey: string | null, e: React.SyntheticEvent<unknown>) => void
}

export default function Sidebar(props: SidebarProps) {
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    setLocation(window.location)
  }, [])

  const iconStyle: React.CSSProperties = {
    height: 20,
    width: 20,
  }

  const guild = props.guild
  return (
    <>
      <Nav
        id="dashboard-sidebar"
        className="col-md-12 d-block d-md-block"
        style={{
          paddingRight: 0
        }}
        onSelect={props.onSelect}
      >
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}`}
              active={location?.pathname === `/dashboard/${guild?.id}`}
            >
              <div style={iconStyle} className="mr-3">
                <HomeIcon />
              </div>
              메인
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}/greetings`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}/greetings`}
              active={location?.pathname.startsWith(`/dashboard/${guild?.id}/greetings`)}
            >
              <div style={iconStyle} className="mr-3">
                <PersonAddIcon />
              </div>
              환영 메시지
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}/members`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}/members`}
              active={location?.pathname.startsWith(`/dashboard/${guild?.id}/members`)}
            >
              <div style={iconStyle} className="mr-3">
                <GroupIcon />
              </div>
              멤버 관리
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}/warns`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}/warns`}
              active={location?.pathname.startsWith(`/dashboard/${guild?.id}/warns`)}
            >
              <div style={iconStyle} className="mr-3">
                <ReportProblemRoundedIcon />
              </div>
              경고 관리
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}/leveling`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}/leveling`}
              active={location?.pathname.startsWith(`/dashboard/${guild?.id}/leveling`)}
            >
              <div style={iconStyle} className="mr-3">
                <DataUsageIcon />
              </div>
              레벨링 설정
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guild?.id}/logging`} shallow={true}>
            <Nav.Link
              className="d-flex mb-1"
              href={`/dashboard/${guild?.id}/logging`}
              active={location?.pathname.startsWith(`/dashboard/${guild?.id}/logging`)}
            >
              <div style={iconStyle} className="mr-3">
                <HistoryIcon style={{ transform: 'scale(1.1)' }} />
              </div>
              로깅 설정
              <Badge variant="aztra" className="ml-2 my-auto" style={{ fontSize: 14 }}>베타</Badge>
            </Nav.Link>
          </Link>
        </Nav.Item>
        {
          process.env.NODE_ENV === "development" && (
            <Nav.Item>
              <Link href={`/dashboard/${guild?.id}/statistics`} shallow={true}>
                <Nav.Link
                  className="d-flex mb-1"
                  href={`/dashboard/${guild?.id}/statistics`}
                  active={location?.pathname.startsWith(`/dashboard/${guild?.id}/statistics`)}
                >
                  <div style={iconStyle} className="mr-3">
                    <TrendingUpIcon style={{ transform: 'scale(1.1)' }} />
                  </div>
                  통계
                </Nav.Link>
              </Link>
            </Nav.Item>
          )
        }
      </Nav>
    </>
  )

}
