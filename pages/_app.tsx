import App from 'next/app'
import Head from 'next/head'
import '../styles/root.scss'
import Aztrart from 'public/aztrart.txt'

export default class MyApp extends App {
  showConsoleMessage = () => {
    if (localStorage.getItem('theme') == null) {
      localStorage.setItem('theme', 'dark')
    }

    console.log(`%c${Aztrart}`, 'color:MediumPurple')

    if (process.env.NODE_ENV === 'production') {
      let style = 'font-family: NanumSquare; font-size: 16pt;'
      console.log('\n\n\n')
      console.log('%c조심하세요!', 'color: gold; font-size: 34pt; font-weight: bold;')
      console.log('%c이 콘솔은 개발자를 위해 만들어진 것으로서, 일반적으로 여러분이 볼 일이 없는 화면입니다.\n만약 누군가가 이곳에 특정 명령을 복사하여 붙여넣을 것을 요구했다면 이는 계정 해킹 시도일 가능성이 매우 높습니다!', style)
      console.log('%c이를 무시하고 계속할 시 타인에게 당신의 Aztra 액세스 권한을 넘겨주게 될 수 있습니다!!', style)
      console.log('\n\n\n')
    }
  }

  componentDidMount() {
    this.showConsoleMessage()
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Aztra - 아즈트라</title>
        </Head>
        <Component {...pageProps} />
      </>
    )
  }
}