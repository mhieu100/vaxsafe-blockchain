import React from 'react';
import { BadgeCheck, XCircle, ShieldCheck, Activity, Calendar, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const VerificationCard = ({ data }) => {
    if (!data) return null;

    return (
        <div className="card glass-card">
            <div className="status-header">
                <div className="status-icon-wrapper">
                    <ShieldCheck size={40} className="status-icon" />
                </div>
                <h1 className="title">COVID-19 Digital Pass</h1>
                <div className="badge-verified">
                    <BadgeCheck size={16} />
                    <span>Verifiable Record</span>
                </div>
            </div>

            <div className="info-section">
                <div className="patient-info">
                    <h3 className="label">Patient Name</h3>
                    <p className="value-lg">{data.patientName}</p>
                    <p className="sub-value">ID: {data.identityNumber}</p>
                </div>

                <div className="divider"></div>

                <div className="vaccine-details">
                    <div className="detail-row">
                        <div className="detail-item">
                            <span className="label">Vaccine</span>
                            <span className="value">{data.vaccineName}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Manufacturer</span>
                            <span className="value">{data.manufacturer}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-item">
                            <span className="label">Dose Number</span>
                            <span className="value-highlight">{data.doseNumber}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Date</span>
                            <span className="value">{data.vaccinationDate}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-item">
                            <span className="label">Location</span>
                            <span className="value">{data.center}</span>
                        </div>
                    </div>
                </div>

                <div className="blockchain-proof">
                    <div className="proof-header">
                        <Activity size={14} />
                        <span>Blockchain Proof of Integrity</span>
                    </div>
                    <div className="proof-data">
                        <div><span>Tx Hash:</span> {data.transactionHash?.substring(0, 20)}...</div>
                        <div><span>IPFS:</span> {data.ipfsHash?.substring(0, 20)}...</div>
                    </div>
                </div>
            </div>

            <div className="qr-section">
                <div className="qr-wrapper">
                    <QRCodeCanvas value={`https://vaxsafe.mhieu100.space/verify/${data.ipfsHash}`} size={120} level={"H"} />
                </div>
                <p className="scan-hint">Scan to verify authenticity</p>
            </div>

            <button className="btn btn-primary full-width">
                <Download size={18} />
                Save to Apple Wallet
            </button>

            <style>{`
        .status-header {
            text-align: center;
            margin-bottom: 24px;
        }
        .status-icon-wrapper {
            width: 64px;
            height: 64px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            color: var(--success-color);
        }
        .title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 8px;
            color: var(--primary-color);
        }
        .badge-verified {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--success-color);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .info-section {
            margin-bottom: 24px;
        }
        .patient-info {
            text-align: center;
            margin-bottom: 20px;
        }
        .label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            margin: 0 0 4px;
            display: block;
        }
        .value {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-main);
            display: block;
        }
        .value-lg {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-main);
            margin: 0;
        }
        .sub-value {
             font-size: 0.9rem;
             color: var(--text-secondary);
             margin: 4px 0 0;
        }
        .divider {
            height: 1px;
            background: var(--border-color);
            margin: 16px 0;
            border-style: dashed;
        }
        .detail-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }
        .value-highlight {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-color);
        }
        .blockchain-proof {
            background: #F1F5F9;
            padding: 12px;
            border-radius: 8px;
            margin-top: 16px;
        }
        .proof-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--primary-light);
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .proof-data {
            font-family: monospace;
            font-size: 0.7rem;
            color: var(--text-secondary);
        }
        .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 24px;
            padding-top: 24px;
            border-top: 1px dashed var(--border-color);
        }
        .qr-wrapper {
            padding: 10px;
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }
        .scan-hint {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 8px;
        }
        .full-width {
            width: 100%;
        }
      `}</style>
        </div>
    );
};

export default VerificationCard;
