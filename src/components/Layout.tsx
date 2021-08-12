import React from 'react';
import Footer from './Footer';
import Navibar from './Navibar';

const Layout: React.FC = (props) => {
  return (
    <>
      <Navibar />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
