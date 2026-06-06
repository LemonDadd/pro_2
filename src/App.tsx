import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ContrastChecker from '@/pages/ContrastChecker';
import PaletteAudit from '@/pages/PaletteAudit';
import ColorblindSimulate from '@/pages/ColorblindSimulate';
import ImageSampler from '@/pages/ImageSampler';
import ReportPage from '@/pages/ReportPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ContrastChecker />} />
          <Route path="/palette" element={<PaletteAudit />} />
          <Route path="/simulate" element={<ColorblindSimulate />} />
          <Route path="/sampler" element={<ImageSampler />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
