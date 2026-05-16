import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Specialties from './components/Specialties/Specialties';
import Steps from './components/Steps/Steps';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import Footer from './components/Footer/Footer';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import DoctorPortal from './components/DoctorPortal/DoctorPortal';
import PatientPortal from './components/PatientPortal/PatientPortal';
import Providers from './components/Providers/Providers';
import AdminPortal from './components/AdminPortal/AdminPortal';

const FULL_SCREEN_ROUTES = ['/register', '/login', '/doctor-portal', '/patient-portal', '/admin-portal'];

function HomePage() {
  return (
    <>
      <Hero />
      <Specialties />
      <Steps />
      <WhyChooseUs />
    </>
  );
}

function App() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location.pathname);

  return (
    <div>
      {!isFullScreen && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor-portal" element={<DoctorPortal />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
        </Routes>
      </main>
      {!isFullScreen && <Footer />}
    </div>
  );
}

export default App;
