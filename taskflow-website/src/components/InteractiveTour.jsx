import React from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function InteractiveTour({ run, setRun, t }) {
    const steps = [
        {
            target: 'body',
            content: 'Welcome to TaskFlow! Let\'s take a quick tour to help you get started.',
            placement: 'center',
        },
        {
            target: '.sidebar-desktop',
            content: 'This is your navigation sidebar. Access your dashboard, tasks, notes, and settings here.',
            placement: 'right',
        },
        {
            target: '#topbar-capture-btn',
            content: 'Need to write something down quickly? Use this button to capture a new task from anywhere in the app.',
            placement: 'bottom',
        },
        {
            target: '.stats-grid',
            content: 'Your dashboard gives you a bird\'s-eye view of your day and upcoming tasks.',
            placement: 'bottom',
        }
    ];

    const CustomTooltip = ({
        continuous,
        index,
        step,
        backProps,
        closeProps,
        primaryProps,
        tooltipProps,
        isLastStep,
    }) => {
        return (
            <div {...tooltipProps} style={{
                background: t.card,
                border: `1px solid ${t.accent}44`,
                borderRadius: 16,
                padding: '24px',
                width: '320px',
                boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${t.accent}22`,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                fontFamily: t.disp,
            }}>
                <button {...closeProps} style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'none', border: 'none', color: t.t3,
                    fontSize: 20, cursor: 'pointer', lineHeight: 1
                }}>×</button>

                {step.title && (
                    <div style={{ fontSize: 18, fontWeight: 800, color: t.t1, paddingRight: 20 }}>
                        {step.title}
                    </div>
                )}
                <div style={{ fontSize: 14, color: t.t2, lineHeight: 1.5 }}>
                    {step.content}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === index ? t.accent : t.t3, opacity: i === index ? 1 : 0.3 }} />
                        ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                        {index > 0 && (
                            <button {...backProps} style={{
                                padding: '8px 14px', borderRadius: 8, background: 'transparent',
                                border: `1px solid ${t.border}`, color: t.t2, fontSize: 13,
                                fontWeight: 600, cursor: 'pointer', fontFamily: t.disp
                            }}>
                                Back
                            </button>
                        )}
                        <button {...primaryProps} style={{
                            padding: '8px 18px', borderRadius: 8, background: t.accent,
                            border: 'none', color: '#000', fontSize: 13,
                            fontWeight: 800, cursor: 'pointer', fontFamily: t.disp,
                            boxShadow: `0 4px 12px ${t.accent}44`
                        }}>
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            disableScrolling={true}
            tooltipComponent={CustomTooltip}
            styles={{
                options: {
                    arrowColor: t.card,
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 10000,
                }
            }}
            callback={(data) => {
                const { status } = data;
                if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
                    setRun(false);
                }
            }}
        />
    );
}
