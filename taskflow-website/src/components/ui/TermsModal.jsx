export default function TermsModal({ t, onClose }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "#000000AA", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="popIn" style={{
                background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, width: 700, maxWidth: "90%",
                maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column"
            }}>
                {/* Header */}
                <div style={{ padding: "24px 30px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: t.t1, letterSpacing: "-0.5px" }}>Terms of Service & Privacy Policy</div>
                        <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono }}>TaskFlow Demo Project</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>

                {/* Content */}
                <div style={{ padding: "30px", overflowY: "auto", flex: 1, fontSize: 14, color: t.t2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 24 }}>
                    <section>
                        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: t.t1 }}>1. Portfolio Project Status</h3>
                        <p style={{ margin: 0 }}>
                            TaskFlow is a personal portfolio and demonstration project. It is not a commercial product. The software is provided "as is", without warranty of any kind.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: t.t1 }}>2. Data Persistence & Privacy</h3>
                        <p style={{ margin: 0 }}>
                            While you may create an account and store data, please be aware that data persistence is not guaranteed. Databases may be reset or wiped at any time. Do not store sensitive, confidential, or critical information on this platform.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: t.t1 }}>3. Acceptable Use</h3>
                        <p style={{ margin: 0 }}>
                            Please use this platform responsibly as a demonstration. Do not attempt to overload the system, perform automated scraping, or upload malicious content.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: t.t1 }}>4. Contact</h3>
                        <p style={{ margin: 0 }}>
                            For inquiries related to this portfolio project, you can contact the author via the GitHub repository or the contact information provided on the author's personal website.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div style={{ padding: "20px 30px", borderTop: `1px solid ${t.border}`, background: t.card, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{
                        padding: "10px 24px", background: t.accent, color: "#000", border: "none",
                        borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: t.disp
                    }}>
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}
