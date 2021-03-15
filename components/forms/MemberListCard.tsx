import Link from 'next/link'
import React, { memo } from 'react'
import { Button, Card, Col, Row, Container, Badge } from 'react-bootstrap'
import { PartialGuildExtend } from 'types/DiscordTypes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrown } from '@fortawesome/free-solid-svg-icons'


interface UserData {
  avatar: string | null
  tag: string | null
  username: string | null
  id: string
  bot: boolean
  defaultAvatarURL: string
}

interface MemberData {
  displayName: string | null
  nickname: string | null
  user: UserData
}

interface MemberListCardProps {
  member: MemberData
  guild: PartialGuildExtend
}

const MemberListCard: React.FC<MemberListCardProps> = memo(({ member, guild }) => {

  return (
    <Card as={Container} fluid bg="dark" className="mb-2 shadow">
      <Card.Body as={Row} className="flex-column flex-sm-row py-1">
        <Col sm={8} className="d-flex pb-2 pb-sm-0 px-0 align-items-center">
          <img
            className="my-auto"
            alt={member.user.tag!}
            src={member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpeg?size=64` : member.user.defaultAvatarURL}
            style={{ width: 40, height: 40, marginRight: 15, borderRadius: '70%' }}
          />
          <div>
            <div className="d-flex">
              <span className="text-break">
                {member.displayName}
              </span>
              <span>
                {member.user.bot && <Badge className="ml-2 my-auto" variant="blurple">BOT</Badge>}
                {guild.owner === member.user.id && <FontAwesomeIcon className="ml-2" icon={faCrown} color="gold" size="sm" />}
              </span>
            </div>
            <div className="text-muted font-weight-bold text-break" style={{
              fontSize: '11pt'
            }}>
              @{member.user.tag}
            </div>
          </div>
        </Col>
        <Col sm={4} className="d-flex justify-content-sm-end align-items-center px-0">
          <Link href={`/dashboard/${guild.id}/members/${member.user.id}`}>
            <Button className="my-auto" variant="dark" size="sm">
              관리
              </Button>
          </Link>
        </Col>
      </Card.Body>
    </Card>
  )
})

export default MemberListCard