import { useState } from "react";
import { feedbackApi } from "../../api/feedback.js";
import { I, IC } from "./Icon.jsx";
import { toast } from "./Toast.jsx";

export default function FeedbackModal({ t, onClose }) {
    const [msg, setMsg] = useState("");
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!msg.trim()) { toast("Please enter a message.", "error"); return; }
        setSubmitting(true);
        try {
            await feedbackApi.submit(rating, msg);
            toast("Feedback sent successfully!", "success");
            onClose();
        } catch (e) {
            toast("Failed to send feedback.", "error");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="slideDown" onClick={e => e.stopPropagation()} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, width: 400, maxWidth: "90%", padding: 24, boxShadow: t.shadow, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.t1, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 8 }}>
                        💬 Help & Feedback
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>
                
                <div>
                    <div style={{ fontSize: 12, color: t.t2, fontFamily: t.disp, marginBottom: 8 }}>How would you rate your experience?</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {[1,2,3,4,5].map(r => (
                            <button key={r} onClick={() => setRating(r)}
                                style={{
                                    flex: 1, height: 36, borderRadius: 8, cursor: "pointer", transition: "all .15s",
                                    background: rating === r ? t.accent + "22" : t.inset,
                                    border: `1px solid ${rating === r ? t.accent : t.border}`,
                                    color: rating === r ? t.accent : t.t2,
                                    fontSize: 14, fontWeight: 700, fontFamily: t.mono
                                }}>
                                {r}★
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: t.t2, fontFamily: t.disp, marginBottom: 8 }}>Tell us more...</div>
                    <textarea 
                        value={msg} onChange={e => setMsg(e.target.value)}
                        placeholder="What's on your mind? Found a bug? Have a feature request?"
                        style={{
                            width: "100%", height: 100, resize: "none", padding: "10px 14px", borderRadius: 10,
                            background: t.inset, border: `1px solid ${t.border}`, color: t.t1,
                            fontSize: 13, fontFamily: t.disp, outline: "none", boxSizing: "border-box"
                        }}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                    <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${t.border}`, color: t.t2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} style={{ padding: "8px 16px", borderRadius: 8, background: t.accent, border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? "Sending..." : "Send Feedback"}
                    </button>
                </div>
            </div>
        </div>
    );
}
