import src from 'docs/aztra-commands-guide';
import DocViewWithNav from 'components/docs/DocView';
import { GetServerSideProps } from 'next';
import Layout from 'components/Layout';
import React from 'react';
import Head from 'next/head';

interface Props {
  pageId: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({ props: { pageId: context.query.pageid as string } });

const AztraCommandGuide: React.FC<Props> = ({ pageId }) => {
  return (
    <>
      <Head>
        <title>
          {src.pages.find((o) => o.id === pageId)?.title} - 명령어 가이드
        </title>
      </Head>
      <Layout>
        <DocViewWithNav index={src} pageId={pageId} />
      </Layout>
    </>
  );
};

export default AztraCommandGuide;
