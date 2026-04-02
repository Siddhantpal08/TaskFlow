import { useState, useEffect } from 'react';
import { teamApi } from '../api/team.js';
import { I, IC } from './ui/Icon.jsx';

const TreeNode = ({ node, t }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* The actual card */}
            <div className="hvrC" style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: '12px 16px',
                minWidth: 160,
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
                boxShadow: t.shadow,
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: t.inset,
                        border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 11, fontWeight: 700, color: t.t1
                    }}>
                        {node.assignee.initials}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.t1 }}>{node.assignee.name}</span>
                </div>
                <div style={{ fontSize: 13, color: t.t2, fontWeight: 600, marginBottom: 4 }}>{node.title}</div>
                <div style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    background: node.status === 'done' ? '#10B98122' : node.status === 'in_progress' ? '#F59E0B22' : t.inset,
                    color: node.status === 'done' ? '#10B981' : node.status === 'in_progress' ? '#F59E0B' : t.t3,
                    border: `1px solid ${node.status === 'done' ? '#10B98144' : node.status === 'in_progress' ? '#F59E0B44' : t.border}`
                }}>
                    {node.status.replace('_', ' ')}
                </div>
            </div>

            {/* Children container */}
            {node.children && node.children.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* Vertical line connecting parent to horizontal bar */}
                    <div style={{ width: 2, height: 20, background: t.border }}></div>

                    {/* Horizontal bar if multiple children */}
                    {node.children.length > 1 && (
                        <div style={{
                            display: 'flex', width: '100%', position: 'relative', justifyContent: 'space-between',
                        }}>
                            {/* We use a track bar for horizontal connections */}
                            <div style={{ position: 'absolute', top: 0, left: 'calc(50% / ' + node.children.length + ')', right: 'calc(50% / ' + node.children.length + ')', height: 2, background: t.border }}></div>
                        </div>
                    )}

                    {/* Render children horizontally */}
                    <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
                        {node.children.map((child, i) => (
                            <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingTop: node.children.length > 1 ? 0 : 0 }}>
                                {/* Vertical drops from horizontal bar to child */}
                                {node.children.length > 1 && <div style={{ width: 2, height: 20, background: t.border }}></div>}
                                <TreeNode node={child} t={t} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function HierarchyChart({ t }) {
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadDummyData = async () => {
        try {
            setLoading(true);
            const res = await teamApi.getDummyHierarchy();
            setTreeData(res.data.data);
        } catch (e) {
            console.error("Failed to load generic corporate hierarchy.", e);
        } finally {
            setLoading(false);
        }
    };

    if (!treeData && !loading) {
        return (
            <div style={{ padding: 20, background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, textAlign: 'center' }}>
                <I d={IC.team} sz={32} c={t.t3} style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, color: t.t1, margin: '0 0 8px 0' }}>Organizational Dummy Chart</h3>
                <p style={{ fontSize: 13, color: t.t2, margin: '0 0 16px 0', lineHeight: 1.6 }}>Generate a hierarchical view of delegated corporate tasks to see how reporting lines work in TaskFlow.</p>
                <button onClick={loadDummyData} style={{ background: t.accent, color: '#000', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>
                    Generate Demo Structure
                </button>
            </div>
        );
    }

    if (loading) return <div style={{ color: t.t3, fontSize: 13, padding: 20, textAlign: 'center' }}>Loading diagram...</div>;

    return (
        <div style={{ padding: '30px 20px', background: t.inset, borderRadius: 12, border: `1px solid ${t.border}`, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'min-content' }}>
                <TreeNode node={treeData} t={t} />
            </div>
        </div>
    );
}
