import React from 'react';
import { Coffee, ShieldCheck, Flame, Cpu, Compass, BookOpen } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Craft & Philosophy</span>
          <h2 className="section-title">About BaristaPulse</h2>
          <p className="section-subtitle">
            An open-source coffee rating platform connecting coffee lovers, roasters, and tasters worldwide.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card-title">
              <BookOpen size={22} color="var(--color-caramel-400)" />
              SCA-Inspired Rating Standards
            </h3>
            <p className="about-card-body" style={{ color: 'var(--color-text-muted)' }}>
              Our community evaluation is modeled after the Specialty Coffee Association (SCA) cupping protocol.
              Coffees are rated on an intuitive 1 to 5 star scale evaluating fragrance, aroma, flavor, aftertaste,
              acidity, body, and balance:
            </p>
            <ul style={{ marginTop: 14, paddingLeft: 20, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <li><strong>5 Stars (90-100 pts):</strong> Extraordinary rare micro-lot with sublime complexity.</li>
              <li><strong>4 Stars (85-89 pts):</strong> Excellent specialty coffee with distinct varietal character.</li>
              <li><strong>3 Stars (80-84 pts):</strong> Very good everyday specialty grade brew.</li>
              <li><strong>2 Stars (75-79 pts):</strong> Commercial blend with standard roasted flavor notes.</li>
              <li><strong>1 Star (&lt;75 pts):</strong> Below specialty standard or defective roast.</li>
            </ul>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">
              <Flame size={22} color="var(--color-caramel-400)" />
              Roast Profile Guide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              <div>
                <span className="badge badge-light" style={{ marginBottom: 6 }}>Light Roast</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  Dropped just after first crack (~205°C). Highlights the bean's true origin, floral bouquets,
                  stone fruit sweetness, and bright sparkling acidity with zero roasted bitterness.
                </p>
              </div>

              <div>
                <span className="badge badge-medium" style={{ marginBottom: 6 }}>Medium Roast</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  Roasted to mid-crack (~215°C). Perfect balance of acidity and body with caramelized sugars,
                  milk chocolate, toasted nuts, and honey sweetness.
                </p>
              </div>

              <div>
                <span className="badge badge-dark" style={{ marginBottom: 6 }}>Dark Roast</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  Roasted into second crack (~225°C). Full heavy body with bittersweet dark cocoa, smoky cedar,
                  low acidity, and rich golden crema ideal for espresso and milk drinks.
                </p>
              </div>
            </div>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">
              <ShieldCheck size={22} color="#15803d" />
              Integrity & Anti-Duplication
            </h3>
            <p className="about-card-body" style={{ color: 'var(--color-text-muted)' }}>
              To ensure honest, fair community scores, every vote is verified through backend database constraints:
            </p>
            <ul style={{ marginTop: 14, paddingLeft: 20, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <li><strong>Persistent Voter ID:</strong> Cryptographically generated browser identifier prevents duplicate submissions.</li>
              <li><strong>Database Transactions:</strong> Atomic transactions ensure ratings recalculate precisely with zero concurrency drift.</li>
              <li><strong>SQLAlchemy Parameterization:</strong> Full protection against SQL injection and data anomalies.</li>
            </ul>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">
              <Cpu size={22} color="#2563eb" />
              Technology Architecture
            </h3>
            <p className="about-card-body" style={{ color: 'var(--color-text-muted)' }}>
              Built with modern, open-source technologies:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <span className="badge badge-medium">React 18</span>
              <span className="badge badge-medium">Vite</span>
              <span className="badge badge-medium">Python 3 Flask</span>
              <span className="badge badge-medium">SQLite</span>
              <span className="badge badge-medium">SQLAlchemy ORM</span>
              <span className="badge badge-medium">Flask-CORS</span>
              <span className="badge badge-medium">Pytest</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
