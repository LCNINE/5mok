import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema, SignInSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase/client";
import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";

export default function SignInPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate("/");
        }, 5000);
      }
    }
    checkSession();
  }, [navigate]);

  async function onSubmit(values: SignInSchema) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error("로그인 에러:", error.message);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="w-screen min-h-screen max-w flex flex-col items-center justify-center bg-gray-50">
      {isLoggedIn && (
        <Alert className="mb-4 w-80" variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>이미 로그인된 상태입니다</AlertTitle>
          <AlertDescription>메인 페이지로 이동합니다.</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-80 bg-white border-orange-100">
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
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="flex-1">
                로그인
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <p>회원이 아니신가요? <span className="text-orange-600 cursor-pointer" onClick={() => navigate("/auth/sign-up")}>회원가입하기</span></p>
      </div>
    </div>
  );
}