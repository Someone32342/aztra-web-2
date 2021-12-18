import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MemberMinimal } from 'types/DiscordTypes';
import Link from 'next/link';

interface MemberCellProps {
  member: MemberMinimal;
  guildId: string;
  wrap?: boolean;
  link?: boolean;
}

const MemberCell: React.FC<MemberCellProps> = ({
  member,
  guildId,
  wrap = false,
  link = true,
}) => {
  let content = (ref: React.Ref<any>) => (
    <>
      <img
        ref={ref}
        className="rounded-circle no-drag"
        src={
          member.user.avatar
            ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}`
            : member.user.defaultAvatarURL
        }
        alt={member.user.tag!}
        style={{
          height: 30,
          width: 30,
        }}
      />
      <div className={wrap ? 'ms-lg-2' : 'ms-2'}>
        <span className={`${wrap ? 'd-none d-lg-block' : ''} fw-bold`}>
          {member.displayName}
        </span>
      </div>
    </>
  );

  return member !== undefined ? (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`member-${member.user.id}-tag-tooltip`}>
          @{member.user.tag}
        </Tooltip>
      }
    >
      {({ ref, ...triggerHandler }) =>
        link ? (
          <Link
            href={`/dashboard/${guildId}/members/${member.user.id}`}
            shallow
          >
            <a
              className="d-flex align-items-center text-decoration-none"
              {...triggerHandler}
            >
              {content(ref)}
            </a>
          </Link>
        ) : (
          <div
            className="d-flex align-items-center text-decoration-none"
            {...triggerHandler}
          >
            {content(ref)}
          </div>
        )
      }
    </OverlayTrigger>
  ) : (
    <span className="font-italic">(존재하지 않는 멤버)</span>
  );
};

export default MemberCell;
