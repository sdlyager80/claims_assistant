import { useState, useEffect } from 'react';
import './RequirementsEngine.css';

/**
 * SA-006: Requirements Engine — Bloom v3 Design
 * Fully functional split-pane workbench with live status transitions,
 * party-scoped filtering, generate, approve, NIGO, waive, request, view.
 */
const RequirementsEngine = ({ claim, onGenerateRequirements, onGenerateLetter, onUploadDocument, onWaive }) => {
  const [selectedParty, setSelectedParty] = useState('ALL');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [localReqs, setLocalReqs]         = useState([]);
  const [toast, setToast]                 = useState(null);   // { msg, type }
  const [nigoModal, setNigoModal]         = useState(null);   // { reqId, reqName, reason }
  const [viewDoc, setViewDoc]             = useState(null);   // { docName, reqName }
  const [requestedSet, setRequestedSet]   = useState(new Set());
  const [generating, setGenerating]       = useState(false);

  // ── Normalise status string to lowercase key ────────────────
  const norm = (s) => {
    const low = (s || 'pending').toLowerCase();
    if (low === 'not_satisfied') return 'nigo';
    if (low === 'in_review')     return 'in_review';
    return low;
  };

  // ── Seed local reqs from claim prop ────────────────────────
  useEffect(() => {
    if (claim?.requirements?.length) {
      setLocalReqs(claim.requirements.map(r => ({
        ...r,
        status: norm(r.status),
        pri: r.isMandatory ? 'mandatory' : 'conditional',
      })));
    } else {
      setLocalReqs([]);
    }
  }, [claim?.id]); // re-seed only when claim changes

  if (!claim) return null;

  const reqs = localReqs;

  // ── Toast helper ────────────────────────────────────────────
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Mutate a requirement in local state ─────────────────────
  const updateReq = (id, patch) =>
    setLocalReqs(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  // ── Build parties list ──────────────────────────────────────
  const parties = [
    { id: 'ALL', name: 'All Parties', role: 'Overview', initials: '👥', avCls: 'av-system', rlCls: 'rl-system' }
  ];

  const roleAv = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('beneficiar')) return { av: 'av-bene', rl: 'rl-bene' };
    if (r.includes('physician') || r.includes('provider')) return { av: 'av-provider', rl: 'rl-provider' };
    if (r.includes('employer')) return { av: 'av-employer', rl: 'rl-employer' };
    return { av: 'av-system', rl: 'rl-system' };
  };

  const namedParties = (claim.parties || []).filter(p =>
    p.role && !p.role.toLowerCase().includes('notifier')
  );

  if (namedParties.length > 0) {
    namedParties.forEach((p, i) => {
      const { av, rl } = roleAv(p.role);
      const initials = (p.name || 'P')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      parties.push({
        id: p.id || `P${i}`,
        name: p.name,
        role: p.role || 'Party',
        initials,
        avCls: av,
        rlCls: rl,
        _partyId: p.id || `P${i}`
      });
    });
  } else {
    // Derive virtual groups from requirement levels
    const claimReqs  = reqs.filter(r => r.level === 'claim' || !r.level);
    const policyReqs = reqs.filter(r => r.level === 'policy');
    const partyReqs  = reqs.filter(r => r.level === 'party');
    if (claimReqs.length)  parties.push({ id: 'CLAIM',  name: 'Claim Level',  role: 'Claim Requirements',  initials: '📋', avCls: 'av-system', rlCls: 'rl-system', _reqs: claimReqs });
    if (policyReqs.length) parties.push({ id: 'POLICY', name: 'Policy Level', role: 'Policy Requirements', initials: '🏛',  avCls: 'av-system', rlCls: 'rl-system', _reqs: policyReqs });
    if (partyReqs.length)  parties.push({ id: 'PARTY',  name: 'Party Level',  role: 'Party Requirements',  initials: '👤', avCls: 'av-bene',   rlCls: 'rl-bene',   _reqs: partyReqs });
  }

  // ── Per-party requirement resolver ──────────────────────────
  const getPartyReqs = (partyId) => {
    if (partyId === 'ALL') return reqs;
    const p = parties.find(x => x.id === partyId);
    if (p?._reqs)    return p._reqs;
    if (p?._partyId) return reqs.filter(r => r.partyId === p._partyId);
    return reqs.filter(r => r.partyId === partyId);
  };

  // ── Global stats ────────────────────────────────────────────
  const totalReqs   = reqs.length;
  const satCount    = reqs.filter(r => r.status === 'satisfied').length;
  const pendCount   = reqs.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const nigoCount   = reqs.filter(r => r.status === 'nigo').length;
  const waivedCount = reqs.filter(r => r.status === 'waived').length;
  const globalPct   = totalReqs ? Math.round(satCount / totalReqs * 100) : 0;

  // ── Selected party reqs & stats ─────────────────────────────
  const selParty    = parties.find(p => p.id === selectedParty);
  const selPr       = getPartyReqs(selectedParty);
  const selSat      = selPr.filter(r => r.status === 'satisfied').length;
  const selPend     = selPr.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const selNigo     = selPr.filter(r => r.status === 'nigo').length;

  let displayReqs = selPr;
  if (statusFilter !== 'all') displayReqs = displayReqs.filter(r => r.status === statusFilter);

  const grouped = {
    party:  displayReqs.filter(r => r.level === 'party'),
    claim:  displayReqs.filter(r => r.level === 'claim' || !r.level),
    policy: displayReqs.filter(r => r.level === 'policy'),
  };

  // Filter bar counts (based on selected party, unfiltered)
  const fc = {
    all:       selPr.length,
    pending:   selPr.filter(r => r.status === 'pending').length,
    in_review: selPr.filter(r => r.status === 'in_review').length,
    satisfied: selPr.filter(r => r.status === 'satisfied').length,
    nigo:      selPr.filter(r => r.status === 'nigo').length,
    waived:    selPr.filter(r => r.status === 'waived').length,
  };

  // ── Party card stats helper ──────────────────────────────────
  const partyStats = (partyId) => {
    const pr     = getPartyReqs(partyId);
    const sat    = pr.filter(r => r.status === 'satisfied').length;
    const pend   = pr.filter(r => r.status === 'pending' || r.status === 'in_review').length;
    const nigo   = pr.filter(r => r.status === 'nigo').length;
    const waived = pr.filter(r => r.status === 'waived').length;
    const pct    = pr.length ? Math.round(sat / pr.length * 100) : 0;
    const fill   = pct === 100 ? 'var(--re-green)' : nigo > 0 ? 'var(--re-red)' : 'var(--re-blue)';
    return { sat, pend, nigo, waived, pct, total: pr.length, fill };
  };

  // ── Label / icon helpers ─────────────────────────────────────
  const sIcon  = s => ({ pending: '⏳', in_review: '🔍', satisfied: '✅', nigo: '❌', waived: '➖' }[s] || '');
  const sLabel = s => ({ pending: 'Pending', in_review: 'In Review', satisfied: 'Satisfied', nigo: 'NIGO', waived: 'Waived' }[s] || s);

  const dueTag = (req) => {
    if (!req.dueDate) return null;
    const raw = req.dueDate.includes('T') ? req.dueDate : req.dueDate + 'T00:00:00';
    const d   = Math.ceil((new Date(raw) - new Date()) / 86400000);
    if (req.status === 'satisfied' || req.status === 'waived')
      return <span className="rc-meta-item">📅 {req.dueDate.split('T')[0]}</span>;
    if (d < 0)   return <span className="rc-meta-item overdue">🚨 {Math.abs(d)}d overdue</span>;
    if (d <= 3)  return <span className="rc-meta-item soon">⚠️ {d}d left</span>;
    return <span className="rc-meta-item">📅 {req.dueDate.split('T')[0]} · {d}d</span>;
  };

  const confTag = (req) => {
    const conf = req.metadata?.confidenceScore;
    if (!conf) return null;
    const p   = Math.round(conf * 100);
    const cls = p >= 90 ? 'rc-conf-high' : p >= 70 ? 'rc-conf-med' : 'rc-conf-low';
    return (
      <span className={`rc-conf ${cls}`}>
        IDP <span className="rc-conf-bar"><span className="rc-conf-fill" style={{ width: `${p}%` }} /></span> {p}%
      </span>
    );
  };

  // ── Action handlers ──────────────────────────────────────────
  const handleApprove = (req) => {
    updateReq(req.id, {
      status: 'satisfied',
      satisfiedDate: new Date().toISOString().split('T')[0],
    });
    showToast(`✅ "${req.name}" approved`, 'success');
    if (statusFilter === 'in_review') setStatusFilter('all');
  };

  const handleNIGO = (req) => {
    setNigoModal({ reqId: req.id, reqName: req.name, reason: '' });
  };

  const confirmNIGO = () => {
    const existing = reqs.find(r => r.id === nigoModal.reqId);
    updateReq(nigoModal.reqId, {
      status: 'nigo',
      metadata: {
        ...(existing?.metadata || {}),
        reason: nigoModal.reason || 'Does not meet requirements — please resubmit',
      },
    });
    showToast(`❌ "${nigoModal.reqName}" marked NIGO`, 'error');
    setNigoModal(null);
    if (statusFilter === 'in_review') setStatusFilter('all');
  };

  const handleWaive = (req) => {
    updateReq(req.id, { status: 'waived' });
    showToast(`➖ "${req.name}" waived`, 'info');
    if (onWaive) onWaive(req);
  };

  const handleRequest = (req) => {
    setRequestedSet(prev => new Set([...prev, req.id]));
    showToast(`📧 Request sent for "${req.name}"`, 'success');
  };

  const handleView = (doc, req) => {
    setViewDoc({ docName: doc.name, reqName: req.name });
  };

  const handleUpload = (req) => {
    if (onUploadDocument) onUploadDocument(req);
    showToast(`📤 Opening upload for "${req.name}"`, 'info');
  };

  const handleGenerateLetter = () => {
    showToast('📧 NIGO letter queued for generation', 'info');
    if (onGenerateLetter) onGenerateLetter();
  };

  // ── Generate demo requirements ───────────────────────────────
  const handleGenerate = async () => {
    if (reqs.length > 0) {
      showToast('Requirements already generated — reset claim to regenerate', 'info');
      return;
    }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1400)); // simulate AI processing

    const today = new Date();
    const fmtDate = (d) => new Date(today.getTime() + d * 86400000).toISOString().split('T')[0];

    // Get party IDs from claim for linking
    const benePartyId = (claim.parties || []).find(p =>
      p.role?.toLowerCase().includes('beneficiar')
    )?.id;

    const generated = [
      // ── Claim level ──
      { id: 'gen-1', level: 'claim', name: 'Certified Death Certificate',
        description: 'Official death certificate from state vital records',
        status: 'pending', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(7), documents: [], metadata: {} },

      { id: 'gen-2', level: 'claim', name: 'Claimant Statement of Claim',
        description: 'Signed and notarised statement of claim form (DXC Form 1042)',
        status: 'in_review', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(7),
        documents: [{ id: 'doc-gen-2', name: 'claimant_statement_draft.pdf' }],
        metadata: { confidenceScore: 0.78, reason: 'Signature verification in progress — awaiting notary confirmation' } },

      { id: 'gen-3', level: 'claim', name: 'Government-Issued Photo ID',
        description: "Claimant's driver's license, passport, or state ID",
        status: 'pending', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(3), documents: [], metadata: {} },

      { id: 'gen-4', level: 'claim', name: 'Attending Physician Statement',
        description: 'APS from treating physician confirming cause and manner of death',
        status: 'nigo', isMandatory: false, pri: 'conditional',
        dueDate: fmtDate(7),
        documents: [{ id: 'doc-gen-4', name: 'aps_form_scan.pdf' }],
        metadata: { confidenceScore: 0.44, reason: 'Document is illegible — please resubmit a higher-quality scan (300 dpi minimum)' } },

      // ── Policy level ──
      { id: 'gen-5', level: 'policy', name: 'Policy In-Force Verification',
        description: 'Verify policy status, coverage amounts, and premium currency at date of death',
        status: 'satisfied', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(3),
        satisfiedDate: today.toISOString().split('T')[0],
        documents: [],
        metadata: { verificationSource: 'Policy Admin System', confidenceScore: 0.99 } },

      { id: 'gen-6', level: 'policy', name: 'Contestability Period Check',
        description: 'Confirm policy is past 2-year contestability window',
        status: 'satisfied', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(3),
        satisfiedDate: today.toISOString().split('T')[0],
        documents: [],
        metadata: { verificationSource: 'Policy Admin System', confidenceScore: 0.99 } },

      // ── Party level ──
      { id: 'gen-7', level: 'party', name: 'Beneficiary Identity Verification',
        description: 'SSN verification, identity confirmation, OFAC/watchlist screening',
        status: 'in_review', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(7), documents: [],
        partyId: benePartyId,
        metadata: { confidenceScore: 0.82 } },

      { id: 'gen-8', level: 'party', name: 'IRS Form W-9',
        description: 'W-9 form required for tax reporting and 1099-MISC generation',
        status: 'pending', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(10), documents: [],
        partyId: benePartyId,
        metadata: {} },

      { id: 'gen-9', level: 'party', name: 'Payment Election Form',
        description: 'ACH direct deposit or check payment selection with bank details',
        status: 'pending', isMandatory: true, pri: 'mandatory',
        dueDate: fmtDate(10), documents: [],
        partyId: benePartyId,
        metadata: { paymentMethod: 'Not selected' } },
    ];

    setLocalReqs(generated);
    setGenerating(false);
    setStatusFilter('all');
    showToast(`✨ ${generated.length} requirements generated by Decision Table Engine`, 'success');
    if (onGenerateRequirements) onGenerateRequirements();
  };

  // ── Render requirement card ──────────────────────────────────
  const renderCard = (req, idx) => {
    const docs = req.documents || [];
    const wasRequested = requestedSet.has(req.id);

    return (
      <div key={req.id || idx} className={`req-card rc-${req.status}`} style={{ animationDelay: `${idx * 0.04}s` }}>
        <div className="rc-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="rc-name">{req.name}</div>
            {req.description && <div className="rc-desc">{req.description}</div>}
          </div>
          <span className={`rc-badge b-${req.status}`}>{sIcon(req.status)} {sLabel(req.status)}</span>
        </div>

        <div className="rc-meta">
          <span className={`rc-priority ${req.pri === 'mandatory' ? 'pri-m' : 'pri-c'}`}>{req.pri}</span>
          {dueTag(req)}
          {docs.length > 0
            ? <span className="rc-source" onClick={() => handleView(docs[0], req)}>📎 {docs[0].name}</span>
            : <span style={{ fontSize: '11px', color: 'var(--re-text-3)', fontStyle: 'italic' }}>No document attached</span>}
          {confTag(req)}
          {req.satisfiedDate && (
            <span className="rc-meta-item">✅ Satisfied {req.satisfiedDate}</span>
          )}
        </div>

        {req.metadata?.reason && (
          <div className="rc-note">{req.metadata.reason}</div>
        )}

        <div className="rc-actions">
          {/* Upload — for any open requirement */}
          {req.status !== 'satisfied' && req.status !== 'waived' && (
            <button className="rc-btn primary" onClick={() => handleUpload(req)}>
              📤 Upload
            </button>
          )}

          {/* Request — send request to claimant */}
          {req.status !== 'satisfied' && req.status !== 'waived' && (
            <button
              className={`rc-btn${wasRequested ? ' success' : ''}`}
              onClick={() => handleRequest(req)}
              disabled={wasRequested}
            >
              {wasRequested ? '✅ Requested' : '📧 Request'}
            </button>
          )}

          {/* View doc — when document attached */}
          {docs.length > 0 && (
            <button className="rc-btn" onClick={() => handleView(docs[0], req)}>
              👁 View
            </button>
          )}

          {/* Approve / NIGO — only for in_review */}
          {req.status === 'in_review' && (
            <>
              <button className="rc-btn success" onClick={() => handleApprove(req)}>✅ Approve</button>
              <button className="rc-btn danger"  onClick={() => handleNIGO(req)}>❌ NIGO</button>
            </>
          )}

          {/* Waive — non-mandatory open reqs */}
          {!req.isMandatory && req.status !== 'satisfied' && req.status !== 'waived' && (
            <button className="rc-btn" onClick={() => handleWaive(req)}>➖ Waive</button>
          )}
        </div>
      </div>
    );
  };

  // ── Render section with header + cards ───────────────────────
  const renderSection = (icon, label, sReqs) => {
    if (!sReqs.length) return null;
    const sat = sReqs.filter(r => r.status === 'satisfied').length;
    return (
      <div className="req-section">
        <div className="req-section-header">
          <span className="rsh-icon">{icon}</span>
          <span className="rsh-label">{label}</span>
          <span className="rsh-count">{sat}/{sReqs.length}</span>
          <div className="rsh-line" />
        </div>
        {sReqs.map((r, i) => renderCard(r, i))}
      </div>
    );
  };

  const hasContent = displayReqs.length > 0;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="re-split">

      {/* ══ LEFT: PARTY PANEL ══ */}
      <div className="re-party-panel">
        <div className="re-pp-header">
          <div>
            <div className="re-pp-title">👥 Claim Parties</div>
            <div className="re-pp-subtitle">Click a party to filter requirements</div>
          </div>
          <button
            className="re-gen-sm"
            onClick={handleGenerate}
            disabled={generating}
            title={reqs.length > 0 ? 'Requirements already generated' : 'Generate requirements'}
          >
            {generating ? '⏳' : '✨'} {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {/* Global progress */}
        <div className="re-pp-progress">
          <div className="re-pp-prog-track">
            <div className="re-pp-prog-fill" style={{ width: `${globalPct}%` }} />
          </div>
          <div className="re-pp-prog-stats">
            {satCount    > 0 && <span className="re-pp-stat re-stat-sat">✅ {satCount}</span>}
            {pendCount   > 0 && <span className="re-pp-stat re-stat-pend">⏳ {pendCount}</span>}
            {nigoCount   > 0 && <span className="re-pp-stat re-stat-nigo">❌ {nigoCount}</span>}
            {waivedCount > 0 && <span className="re-pp-stat re-stat-waived">➖ {waivedCount}</span>}
            {totalReqs === 0  && <span className="re-pp-stat re-stat-pend">No requirements</span>}
          </div>
        </div>

        {/* Party cards */}
        <div className="re-pp-list">
          {parties.map(p => {
            const s      = partyStats(p.id);
            const active = selectedParty === p.id;
            return (
              <div
                key={p.id}
                className={`re-pp-card${active ? ' active' : ''}`}
                onClick={() => { setSelectedParty(p.id); setStatusFilter('all'); }}
              >
                <div className="re-pp-card-top">
                  <div className={`re-pp-avatar ${p.avCls}`}>{p.initials}</div>
                  <div>
                    <div className="re-pp-name">{p.name}</div>
                    <span className={`re-pp-role ${p.rlCls}`}>{p.role}</span>
                  </div>
                </div>
                {s.total > 0 && (
                  <>
                    <div className="re-pp-card-bottom">
                      <div className="re-pp-mini-bar">
                        <div className="re-pp-mini-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                      </div>
                      <div className="re-pp-mini-pct">{s.sat}/{s.total}</div>
                    </div>
                    <div className="re-pp-mini-counts">
                      {s.sat    > 0 && <span className="re-pp-mc re-stat-sat">✅{s.sat}</span>}
                      {s.pend   > 0 && <span className="re-pp-mc re-stat-pend">⏳{s.pend}</span>}
                      {s.nigo   > 0 && <span className="re-pp-mc re-stat-nigo">❌{s.nigo}</span>}
                      {s.waived > 0 && <span className="re-pp-mc re-stat-waived">➖{s.waived}</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ RIGHT: REQUIREMENTS PANEL ══ */}
      <div className="re-req-panel">

        {/* Header — scoped to selected party */}
        <div className="re-rp-header">
          <div className={`re-rp-avatar ${selParty?.avCls || 'av-system'}`}>
            {selParty?.initials || '👥'}
          </div>
          <div className="re-rp-info">
            <div className="re-rp-name">{selParty?.name || 'All Parties'}</div>
            <div className="re-rp-role">
              {selParty?.role} · {selPr.length} requirement{selPr.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="re-rp-stats">
            <div className="re-rp-stat">
              <div className="re-rp-stat-v" style={{ color: 'var(--re-green)' }}>{selSat}</div>
              <div className="re-rp-stat-l">Satisfied</div>
            </div>
            <div className="re-rp-stat">
              <div className="re-rp-stat-v" style={{ color: 'var(--re-yellow)' }}>{selPend}</div>
              <div className="re-rp-stat-l">Pending</div>
            </div>
            {selNigo > 0 && (
              <div className="re-rp-stat re-stat-nigo-border">
                <div className="re-rp-stat-v" style={{ color: 'var(--re-red)' }}>{selNigo}</div>
                <div className="re-rp-stat-l">NIGO</div>
              </div>
            )}
          </div>
          {nigoCount > 0 && (
            <button
              className="rc-btn"
              style={{ marginLeft: '8px', flexShrink: 0 }}
              onClick={handleGenerateLetter}
            >
              📧 Generate Letter
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="re-rp-filter-bar">
          {[
            { key: 'all',       label: 'All',         count: fc.all },
            { key: 'pending',   label: '⏳ Pending',   count: fc.pending },
            { key: 'in_review', label: '🔍 In Review', count: fc.in_review },
            { key: 'satisfied', label: '✅ Satisfied', count: fc.satisfied },
            ...(fc.nigo   > 0 ? [{ key: 'nigo',   label: '❌ NIGO',   count: fc.nigo }]   : []),
            ...(fc.waived > 0 ? [{ key: 'waived', label: '➖ Waived', count: fc.waived }] : []),
          ].map(f => (
            <button
              key={f.key}
              className={`rf-btn${statusFilter === f.key ? ' active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label} <span className="ct">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="re-rp-body">
          {!hasContent ? (
            totalReqs === 0 ? (
              <div className="re-empty">
                <div className="re-empty-icon">{generating ? '⏳' : '📋'}</div>
                <p>{generating ? 'Running Decision Table Engine…' : 'No requirements generated yet'}</p>
                {!generating && (
                  <button className="re-gen-lg" onClick={handleGenerate}>
                    ✨ Generate Requirements
                  </button>
                )}
              </div>
            ) : (
              <div className="re-empty">
                <div className="re-empty-icon">🔍</div>
                <p>No requirements match this filter</p>
                <button className="re-gen-lg" onClick={() => setStatusFilter('all')}>
                  Show all
                </button>
              </div>
            )
          ) : (
            <>
              {renderSection('👤', 'Party Level Requirements',  grouped.party)}
              {renderSection('📋', 'Claim Level Requirements',  grouped.claim)}
              {renderSection('🏛',  'Policy Level Requirements', grouped.policy)}
            </>
          )}
        </div>
      </div>

      {/* ══ NIGO REASON MODAL ══ */}
      {nigoModal && (
        <div className="re-overlay" onClick={() => setNigoModal(null)}>
          <div className="re-modal" onClick={e => e.stopPropagation()}>
            <div className="re-modal-header">
              <span>❌ Mark as NIGO</span>
              <button className="re-modal-close" onClick={() => setNigoModal(null)}>✕</button>
            </div>
            <div className="re-modal-body">
              <p className="re-modal-req-name">"{nigoModal.reqName}"</p>
              <label className="re-modal-label">Reason for NIGO (optional)</label>
              <textarea
                className="re-modal-textarea"
                placeholder="e.g. Document is illegible, missing signature, wrong form version…"
                value={nigoModal.reason}
                onChange={e => setNigoModal(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                autoFocus
              />
            </div>
            <div className="re-modal-footer">
              <button className="rc-btn" onClick={() => setNigoModal(null)}>Cancel</button>
              <button className="rc-btn danger" onClick={confirmNIGO}>❌ Confirm NIGO</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW DOCUMENT MODAL ══ */}
      {viewDoc && (
        <div className="re-overlay" onClick={() => setViewDoc(null)}>
          <div className="re-modal" onClick={e => e.stopPropagation()}>
            <div className="re-modal-header">
              <span>📎 Document Preview</span>
              <button className="re-modal-close" onClick={() => setViewDoc(null)}>✕</button>
            </div>
            <div className="re-modal-body">
              <p className="re-modal-req-name">{viewDoc.reqName}</p>
              <div className="re-doc-preview">
                <div className="re-doc-icon">📄</div>
                <div className="re-doc-name">{viewDoc.docName}</div>
                <div className="re-doc-note">
                  Document attached to this requirement.<br />
                  Use the Documents tab to manage and view uploaded files.
                </div>
              </div>
            </div>
            <div className="re-modal-footer">
              <button className="rc-btn" onClick={() => setViewDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div className={`re-toast re-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
};

export default RequirementsEngine;
