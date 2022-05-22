import React from 'react';
import Layout from 'components/Layout';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import content from 'docs/tos.md';
import { heading } from 'components/MarkdownRenderer';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const Tos: NextPage = () => {
  return (
    <>
      <Head>
        <title>Aztra 이용약관</title>
      </Head>
      <Layout>
        <Container
          fluid="sm"
          className="py-5 px-sm-1 px-md-3 px-lg-5"
          style={{ lineHeight: 1.7 }}
        >
          <ReactMarkdown
            className="markdown-dark text-light"
            rehypePlugins={[rehypeRaw, remarkGfm]}
            components={{
              h1: ({ children }) => heading({ level: 1, children }),
              h2: ({ children }) => heading({ level: 2, children }),
              h3: ({ children }) => heading({ level: 3, children }),
              h4: ({ children }) => heading({ level: 4, children }),
              h5: ({ children }) => heading({ level: 5, children }),
              h6: ({ children }) => heading({ level: 6, children }),
            }}
          >
            {content}
          </ReactMarkdown>
        </Container>
      </Layout>
    </>
  );
};

export default Tos;
