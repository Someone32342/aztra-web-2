import { useEffect } from "react";
import oauth from "../datas/oauth";

export default function Login() {
  useEffect(() => {
    window.location.assign(oauth.discord_oauth2)
  }, [])

  return null
}