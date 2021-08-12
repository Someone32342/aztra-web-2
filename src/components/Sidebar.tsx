import React, { useEffect, useState } from 'react';
import { Badge, Nav } from 'react-bootstrap';
import {
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  ReportProblemRounded as ReportProblemRoundedIcon,
  DataUsage as DataUsageIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon,
  List as ListIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from '@material-ui/icons';
import Link from 'next/link';

interface SidebarProps {
  guildId: string;
  onSelect?: (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ guildId, onSelect }) => {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    setLocation(window.location);
  }, []);

  const iconStyle: React.CSSProperties = {
    height: 20,
    width: 20,
  };

  return (
    <>
      <Nav
        id="dashboard-sidebar"
        className="col-md-12 d-block d-md-block"
        style={{
          paddingRight: 0,
        }}
        onSelect={onSelect}
      >
        <Nav.Item>
          <Link href={`/dashboard/${guildId}`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname === `/dashboard/${guildId}`}
            >
              <div style={iconStyle} className="mr-3">
                <HomeIcon />
              </div>
              메인
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/general`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/general`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <SettingsIcon />
              </div>
              일반 설정
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            href={`/dashboard/${guildId}/greetings`}
            shallow={true}
            passHref
          >
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/greetings`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <PersonAddIcon />
              </div>
              환영 메시지
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/members`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/members`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <GroupIcon />
              </div>
              멤버 관리
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/warns`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/warns`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <ReportProblemRoundedIcon />
              </div>
              경고 관리
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/leveling`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/leveling`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <DataUsageIcon />
              </div>
              레벨링 설정
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/logging`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/logging`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <HistoryIcon style={{ transform: 'scale(1.1)' }} />
              </div>
              로깅 설정
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            href={`/dashboard/${guildId}/autotasking`}
            shallow={true}
            passHref
          >
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/autotasking`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <EventNoteIcon style={{ transform: 'scale(1.1)' }} />
              </div>
              <div>자동 작업</div>
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link
            href={`/dashboard/${guildId}/statistics`}
            shallow={true}
            passHref
          >
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/statistics`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <TrendingUpIcon style={{ transform: 'scale(1.1)' }} />
              </div>
              <div>통계</div>
            </Nav.Link>
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href={`/dashboard/${guildId}/tickets`} shallow={true} passHref>
            <Nav.Link
              className="d-flex mb-1"
              active={location?.pathname.startsWith(
                `/dashboard/${guildId}/tickets`
              )}
            >
              <div style={iconStyle} className="mr-3">
                <CreditCardIcon style={{ transform: 'scale(1.1)' }} />
              </div>
              <div>티켓 설정</div>
            </Nav.Link>
          </Link>
        </Nav.Item>
        {process.env.NODE_ENV === 'development' && (
          <>
            <Nav.Item>
              <Link
                href={`/dashboard/${guildId}/security`}
                shallow={true}
                passHref
              >
                <Nav.Link
                  className="d-flex mb-1"
                  active={location?.pathname.startsWith(
                    `/dashboard/${guildId}/security`
                  )}
                >
                  <div style={iconStyle} className="mr-3">
                    <SecurityIcon style={{ transform: 'scale(1.1)' }} />
                  </div>
                  <div>
                    보안 설정
                    <Badge
                      variant="danger"
                      className="ml-2 my-auto"
                      style={{ fontSize: 14 }}
                    >
                      개발중
                    </Badge>
                  </div>
                </Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                href={`/dashboard/${guildId}/billboards`}
                shallow={true}
                passHref
              >
                <Nav.Link
                  className="d-flex mb-1"
                  active={location?.pathname.startsWith(
                    `/dashboard/${guildId}/billboards`
                  )}
                >
                  <div style={iconStyle} className="mr-3">
                    <ListIcon style={{ transform: 'scale(1.1)' }} />
                  </div>
                  <div>
                    전광판 채널
                    <Badge
                      variant="danger"
                      className="ml-2 my-auto"
                      style={{ fontSize: 14 }}
                    >
                      개발중
                    </Badge>
                  </div>
                </Nav.Link>
              </Link>
            </Nav.Item>
          </>
        )}
      </Nav>
    </>
  );
};

export default Sidebar;
