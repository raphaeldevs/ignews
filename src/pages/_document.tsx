import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

          <title>ig.news</title>
        </Head>

        <body>
          <Main />
          
          <NextScript />
        </body>
      </Html>
    )
  }
}