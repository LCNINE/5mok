import React from "react"
import { useForm } from "react-hook-form"
import { signInSchema, SignInSchema } from "./schema"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase/client"


export default function SignInPage() {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema)
  })


  async function onSubmit(values: SignInSchema){
    supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>로그인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input {...field} type="password"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter>
            <Button type="submit" className="flex-1">로그인</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>

  )
}