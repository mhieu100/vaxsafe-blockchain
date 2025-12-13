import { Activity, BadgeCheck, Download, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const VerificationCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="digital-card">
      {/* Top Security Bar */}
      <div className="security-bar">
        <div className="bar-pattern"></div>
        <div className="security-status">
          <ShieldCheck size={16} color="#4ADE80" />
          <span>SECURE VERIFICATION</span>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Header */}
        <div className="card-header">
          <div className="icon-box">
            <Activity size={32} color="#3B82F6" />
          </div>
          <div>
            <h1 className="title">DIGITAL HEALTH PASS</h1>
            <div className="subtitle">BLOCKCHAIN VERIFIED</div>
          </div>
          <div className="status-badge">
            <BadgeCheck size={16} fill="#3B82F6" color="#fff" />
            <span>VALID</span>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="info-grid">
          <div className="info-group main-info">
            <label>BENEFICIARY</label>
            <div className="value-lg">{data.patientName}</div>
            <div className="mono-text">
              ID: {data.patientIdentityHash?.substring(0, 10)}...
              {data.patientIdentityHash?.substring(data.patientIdentityHash.length - 4)}
            </div>
          </div>

          <div className="qr-container">
            <div className="qr-frame">
              <QRCodeCanvas
                value={`${window.location.origin}/verify/${data.ipfsHash}`}
                size={80}
                level={'H'}
              />
            </div>
          </div>
        </div>

        <div className="divider-line"></div>

        {/* Vaccine Details - 4 Column Grid */}
        <div className="details-grid">
          <div className="detail-box">
            <label>VACCINE PROPHYLAXIS</label>
            <div className="value">{data.vaccineName}</div>
          </div>
          <div className="detail-box">
            <label>MANUFACTURER</label>
            <div className="value">{data.manufacturer}</div>
          </div>
          <div className="detail-box">
            <label>DOSE / TOTAL</label>
            <div className="value highlight">
              {data.doseNumber} / {data.dosesRequired || 2}
            </div>
          </div>
          <div className="detail-box">
            <label>DATE OF VACCINATION</label>
            <div className="value">{data.vaccinationDate}</div>
          </div>
        </div>

        <div className="detail-box full-width">
          <label>ISSUING CENTER</label>
          <div className="value">{data.centerName}</div>
        </div>

        {/* Blockchain Footer */}
        <div className="blockchain-footer">
          <div className="chain-link">
            <div className="link-icon">
              <Download size={14} />
            </div>
            <div className="link-text">IPFS ASSET: {data.ipfsHash?.substring(0, 12)}...</div>
          </div>
          <div className="chain-link">
            <div className="link-icon">
              <Activity size={14} />
            </div>
            <div className="link-text">TX HASH: {data.transactionHash?.substring(0, 12)}...</div>
          </div>
        </div>
      </div>

      <style>{`
                .digital-card {
                    background: #FFFFFF;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                    font-family: 'Inter', sans-serif;
                    position: relative;
                }
                .security-bar {
                    background: #1E293B;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                }
                .bar-pattern {
                    width: 60px;
                    height: 4px;
                    background: repeating-linear-gradient(90deg, #334155, #334155 4px, transparent 4px, transparent 8px);
                }
                .security-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #4ADE80;
                    letter-spacing: 1px;
                }
                .content-wrapper {
                    padding: 24px;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                    position: relative;
                }
                .icon-box {
                    width: 48px;
                    height: 48px;
                    background: #EFF6FF;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    line-height: 1.2;
                }
                .subtitle {
                    font-size: 0.65rem;
                    color: #64748B;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .status-badge {
                    margin-left: auto;
                    border: 2px solid #3B82F6;
                    border-radius: 30px;
                    padding: 4px 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #3B82F6;
                }
                .info-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                }
                .main-info label, .detail-box label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #94A3B8;
                    display: block;
                    margin-bottom: 4px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .value-lg {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #1E293B;
                }
                .mono-text {
                    font-family: 'Roboto Mono', monospace;
                    font-size: 0.75rem;
                    color: #64748B;
                    margin-top: 4px;
                    background: #F1F5F9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: inline-block;
                }
                .qr-frame {
                    padding: 6px;
                    border: 2px dashed #E2E8F0;
                    border-radius: 8px;
                }
                .divider-line {
                    height: 1px;
                    background: #E2E8F0;
                    margin-bottom: 24px;
                    position: relative;
                }
                .divider-line::after {
                    content: '';
                    position: absolute;
                    top: -1px;
                    left: 0;
                    width: 40px;
                    height: 3px;
                    background: #3B82F6;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .detail-box .value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #334155;
                }
                .full-width {
                    margin-bottom: 24px;
                }
                .highlight {
                    color: #3B82F6 !important;
                }
                .blockchain-footer {
                    background: #0F172A;
                    margin: 0 -24px -24px;
                    padding: 16px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .chain-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #94A3B8;
                    font-family: 'Roboto Mono', monospace;
                    font-size: 0.7rem;
                }
                .link-icon {
                    color: #3B82F6;
                }
            `}</style>
    </div>
  );
};

export default VerificationCard;
