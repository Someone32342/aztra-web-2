import { NextPage } from "next"
import { useEffect } from "react"

const DashboardRedirect: NextPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const guild = params.get("guild_id")
    if (guild) {
      localStorage.setItem('firstInvite', 'true')
      (window.opener && window).location.assign(`/dashboard/${guild}`)
    }
    if (window.opener) window.close()
  }, [])

  return null
}

export default DashboardRedirect
