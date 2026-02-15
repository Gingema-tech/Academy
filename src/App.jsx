import ChromeHeader from "./ChromeHeader.jsx";
import "./index.css";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="title">YOUR BRAND</div>
          <div className="subtitle">CHROME HEADER</div>
        </div>

        <div className="hero3d">
          <ChromeHeader modelUrl="/models/logo.glb" />
        </div>

        <div className="meta">
          <div>2026</div>
          <div>TYPE</div>
        </div>
      </header>

      <main className="content">
        <p>Ниже — контент сайта. Вверху — 3D-надпись, вращается за мышью.</p>
      </main>
    </div>
  );
}
