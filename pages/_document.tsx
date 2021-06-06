import Document, { Html, Main, NextScript, Head } from 'next/document'
import GA_ID from 'datas/ga'

export default class Doc extends Document {
  render() {
    let _culs = window !== undefined ? localStorage.getItem('cached_user') : null
    const cachedUser = _culs ? JSON.parse(_culs) : null

    return (
      <Html lang="ko">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#4B4B78" />
          <meta
            name="description"
            content="미래를 바꿀 디스코드 관리봇, Aztra"
          />
          <link rel="manifest" href="/manifest.json" />


          <meta name='application-name' content='Aztra' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content='Aztra' />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='msapplication-TileColor' content='#4B4B78' />
          <meta name='msapplication-tap-highlight' content='no' />

          <link rel='apple-touch-icon' href='/logo192.png' />

          <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
          <link rel='shortcut icon' href='/favicon.ico' />
          <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500' />

          <meta name='twitter:card' content='summary' />
          <meta name='twitter:url' content='https://aztra.xyz' />
          <meta name='twitter:title' content='Aztra' />
          <meta name='twitter:description' content='미래를 바꿀 디스코드 관리봇, Aztra' />
          <meta name='twitter:image' content='https://aztra.xyz/logo192.png' />
          <meta property='og:type' content='website' />
          <meta property='og:title' content='Aztra' />
          <meta property='og:description' content='미래를 바꿀 디스코드 관리봇, Aztra' />
          <meta property='og:site_name' content='Aztra' />
          <meta property='og:url' content='https://aztra.xyz' />
          <meta property='og:image' content='https://aztra.xyz/logo192.png' />

          {
            process.env.NODE_ENV === "production" &&
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                      page_path: window.location.pathname,
                    });
                  ` 
                  + cachedUser 
                  ? `
                    gtag('config', 'MEASUREMENT_ID', {
                      'user_id': '${cachedUser.id}'
                    });
                  `
                  : ''
                  ,
                }}
              />
            </>
          }
        </Head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}