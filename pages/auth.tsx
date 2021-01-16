import { useEffect } from 'react'
import api from 'datas/api'
import axios from 'axios'
import { useRouter } from 'next/router'
import Cookies from 'universal-cookie'

export default function Auth() {
  const router = useRouter()

  useEffect(() => {
    axios.get(`${api}/oauth2/token`, {
      params: {
        code: new URLSearchParams(window.location.search).get('code')
      }
    })
      .then(r => {
        new Cookies().set('ACCESS_TOKEN', r.data.access_token, {
          maxAge: r.data.expires_in
        })
        router.push(localStorage.getItem('loginFrom') || "/")
      })
      .catch(e => {
        console.error(e)
      })
  }, [])

  return null
}