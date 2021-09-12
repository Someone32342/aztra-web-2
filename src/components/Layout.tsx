import Head from 'next/head';
import React from 'react';
import Footer from './Footer';
import Navibar from './Navibar';

const Layout: React.FC = (props) => {
  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://aztra.xyz" />
        <meta name="twitter:title" content="Aztra" />
        <meta
          name="twitter:description"
          content="미래를 바꿀 디스코드 관리봇, Aztra"
        />
        <meta name="twitter:image" content="https://aztra.xyz/logo192.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Aztra" />
        <meta
          property="og:description"
          content="미래를 바꿀 디스코드 관리봇, Aztra"
        />
        <meta property="og:site_name" content="Aztra" />
        <meta property="og:url" content="https://aztra.xyz" />
        <meta property="og:image" content="https://aztra.xyz/logo512.png" />
      </Head>
      <Navibar />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
