
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <link rel="manifest" href="/manifest.json" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
