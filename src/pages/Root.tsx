import { supabase } from "@/supabase/client"
import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export default function RootPage() {
  const [user, setUser] = useState<User|null>(null)

  useEffect(() => {
    const callbackState = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    async function getSomething(){
      const { data, error } = await supabase.from("games").select("*")
      console.log({
        data: data,
        error: error
      })
    }

    getSomething()
    return callbackState.data.subscription.unsubscribe
  }, [])

  return (
    <p>{ user?.email ?? "비회원" }</p>
  )
}