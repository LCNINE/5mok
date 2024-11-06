import { z } from "zod";
import { supabase } from "@/supabase/client"; 

const checkEmailExists = async (email: string) => {
  // const { data } = await supabase.auth.onAuthStateChange(event, session){

  // }


  // const { data } = await supabase
  //   .from("auth")
  //   .select("email")
  //   .eq("email", email)
  //   .single();

  // const {data} = await supabase.auth.admin.

  // return data ? false : true; 
};

export const signUpSchema = z
  .object({
    email: z
      .string()
      .email("올바른 이메일을 입력해주세요")
      // .refine(
      //   async (email) => await checkEmailExists(email),
      //   "이미 등록된 이메일입니다."
      // )
      ,
    password: z.string().min(6, "최소 6자 이상 입력해주세요").max(20),
    passwordCheck: z.string().min(6, "최소 6자 이상 입력해주세요"),
  })
  .refine((data) => data.password === data.passwordCheck, {
    message: "패스워드가 일치하지 않습니다.",
    path: ["passwordCheck"], 
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
