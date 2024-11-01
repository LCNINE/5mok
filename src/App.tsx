import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignInPage from "./pages/auth/sign-in/SignInPage"
import AuthLayout from "./pages/auth/AuthLayout"
import RootPage from "./pages/Root"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<RootPage/>} />
        <Route path="auth" element={<AuthLayout/>}>
          <Route path="sign-in" element={<SignInPage/>} />
          <Route path="sign-up"/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
