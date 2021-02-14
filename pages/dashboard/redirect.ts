import { NextPage } from "next"
import { useEffect } from "react"

const DashboardRedirect: NextPage = () => {
  useEffect(() => {
    if (!window.opener) return
    const params = new URLSearchParams(window.location.search)
    const guild = params.get("guild_id")
    if (guild) {
      localStorage.setItem('firstInvite', 'true')
      window.opener.location.assign(`/dashboard/${guild}`)
    }
    window.close()
  }, [])

  return null
}

export default DashboardRedirect