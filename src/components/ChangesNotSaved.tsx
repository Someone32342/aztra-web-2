import React from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';

import styles from 'styles/components/ChangeNotSaved.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface ChangeNotSavedProps {
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  isSaveError?: boolean;
  close?: boolean;
}

const ChangesNotSaved: React.FC<ChangeNotSavedProps> = ({
  onSave,
  onReset,
  isSaving = false,
  isSaveError = false,
  close = false,
}) => {
  const sidebarWidth =
    document.getElementById('dashboard-sidebar')?.offsetWidth || 0;

  return (
    <div
      className={cx('px-4', close ? 'floatDownCard' : 'floatCard')}
      style={{
        position: 'fixed',
        zIndex: 9999,
        margin: '0 auto',
        left: sidebarWidth + (window.innerWidth < 576 ? 0 : 40),
        right: 0,
        width: `100%-${sidebarWidth}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        style={{
          maxWidth: 1200,
          width: '100%',
          boxShadow: '0 0 5px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(127, 70, 202, 0.65)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Card.Body className="py-2 my-0 d-flex px-2">
          <div
            className="my-auto ps-2"
            style={{
              fontFamily: 'NanumBarunGothic',
            }}
          >
            저장되지 않은 변경 사항이 있습니다!
          </div>
          <div className="d-flex justify-content-end ms-auto">
            <Button
              className="py-auto my-auto text-white me-1 bg-none"
              size="sm"
              style={{
                textDecoration: 'none',
                boxShadow: 'none',
              }}
              onClick={onReset}
              disabled={isSaving || isSaveError}
            >
              되돌리기
            </Button>
            <Button
              className="py-auto my-auto"
              variant="white"
              size="sm"
              onClick={onSave}
              disabled={isSaving || isSaveError}
            >
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" color="secondary" />
                  <span className="ms-2">저장 중...</span>
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChangesNotSaved;
