import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloud, FaInfinity, FaPuzzlePiece, FaTwitter, FaFacebook, FaYoutube, FaInstagram, FaBrain, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="home-logo" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="MindLink" className="logo-image" />
                    <span>MindLink</span>
                </div>
                <nav className="home-nav">
                    <a href="#features" className="active">Features</a>
                    <a href="#solutions">Solutions</a>
                    <a href="#resources">Resources</a>
                </nav>
                <div className="home-auth">
                    <button className="btn-text" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn-primary-header" onClick={() => navigate('/register')}>Sign Up Free</button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background-grid"></div>
                <div className="hero-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`particle p${i + 1}`}></div>
                    ))}
                </div>

                <div className="hero-content">
                    <h1 className="hero-title fade-in-up delay-1">
                        Connect Your <br />
                        <span className="text-gradient-animated">Thoughts</span>
                    </h1>
                    <p className="hero-subtitle fade-in-up delay-1">
                        The ultimate workspace for visual thinkers. Organize, collaborate,
                        and bring your chaotic thoughts to life in infinite space.
                    </p>
                    <div className="hero-buttons fade-in-up delay-2">
                        <button className="btn-glow primary" onClick={() => navigate('/register')}>Start Mapping Now</button>
                    </div>
                </div>

                <div className="hero-visual fade-in delay-3">
                    <div className="glass-card-mockup">
                        <div className="mockup-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="mockup-body">
                            {/* Simple CSS Mind Map Animation */}
                            <div className="node root-node">Core Idea</div>
                            <div className="connector c1"></div>
                            <div className="node sub-node n1">Strategy</div>
                            <div className="connector c2"></div>
                            <div className="node sub-node n2">Design</div>
                            <div className="connector c3"></div>
                            <div className="node sub-node n3">Code</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section className="features-section" id="features">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <FaCloud className="feature-icon" color="#3498db" />
                        <h3>Real-time Collaboration</h3>
                        <p>Real-time collaboration together with teams and time entries.</p>
                    </div>
                    <div className="feature-card">
                        <FaInfinity className="feature-icon" color="#2ecc71" />
                        <h3>Unlimited Space</h3>
                        <p>Unlimited space can insure possible rows of unlimited ideas.</p>
                    </div>
                    <div className="feature-card">
                        <FaPuzzlePiece className="feature-icon" color="#f1c40f" />
                        <h3>Seamless Integrations</h3>
                        <p>Integrates integrations with apps, runners and solutions.</p>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section className="solutions-section" id="solutions">
                <h2>Solutions for Every Team</h2>
                <div className="solutions-grid">
                    <div className="solution-card">
                        <h3>Brainstorming</h3>
                        <p>Unleash creativity with free-form diagrams that let you capture ideas as fast as you can think them.</p>
                    </div>
                    <div className="solution-card">
                        <h3>Project Planning</h3>
                        <p>Turn chaotic ideas into structured plans. Visualize workflows, tasks, and timelines in one place.</p>
                    </div>
                    <div className="solution-card">
                        <h3>Meeting Notes</h3>
                        <p>Ditch linear bullet points. Map out meeting discussions in real-time to keep everyone aligned.</p>
                    </div>
                    <div className="solution-card">
                        <h3>Knowledge Management</h3>
                        <p>Build a central hub of knowledge. Link docs, resources, and ideas visually.</p>
                    </div>
                </div>
            </section>

            {/* Resources Section */}
            <section className="resources-section" id="resources">
                <h2>Learn & Grow</h2>
                <div className="resources-container">
                    <div className="resource-item">
                        <div className="resource-tag">Blog</div>
                        <h3>The Art of Visual Thinking</h3>
                        <p>Discover how mapping your thoughts can improve memory and problem-solving.</p>
                        <a href="#" className="read-more">Read Article &rarr;</a>
                    </div>
                    <div className="resource-item">
                        <div className="resource-tag">Guide</div>
                        <h3>Getting Started with MindLink</h3>
                        <p>A comprehensive guide to mastering the infinite canvas in under 10 minutes.</p>
                        <a href="#" className="read-more">View Guide &rarr;</a>
                    </div>
                    <div className="resource-item">
                        <div className="resource-tag">Webinar</div>
                        <h3>Remote Collaboration Best Practices</h3>
                        <p>Join our expert team to learn how to facilitate better remote brainstorming sessions.</p>
                        <a href="#" className="read-more">Watch Replay &rarr;</a>
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-columns">
                    <div className="footer-col">
                        <h4>Product</h4>
                        <a href="#">Product</a>
                        <a href="#">Solutions</a>
                        <a href="#">Mindmapping</a>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#">Company</a>
                        <a href="#">Contact Us</a>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <a href="#">Contact Us</a>
                        <a href="#">Helps & Support</a>
                    </div>
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <div className="social-icons">
                            <FaFacebook />
                            <FaTwitter />
                            <FaYoutube />
                            <FaInstagram />
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <p>Copyright © MindLink. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
