import src from "docs/aztra-commands-guide"
import DocViewWithNav from "components/docs/DocViewWithNav"
import { GetServerSideProps } from "next"
import Layout from "components/Layout"

interface Props {
  pageId: string
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { pageid } = context.query

  return {
    props: {
      pageId: pageid as string
    }
  }
}

const AztraCommandGuide: React.FC<Props> = ({ pageId }) => {
  return (
    <Layout>
      <DocViewWithNav index={src} pageId={pageId} />
    </Layout>
  )
}

export default AztraCommandGuide