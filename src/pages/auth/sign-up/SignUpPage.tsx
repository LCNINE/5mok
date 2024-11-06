import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "./schema"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpSchema) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      console.log("회원가입에러", error.message);
    } else {
      navigate("/auth/sign-in");
    }
  }

  return (
    <div className="w-screen min-h-screen max-w flex flex-col items-center justify-center bg-gray-50">
    
      {error && (
        <Toast>
          <ToastTitle>회원가입 실패</ToastTitle> 
        </Toast>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-80 bg-white border-orange-100">
            <CardHeader>
              <CardTitle>회원가입</CardTitle>
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

              <FormField
                control={form.control}
                name="passwordCheck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
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
                회원가입
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <p>이미 회원이신가요? <span className="text-orange-600 cursor-pointer" onClick={() => navigate("/auth/sign-in")}>로그인하기</span></p>
      </div>

    </div>
  );
}
