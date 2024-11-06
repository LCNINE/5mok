import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignInPage from "./pages/auth/sign-in/SignInPage"
import AuthLayout from "./pages/auth/AuthLayout"
import RootPage from "./pages/Root"
import GamePage from "./pages/GamePage"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./context/ProtectedRoute"
import SignUpPage from "./pages/auth/sign-up/SignUpPage"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="" element={<ProtectedRoute><RootPage/></ProtectedRoute>} /> */}
          <Route path="" element={<RootPage/>} />
          <Route path="auth" element={<AuthLayout/>}>
            <Route path="sign-in" element={<SignInPage/>} />
            <Route path="sign-up" element={<SignUpPage/>}/>
          </Route>
          <Route path="game/:gameId" element={<ProtectedRoute><GamePage/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
