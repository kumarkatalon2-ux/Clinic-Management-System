import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { PatientList } from '@/pages/PatientList'
import { PatientDetail } from '@/pages/PatientDetail'
import { Appointments } from '@/pages/Appointments'
import { Consultations } from '@/pages/Consultations'
import { Prescriptions } from '@/pages/Prescriptions'
import { LabResults } from '@/pages/LabResults'
import { Insurance } from '@/pages/Insurance'
import { MainLayout } from '@/components/layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/lab-results" element={<LabResults />} />
          <Route path="/insurance" element={<Insurance />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
