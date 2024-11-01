import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "최소 6자 이상 입력해주세요").max(20),
})

export type SignInSchema = z.infer<typeof signInSchema>