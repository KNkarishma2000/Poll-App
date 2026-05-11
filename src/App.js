import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Test from "./Test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<Home />} />
        <Route path="/" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
