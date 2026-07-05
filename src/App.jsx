import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './features/dashboard/Dashboard'
import Personal from './features/personal/Personal'
import Work from './features/work/Work'
import Finance from './features/finance/Finance'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="personal" element={<Personal />} />
          <Route path="work" element={<Work />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App