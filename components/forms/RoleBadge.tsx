import React from 'react'

const RoleBadge: React.FC = () => {
  return (
    <div className="d-flex" style={{border: '1px solid gold', borderRadius: '50px 50px 50px 50px'}}>
      <div className="rounded-circle" style={{width: 16, height:16, margin: 5, backgroundColor: 'gold'}} />
      관리자
    </div>
  )
}

export default RoleBadge