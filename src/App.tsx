import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ClientView from './views/ClientView';
import CounterView from './views/CounterView';
import DisplayView from './views/DisplayView';
// import TechServiceView from './views/TechServiceView';
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ClientView />} />
          <Route path="/counter" element={<CounterView />} />
          <Route path="/display" element={<DisplayView />} />
          {/* <Route path="/tech" element={<TechServiceView />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;