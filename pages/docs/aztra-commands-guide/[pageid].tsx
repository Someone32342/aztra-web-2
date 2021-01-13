import { useRouter } from "next/router"
import src from "docs/aztra-commands-guide"
import DocViewWithNav from "components/docs/DocViewWithNav"
import { GetServerSideProps } from "next"

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
  const router = useRouter()

  return <DocViewWithNav index={src} pageId={pageId} />
}