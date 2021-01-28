import React from 'react'
import styles from 'styles/components/forms/RoleBadge.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

interface RoleBadgeProps extends Pick<React.CSSProperties, 'color' | 'fontSize' | 'fontFamily'> {
  className?: string
  name: string
  removeable?: boolean
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ className, name, color, fontSize, fontFamily, removeable }) => {
  return (
    <span className={`d-inline-block ${className}`}>
      <div className="d-flex pr-2 align-items-center" style={{ border: `1px solid ${color}`, borderRadius: '50px' }}>
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 16, height: 16, margin: 5, backgroundColor: color, fontSize, fontFamily }}>
          <div className={cx('X-button')}>
            <div className={cx("X-45")}>
              <div className={cx("X-90")} />
            </div>
          </div>
        </div>
        {name}
      </div>
    </span>
  )
}

export default RoleBadge