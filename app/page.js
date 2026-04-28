"use client";

import { useState, useEffect } from 'react';

const SECTIONS = [
  {
    id: 'sensemaking',
    title: 'Sensemaking',
    subtitle: 'BANI Fitness — perceive reality early and accurately',
    questions: [
      'I trust weak signals over formal reports.',
      'I act before data feels "complete."',
      'Anxiety in the system increases my clarity, not my hesitation.',
      'I can name what is ending before others see decline.',
    ]
  },
  {
    id: 'agency',
    title: 'Agency & Ownership',
    subtitle: 'Founder Posture — absorb downside personally',
    questions: [
      'I am comfortable making decisions that cannot be delegated.',
      'I do not hide behind process when outcomes are uncertain.',
      'I feel responsible even when authority is ambiguous.',
      'I step forward when others hesitate, without being asked.',
    ]
  },
  {
    id: 'paradox',
    title: 'Paradox Navigation',
    subtitle: 'RUPT Mastery — operate in tension without collapse',
    questions: [
      'I can pursue speed and quality simultaneously.',
      'I do not need contradictions resolved to move forward.',
      'I treat disagreement as signal, not friction.',
      'I am comfortable being misunderstood temporarily.',
    ]
  },
  {
    id: 'system',
    title: 'System Creation',
    subtitle: 'ALIVE Capability — design for emergence',
    questions: [
      'I design environments, not instructions.',
      'I expect systems to behave unpredictably—and plan for it.',
      'I think in incentives, feedback loops, and second-order effects.',
      'I build platforms others can adapt without me.',
    ]
  }
];

const CATEGORIES = [
  { min: 0,   max: 39,  label: 'Legacy Leader',         insight: 'High collapse risk. Your strengths are rooted in stability and structure — entrepreneurial conditions will demand a sharper tolerance for uncertainty and distributed ownership.' },
  { min: 40,  max: 69,  label: 'Transitional Leader',   insight: 'You operate effectively in defined contexts and are beginning to develop the adaptive instincts that founder-grade environments demand.' },
  { min: 70,  max: 89,  label: 'Entrepreneurial Leader',insight: 'You consistently demonstrate founder-grade thinking: reading environments before others, owning outcomes, and designing for scale.' },
  { min: 90,  max: 112, label: 'Founder of Futures',    insight: 'You operate at the frontier — synthesising ambiguity into direction, building self-organising systems, and sustaining paradox as a creative tool.' },
];

const ARCHETYPES = [
  {
    id: 'optimizer',
    label: 'The Optimizer',
    condition: s => s.system >= 22 && s.agency <= 13,
    desc: 'High System, low Agency. You engineer brilliant systems but may hesitate to drive them forward yourself. Your superpower is scale; the growth edge is bold personal initiative.'
  },
  {
    id: 'visionary',
    label: 'The Visionary',
    condition: s => s.sensemaking >= 22 && s.agency <= 13,
    desc: 'High Sense, low Execution. You see what others miss, but translating vision into decisive action is the gap. Your ideas are your leverage — now claim the stage.'
  },
  {
    id: 'hero',
    label: 'The Hero',
    condition: s => s.agency >= 22 && s.system <= 13,
    desc: 'High Agency, low Systems. You run towards fires and get things done — but growth means building systems so not every fire needs you. The shift from doer to architect is your next chapter.'
  },
  {
    id: 'therapist',
    label: 'The Therapist',
    condition: s => s.paradox <= 13,
    desc: 'High Empathy, low Paradox. You\'re strongest in relationships and clarity, but tensions and contradictions stall your momentum. Embracing paradox as fuel — not friction — is your edge.'
  },
  {
    id: 'founder',
    label: 'The Founder',
    condition: () => true,   // fallback
    desc: 'Balanced strength across all four pillars — the rare combination of sensing, owning, navigating contradiction, and building for the long game. High EL readiness requires no red zones; you have none.'
  },
];

const FrameworkInfo = () => (
  <div className="framework-info">
    <div className="divider"></div>
    <div className="framework-content">
      <div className="framework-eyebrow">Diagnostic Framework</div>
      <h3 className="framework-title">Entrepreneurial Leadership Readiness Diagnostic (ELRD)</h3>
      <p className="framework-desc">
        This diagnostic measures cognitive load capacity under uncertainty. It assesses: 
        How leaders sense reality, how they decide without closure, how they absorb risk, and how they shape systems.
      </p>
      
      <div className="framework-eyebrow" style={{ marginTop: '24px' }}>Scoring Model: EL Readiness Index (ELRI)</div>
      <p className="framework-desc">Each pillar scored 0–28 and Total Score: 0–112</p>
      
      <div className="elri-table-wrap">
        <table className="elri-table">
          <thead>
            <tr>
              <th>ELRI Score</th>
              <th>Leadership Reality</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0–39</td><td>Legacy Leader (High Collapse Risk)</td></tr>
            <tr><td>40–69</td><td>Transitional Leader</td></tr>
            <tr><td>70–89</td><td>Entrepreneurial Leader</td></tr>
            <tr><td>90–112</td><td>Founder of Futures</td></tr>
          </tbody>
        </table>
      </div>

      <div className="framework-eyebrow" style={{ marginTop: '24px' }}>Leadership Failure Archetypes the Tool Reveals</div>
      <div className="archetypes-list" style={{ marginTop: '16px' }}>
         <div className="arch-item"><strong>The Optimizer:</strong> High System / Low Agency</div>
         <div className="arch-item"><strong>The Visionary:</strong> High Sense / Low Execution</div>
         <div className="arch-item"><strong>The Hero:</strong> High Agency / Low Systems</div>
         <div className="arch-item"><strong>The Therapist:</strong> High Empathy / Low Paradox</div>
         <div className="arch-item"><strong>The Founder:</strong> High across all four</div>
      </div>
    </div>
  </div>
);

export default function AssessmentPage() {
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', email: '' });
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  const totalQuestions = 16;
  const answeredCount = Object.keys(answers).length;
  const isReady = answeredCount >= totalQuestions && contact.name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email);

  const selectRating = (key, val) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
  };

  const computeScores = () => {
    const scores = {};
    SECTIONS.forEach(section => {
      scores[section.id] = section.questions.reduce((sum, _, qi) => {
        return sum + (answers[`${section.id}_${qi}`] || 0);
      }, 0);
    });
    scores.total = Object.values(scores).reduce((a, b) => a + b, 0);
    return scores;
  };

  const getHeat = (score) => {
    if (score >= 22) return { label: '🟢 High',   cls: 'heat-high',   bar: 'fill-green',  row: 'row-high' };
    if (score >= 14) return { label: '🟡 Medium', cls: 'heat-medium', bar: 'fill-yellow', row: 'row-medium' };
    return             { label: '🔴 Low',   cls: 'heat-low',    bar: 'fill-red',    row: 'row-low' };
  };

  const getCategory = (total) => {
    return CATEGORIES.find(c => total >= c.min && total <= c.max) || CATEGORIES[0];
  };

  const getArchetype = (scores) => {
    return ARCHETYPES.find(a => a.condition(scores)) || ARCHETYPES[ARCHETYPES.length - 1];
  };

  const handleSubmit = async () => {
    if (!isReady || submitting) return;
    setSubmitting(true);

    const scores = computeScores();
    const category = getCategory(scores.total);
    const archetype = getArchetype(scores);

    setResultsData({ scores, category, archetype });
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          scores,
          category: category.label,
          insight: category.insight,
          archetype: archetype.label,
          archetype_desc: archetype.desc
        }),
      });

      if (res.ok) {
        setEmailStatus({ ok: true, msg: `A copy of your results has been sent to ${contact.email}.` });
      } else {
        setEmailStatus({ ok: false, msg: 'Results saved, but email delivery failed. Please screenshot this page.' });
      }
    } catch (err) {
      setEmailStatus({ ok: false, msg: 'Error sending results. Please screenshot this page.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (showResults && resultsData) {
    const { scores, category, archetype } = resultsData;
    return (
      <div className="shell">
        <div id="results" className="visible">
          <div className="result-hero">
            <div className="result-badge">Here's your 'Entrepreneurial Leadership Readiness Assessment'</div>
            <div className="result-score-label">Total Score</div>
            <div className="result-score">{scores.total}<sub>/112</sub></div>
            <div className="result-category">{category.label}</div>
            <p className="result-insight">{category.insight}</p>
          </div>

          <FrameworkInfo />

          <div className="results-grid">
            {SECTIONS.map((section, i) => {
              const score = scores[section.id];
              const heat = getHeat(score);
              const pct = (score / 28) * 100;
              return (
                <div className="pillar-card" key={section.id} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="pillar-name">{section.title}</div>
                  <div className="pillar-score">{score}<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: '400' }}>/28</span></div>
                  <div className="pillar-bar-bg">
                    <div className={`pillar-bar-fill ${heat.bar}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className={`heat-pill ${heat.cls}`}>{heat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="heatmap-section">
            <div className="section-label">Diagnostic Heat Map — Interpretive Layer</div>
            <div className="heatgrid">
              <div></div>
              <div className="heatgrid-head">Low</div>
              <div className="heatgrid-head">Medium</div>
              <div className="heatgrid-head">High</div>
              {SECTIONS.map(section => {
                const score = scores[section.id];
                const level = score >= 22 ? 'high' : score >= 14 ? 'medium' : 'low';
                return (
                  <div key={section.id} style={{ display: 'contents' }}>
                    <div className="heatgrid-row-label">{section.title}</div>
                    {['low', 'medium', 'high'].map(lvl => (
                      <div key={lvl} className={`heatgrid-cell lvl-${lvl} ${lvl === level ? 'active' : ''}`}>
                        {lvl === level ? (lvl === 'high' ? '🟢' : lvl === 'medium' ? '🟨' : '🟥') : ''}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="heat-key-insight">
              <strong>Key Insight</strong>
              High EL readiness requires no red zones. One weak pillar creates systemic fragility.
            </div>
          </div>

          <div className="archetype-card">
            <div className="archetype-eyebrow">Your Result: Leadership Failure Archetype</div>
            <div className="archetype-name">The <span className="archetype-accent">{archetype.label.replace('The ', '')}</span></div>
            <p className="archetype-desc">{archetype.desc}</p>
          </div>



          {emailStatus && (
            <div className={`email-status ${emailStatus.ok ? 'ok' : 'warn'}`}>
              {emailStatus.msg}
            </div>
          )}

          <div className="retake-wrap">
            <button className="btn-retake" onClick={() => window.location.reload()}>
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div id="assessment">
        <div className="hero">
          <div className="hero-badge">Entrepreneurial Leadership Diagnostics</div>
          <h1>Are You Ready to Lead<br />Like a <em>Founder?</em></h1>
          <p>A 16-question diagnostic across the four pillars of entrepreneurial leadership.</p>
        </div>

        <FrameworkInfo />

        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{answeredCount} / {totalQuestions}</span>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {SECTIONS.map((section, si) => (
          <div className="section-card" key={section.id} style={{ animationDelay: `${si * 0.07}s` }}>
            <div className="section-header">
              <div className="section-num">{si + 1}</div>
              <div>
                <div className="section-title">{section.title}</div>
                <div className="section-subtitle">{section.subtitle}</div>
              </div>
            </div>
            {section.questions.map((qText, qi) => {
              const key = `${section.id}_${qi}`;
              return (
                <div className="question" key={key}>
                  <div className="question-text"><span className="q-index">Q{si * 4 + qi + 1}</span>{qText}</div>
                  <div className="rating-labels"><span>Strongly Disagree</span><span>Strongly Agree</span></div>
                  <div className="rating-group">
                    {[1, 2, 3, 4, 5, 6, 7].map(v => (
                      <button
                        key={v}
                        className={`rating-btn ${answers[key] === v ? 'selected' : ''}`}
                        onClick={() => selectRating(key, v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="section-card contact-card">
          <div className="section-header">
            <div className="section-num">5</div>
            <div>
              <div className="section-title">Get your results by email</div>
              <div className="section-subtitle">A copy will be sent to you and to the program director.</div>
            </div>
          </div>
          <div className="contact-grid">
            <div className="field">
              <span className="field-label">Full name</span>
              <input
                type="text"
                placeholder="Your full name"
                value={contact.name}
                onChange={e => setContact({ ...contact, name: e.target.value })}
              />
            </div>
            <div className="field">
              <span className="field-label">Email address</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={contact.email}
                onChange={e => setContact({ ...contact, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="submit-wrap">
          <button
            className="btn-submit"
            disabled={!isReady || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'View My Results & Email Them'}
          </button>
          <div className="submit-help">
            {!isReady ? 'Please answer all questions and provide contact details.' : 'Ready to submit!'}
          </div>
        </div>
      </div>
    </div>
  );
}
