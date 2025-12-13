import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import VerificationCard from '@/components/verify/VerificationCard';
import { verifyRecord } from '@/services/verify.service';

const VerifyResultPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryId = searchParams.get('id');
  const recordId = id || queryId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordId) {
      setError('No Record ID provided');
      setLoading(false);
      return;
    }

    verifyRecord(recordId)
      .then(setData)
      .catch((err) => {
        setError(err?.response?.data?.message || err.message || 'Verification Failed');
      })
      .finally(() => setLoading(false));
  }, [recordId]);

  const handleBack = () => navigate('/verify'); // Go back to landing page

  if (loading) {
    return (
      <div className="page-container">
        <Loader2 className="spin" size={64} color="#3B82F6" />
        <p className="loading-text">DECRYPTING BLOCKCHAIN DATA...</p>
        <style>{`
                    .page-container {
                        height: 100vh; width: 100vw; overflow: hidden;
                        background: #0F172A;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                    }
                    .loading-text {
                        margin-top: 20px; font-family: 'Roboto Mono', monospace; font-size: 0.9rem;
                        color: #64748B; letter-spacing: 2px; animation: blink 1.5s infinite;
                    }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes blink { 50% { opacity: 0.5; } }
                `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: 24,
            borderRadius: '50%',
            marginBottom: 24,
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertTriangle size={48} color="#EF4444" />
        </div>
        <h2 style={{ color: '#F8FAFC', fontFamily: 'Inter', letterSpacing: '-0.5px' }}>
          VERIFICATION FAILED
        </h2>
        <div
          style={{
            fontFamily: 'Roboto Mono',
            color: '#EF4444',
            fontSize: '0.85rem',
            marginBottom: 32,
            background: '#1E293B',
            padding: '8px 16px',
            borderRadius: 8,
          }}
        >
          {error.toUpperCase()}
        </div>
        <button onClick={handleBack} className="back-btn" type="button">
          <ArrowLeft size={18} /> GO BACK
        </button>
        <style>{`
                    .page-container {
                        height: 100vh; width: 100vw; overflow: hidden;
                        background: #0F172A;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                    }
                    .back-btn {
                        background: transparent; border: 1px solid #334155; color: #94A3B8;
                        padding: 10px 24px; borderRadius: 8px; cursor: pointer;
                        display: flex; gap: 8px; align-items: center; font-family: 'Roboto Mono';
                        transition: all 0.2s;
                    }
                    .back-btn:hover { background: #1E293B; color: #fff; border-color: #64748B; }
                `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: '#F1F5F9', // Light background for contrast with the digital card
        backgroundImage: `radial-gradient(#E2E8F0 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            color: '#475569',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div
          style={{
            background: '#0F172A',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'Roboto Mono',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }}></div>
          LIVE VERIFICATION
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          zIndex: 5,
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <VerificationCard data={data} />
      </div>

      <div style={{ position: 'absolute', bottom: 20, textAlign: 'center', width: '100%' }}>
        <div style={{ fontFamily: 'Roboto Mono', fontSize: '0.65rem', color: '#94A3B8' }}>
          SECURED BY VAXSAFE PROTOCOL v2.0
        </div>
      </div>

      <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
};

export default VerifyResultPage;
