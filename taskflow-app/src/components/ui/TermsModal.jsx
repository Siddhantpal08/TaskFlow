import { useState } from 'react';
import { DARK } from '../../data/themes.js';

const t = DARK;

export default function TermsModal({ onAccept, onDecline }) {
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = (e) => {
        const el = e.target;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(4, 8, 16, 0.88)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div className="popIn" style={{
                width: '100%', maxWidth: 680, maxHeight: '90vh',
                background: 'linear-gradient(145deg, #0C1420, #0F1C2E)',
                border: `1px solid ${t.border}`, borderRadius: 20,
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 80px #00000099',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 28px 16px',
                    borderBottom: `1px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 900, color: '#060B12', flexShrink: 0,
                    }}>T</div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: t.t1 }}>Terms of Service & Privacy Policy</div>
                        <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono }}>TaskFlow by Crevio · Last updated June 2025</div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div onScroll={handleScroll} style={{
                    flex: 1, overflowY: 'auto', padding: '20px 28px',
                    fontSize: 13, color: t.t2, lineHeight: 1.7, fontFamily: t.disp,
                }}>
                    <Section title="1. Acceptance of Terms">
                        By creating an account on TaskFlow (the "Service"), operated by Crevio ("we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, you may not use the Service.
                    </Section>

                    <Section title="2. Description of Service">
                        TaskFlow is a cloud-based productivity platform providing task management, rich-text notes, team collaboration, calendar, and related features. The Service is offered under a freemium model:
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                            <li><strong>Free Plan:</strong> Limited to 10 note pages, 20 tasks, and 3 team members. No note sharing or advanced writing modes.</li>
                            <li><strong>Pro Plan:</strong> Unlimited pages, tasks, team members, note sharing, Script & Lyrics modes, and priority support. Billed monthly at the price displayed at checkout.</li>
                        </ul>
                    </Section>

                    <Section title="3. Account Eligibility & Registration">
                        You must be at least 13 years of age (or the minimum age of digital consent in your jurisdiction) to use the Service. By registering, you confirm that all information you provide is accurate, and you are responsible for maintaining the confidentiality of your credentials. You are responsible for all activity that occurs under your account.
                    </Section>

                    <Section title="4. Acceptable Use">
                        You agree NOT to use the Service to:
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                            <li>Upload, store, or share content that is illegal, defamatory, harassing, hateful, violent, or sexually explicit.</li>
                            <li>Infringe upon intellectual property rights of third parties.</li>
                            <li>Distribute malware, spyware, or any harmful code.</li>
                            <li>Attempt to gain unauthorized access to any system, network, or data.</li>
                            <li>Use the Service for any commercial spam or bulk communications.</li>
                            <li>Violate any applicable local, national, or international law or regulation.</li>
                        </ul>
                        Violation of these rules may result in immediate account suspension or termination without refund.
                    </Section>

                    <Section title="5. User Content & Data Ownership">
                        You retain full ownership of all content you create and store on the Service ("User Content"). By using the Service, you grant Crevio a limited, non-exclusive, worldwide, royalty-free licence solely to store, transmit, and display your User Content for the purpose of providing the Service to you. We do not sell, share, or use your content for advertising.
                    </Section>

                    <Section title="6. Privacy & Data Processing">
                        Our Privacy Policy (incorporated herein by reference) explains how we collect, use, and protect your personal data. Key points:
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                            <li><strong>Data we collect:</strong> Name, email address, encrypted password, user-generated content (notes, tasks), usage analytics, and device/browser information.</li>
                            <li><strong>How we use it:</strong> To provide, maintain, and improve the Service; to send transactional emails (OTP, account alerts); and for billing purposes.</li>
                            <li><strong>Data storage:</strong> Data is stored on secured cloud infrastructure (Aiven MySQL, Render). We use industry-standard encryption (TLS in transit, AES-256 at rest).</li>
                            <li><strong>GDPR (EU users):</strong> You have the right to access, rectify, export, or delete your data at any time. Contact us at support@crevio.in to exercise these rights.</li>
                            <li><strong>India DPDP Act 2023:</strong> We comply with the Digital Personal Data Protection Act, 2023. Your data is processed with your consent and for lawful purposes only.</li>
                            <li><strong>Data retention:</strong> Account data is retained for 90 days after deletion request before permanent removal.</li>
                            <li><strong>Third parties:</strong> We may share data with payment processors (Razorpay) strictly for billing. No data is sold to advertisers.</li>
                        </ul>
                    </Section>

                    <Section title="7. Payments & Subscriptions">
                        Pro Plan subscriptions are billed monthly. Payments are processed securely via Razorpay. By subscribing you authorise recurring charges. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are handled on a case-by-case basis within 7 days of charge at our discretion.
                    </Section>

                    <Section title="8. Intellectual Property">
                        The Service, including its software, design, trademarks, and branding ("TaskFlow", "Crevio"), is the exclusive property of Crevio and is protected under applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works of any part of the Service without prior written consent.
                    </Section>

                    <Section title="9. Limitation of Liability">
                        To the maximum extent permitted by law, Crevio and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from: (a) your use of or inability to use the Service; (b) any content on the Service; (c) unauthorized access to or alteration of your transmissions or data. Our total aggregate liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
                    </Section>

                    <Section title="10. Disclaimer of Warranties">
                        The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express or implied, including fitness for a particular purpose, merchantability, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure. You use the Service at your own risk.
                    </Section>

                    <Section title="11. Termination">
                        We reserve the right to suspend or terminate your account at any time for violation of these Terms, suspected fraud, or for any other reason at our sole discretion. You may delete your account at any time from your Profile Settings.
                    </Section>

                    <Section title="12. Changes to Terms">
                        We may update these Terms from time to time. We will notify you of material changes via email or an in-app banner. Continued use of the Service after changes constitutes acceptance of the new Terms.
                    </Section>

                    <Section title="13. Governing Law & Disputes">
                        These Terms are governed by the laws of India. Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration under the Arbitration and Conciliation Act, 1996 (India), or the applicable courts of Bhopal, Madhya Pradesh, India.
                    </Section>

                    <Section title="14. Contact">
                        For questions, data requests, or legal notices, contact us at:
                        <div style={{ marginTop: 8, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: t.mono, fontSize: 12, color: t.t1 }}>
                            Crevio · support@crevio.in
                        </div>
                    </Section>

                    {!scrolled && (
                        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: t.t3 }}>
                            ↓ Scroll to the bottom to accept
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px',
                    borderTop: `1px solid ${t.border}`,
                    display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center',
                }}>
                    <button onClick={onDecline} style={{
                        padding: '10px 20px', background: 'transparent',
                        border: `1px solid ${t.border}`, borderRadius: 10,
                        color: t.t2, fontSize: 13, fontFamily: t.disp, cursor: 'pointer',
                    }}>Decline</button>
                    <button onClick={onAccept} disabled={!scrolled} style={{
                        padding: '10px 24px',
                        background: scrolled ? t.accent : t.border,
                        border: 'none', borderRadius: 10,
                        color: scrolled ? '#060B12' : t.t3,
                        fontSize: 13, fontWeight: 700, fontFamily: t.disp,
                        cursor: scrolled ? 'pointer' : 'not-allowed',
                        transition: 'all .25s',
                    }}>
                        {scrolled ? 'I Accept & Create Account →' : 'Read to the bottom to accept'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DARK.t1, marginBottom: 6 }}>{title}</div>
            <div style={{ color: DARK.t2, fontSize: 13, lineHeight: 1.7 }}>{children}</div>
        </div>
    );
}
