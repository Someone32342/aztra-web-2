import { useEffect } from 'react'
import api from '../datas/api'
import axios from 'axios'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import Cookies from 'universal-cookie'

export default function Auth({ data }: { data: any }) {
  const router = useRouter()
  useEffect(() => {
    new Cookies().set('ACCESS_TOKEN', data.access_token, {
      maxAge: data.expires_in
    })
    router.push(localStorage.getItem('loginFrom') || "/")
  }, [])

  return null
}

export const getServerSideProps: GetServerSideProps = async context => {
  let data = null

  try {
    let r = await axios.get(`${api}/oauth2/token`, {
      params: {
        code: context.query.code
      }
    })
    data = r.data
  }

  catch (e) {
    console.error(e)
  }

  return {
    props: { data }
  };
}