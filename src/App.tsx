import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Settings from "@/pages/Settings";
import Scores from "@/pages/Scores";
import GameOver from "@/pages/GameOver";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/gameover" element={<GameOver />} />
      </Routes>
    </Router>
  );
}
