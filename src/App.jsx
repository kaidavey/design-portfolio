import './App.css'
import NavBar from './components/core/navbar';

function Home() {
  return (
    <div className="home-page">
      <div className="home-page__bg" aria-hidden="true" />
      <nav className="home-page__sidebar" aria-label="Site navigation">
        <NavBar />
      </nav>
      <main className="home-page__content">
        
      </main>
    </div>
  );
}

export default Home;