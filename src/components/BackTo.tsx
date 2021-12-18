import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

import cx from 'classnames';

interface BackToProps {
  name: string;
  to: string;
  className?: string;
}

export default function BackTo({ name, to, className }: BackToProps) {
  return (
    <Link href={to} shallow passHref>
      <div
        className={cx(
          'd-flex',
          'align-items-center',
          'cursor-pointer',
          className?.split(' ')
        )}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
        <b className="pe-2">[{name}]</b>(으)로 돌아가기
      </div>
    </Link>
  );
}
