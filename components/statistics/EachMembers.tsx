import React from 'react'
import { Badge, Card, Col, Container, Row } from 'react-bootstrap'
import { MemberMinimal } from 'types/DiscordTypes'

interface EachMembersProps {
  members: MemberMinimal[]
}

const EachMembers: React.FC<EachMembersProps> = ({ members }) => {
  return <Container fluid>
    <Row>
      <Col xs={12} lg={6} xl={4} style={{ maxHeight: 600, overflowY: 'scroll' }}>
        {
          members.map(one =>
            <Card as={Container} fluid bg="dark" className="mb-2 shadow cursor-pointer">
              <Card.Body className="d-flex py-1 px-0">
                <img
                  className="my-auto"
                  alt={one.user.tag!}
                  src={one.user.avatar ? `https://cdn.discordapp.com/avatars/${one.user.id}/${one.user.avatar}.jpeg?size=64` : one.user.defaultAvatarURL}
                  style={{ width: 40, height: 40, marginRight: 15, borderRadius: '70%' }}
                />
                <div>
                  <div className="d-flex">
                    <span className="text-break">
                      {one.displayName}
                    </span>
                    <span>
                      {one.user.bot && <Badge className="ml-2 my-auto" variant="blurple">BOT</Badge>}
                    </span>
                  </div>
                  <div className="text-muted font-weight-bold text-break" style={{
                    fontSize: '11pt'
                  }}>
                    @{one.user.tag}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )
        }
      </Col>
      <Col xs={12} lg={6} xl={8}>
        <div>
          멤버가
        </div>
      </Col>
    </Row>
  </Container>
}

export default EachMembers