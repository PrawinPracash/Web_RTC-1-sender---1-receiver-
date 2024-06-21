import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SenderPage from "./components/SenderPage"
import ReceiverPage from './components/RecieverPage'
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/sender' element={<SenderPage/>}/>
      <Route path='/receiver' element={<ReceiverPage/>}/>
    </Routes>
      
      
    </BrowserRouter>
  )
}

export default App
