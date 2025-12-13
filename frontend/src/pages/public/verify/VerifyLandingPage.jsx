import { Activity, ArrowRight, Globe, Lock, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/verify/${searchTerm.trim()}`);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        position: 'relative',
      }}
    >
      {/* Background Decor */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -200,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
        }}
      ></div>

      {/* Navbar */}
      <header
        style={{
          padding: '24px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '800',
            fontSize: '1.4rem',
            color: '#0F172A',
            letterSpacing: '-0.5px',
          }}
        >
          <div
            style={{ background: '#0F172A', padding: '6px', borderRadius: '8px', display: 'flex' }}
          >
            <Activity size={20} color="#fff" />
          </div>
          <span>VaxSafe</span>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          zIndex: 10,
        }}
      >
        <div className="animate-fade-up">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '8px 16px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#3B82F6',
              marginBottom: '32px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
              <span
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  height: '100%',
                  width: '100%',
                  borderRadius: '50%',
                  background: '#3B82F6',
                  opacity: 0.75,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              ></span>
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  borderRadius: '50%',
                  height: '8px',
                  width: '8px',
                  background: '#3B82F6',
                }}
              ></span>
            </span>
            Decentralized Verification System
          </div>

          <h1
            style={{
              fontSize: '4.5rem',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              lineHeight: '1.05',
              marginBottom: '24px',
              color: '#0F172A',
            }}
          >
            Truth.
            <br />
            <span
              style={{
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundImage: 'linear-gradient(90deg, #3B82F6, #10B981)',
              }}
            >
              Cryptographically Verified.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: '#64748B',
              maxWidth: '580px',
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            Instant validation of global health records using advanced blockchain technology and
            IPFS decentralized storage. Make sure, be safe.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleVerify}
            style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}
          >
            <div
              style={{
                background: 'white',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '100px',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ paddingLeft: '16px', color: '#64748B', display: 'flex' }}>
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Paste Hash or Record ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '1.05rem',
                  color: '#1E293B',
                  padding: '14px 0',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#0F172A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  marginRight: '4px',
                }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Features */}
      <footer
        style={{
          padding: '40px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '80px',
          zIndex: 10,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <MinimalFeature
          icon={<Shield size={20} color="#10B981" />}
          title="Immutable"
          desc="Tamper-proof records on blockchain."
        />
        <MinimalFeature
          icon={<Globe size={20} color="#3B82F6" />}
          title="Global Standard"
          desc="FHIR compliant data structure."
        />
        <MinimalFeature
          icon={<Lock size={20} color="#F59E0B" />}
          title="Privacy Preserving"
          desc="Zero-knowledge proof verification."
        />
      </footer>

      <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .animate-fade-up {
                    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                @keyframes fadeUp {
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};

const MinimalFeature = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '700',
        color: '#0F172A',
      }}
    >
      {icon}
      <span>{title}</span>
    </div>
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>{desc}</p>
  </div>
);

export default VerifyLandingPage;
