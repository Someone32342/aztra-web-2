import React from 'react';
import styles from 'styles/components/forms/RoleBadge.module.scss';
import classNames from 'classnames/bind';
import { Add } from '@mui/icons-material';

const cx = classNames.bind(styles);

interface RoleBadgeProps
  extends Pick<React.CSSProperties, 'color' | 'fontSize' | 'fontFamily'> {
  className?: string;
  name: string;
  removeable?: boolean;
  onRemove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  width?: number;
  height?: number;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  className,
  name,
  color,
  fontSize,
  fontFamily,
  removeable,
  onRemove,
  width,
  height,
}) => {
  return (
    <span className={`d-inline-block mw-100 ${className}`}>
      <div
        className="d-flex pe-2 align-items-center"
        style={{
          border: `1px solid ${color}`,
          borderRadius: '50px',
          minWidth: 0,
        }}
      >
        <div
          className={cx(
            'rounded-circle',
            'd-flex',
            'align-items-center',
            'justify-content-center',
            'X-circle'
          )}
          onClick={removeable ? onRemove : undefined}
          style={{
            width: width ?? 16,
            height: height ?? 16,
            margin: 5,
            flexShrink: 0,
            backgroundColor: color,
            fontSize,
            fontFamily,
          }}
        >
          {removeable && (
            <div className={cx('X-button')}>
              <div className={cx('X-45')}>
                <div className={cx('X-90')} />
              </div>
            </div>
          )}
        </div>
        <span
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            fontSize,
          }}
        >
          {name}
        </span>
      </div>
    </span>
  );
};

interface AddRoleProps {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  width?: number;
  height?: number;
}

export const AddRole = React.forwardRef<any, AddRoleProps>(
  ({ className, onClick, width, height }, ref) => {
    return (
      <span
        className={`d-inline-block cursor-pointer ${className}`}
        onClick={onClick}
        ref={ref}
      >
        <div
          className="d-flex align-items-center"
          style={{ border: `1px solid gray`, borderRadius: '50px' }}
        >
          <div
            className={cx(
              'd-flex',
              'align-items-center',
              'justify-content-center'
            )}
            style={{ width: width ?? 16, height: height ?? 16, margin: 5 }}
          >
            <Add fontSize="small" htmlColor="gray" />
          </div>
        </div>
      </span>
    );
  }
);

AddRole.displayName = 'AddRole';

export default RoleBadge;
