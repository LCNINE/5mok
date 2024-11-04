import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignInPage from "./pages/auth/sign-in/SignInPage"
import AuthLayout from "./pages/auth/AuthLayout"
import RootPage from "./pages/Root"
import CreateRoomPage from "./pages/CreateRoomPage"
import GamePage from "./pages/GamePage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<RootPage/>} />
        <Route path="auth" element={<AuthLayout/>}>
          <Route path="sign-in" element={<SignInPage/>} />
          <Route path="sign-up"/>
        </Route>
        <Route path="create-room" element={<CreateRoomPage/>}/>
        <Route path="game/:gameId" element={<GamePage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
