import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { verifyRecord } from '../api/verifyApi';
import VerificationCard from '../components/VerificationCard';
import { Loader2, AlertTriangle } from 'lucide-react';

const VerifyPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get('id');
    const recordId = id || queryId;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!recordId) {
            setError("No Record ID provided");
            setLoading(false);
            return;
        }

        verifyRecord(recordId)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [recordId]);

    if (loading) {
        return (
            <div className="container" style={{ alignItems: 'center' }}>
                <Loader2 className="spin" size={48} color="var(--accent-color)" />
                <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Verifying Blockchain Record...</p>
                <style>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                    background: '#FEF2F2', padding: 24, borderRadius: '50%',
                    marginBottom: 24, color: 'var(--error-color)'
                }}>
                    <AlertTriangle size={48} />
                </div>
                <h2 style={{ color: 'var(--error-color)' }}>Verification Failed</h2>
                <p style={{ maxWidth: 300, color: 'var(--text-secondary)' }}>
                    We could not verify this record. It may be invalid, expired, or tampered with.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: 8 }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <VerificationCard data={data} />
            <footer style={{ marginTop: 32, textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
                <p>© 2025 VaxSafe Global Health Passport</p>
                <p style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Powered by VaxSafe Blockchain Technology</p>
            </footer>
        </div>
    );
};

export default VerifyPage;
