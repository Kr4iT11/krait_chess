import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import SignIn from './pages/AuthPages/Signin'
import Signup from './pages/AuthPages/Signup'


function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/signin" />} /> */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </>
  )
}

export default App


