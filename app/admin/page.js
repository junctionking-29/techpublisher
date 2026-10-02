'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard active tab: 'articles' | 'codes' | 'settings'
  const [activeTab, setActiveTab] = useState('articles');

  // Messages
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // --------------------------------------------------------------------------
  // Data States
  // --------------------------------------------------------------------------
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null); // null = list, 'new' = creating, or article object

  const [codes, setCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [editingCode, setEditingCode] = useState(null); // null = list, 'new' = creating, or code object

  const [settings, setSettings] = useState({ default_wait_seconds: 8, scroll_seconds: 40 });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Helper to show alert with auto-dismiss
  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg((curr) => (curr?.text === text ? null : curr));
    }, 5000);
  };

  // --------------------------------------------------------------------------
  // Check auth session
  // --------------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // Fetch data callbacks
  // --------------------------------------------------------------------------
  const fetchArticles = useCallback(async () => {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      showAlert('error', `Failed to load articles: ${error.message}`);
    } else {
      setArticles(data || []);
    }
    setLoadingArticles(false);
  }, []);

  const fetchCodes = useCallback(async () => {
    setLoadingCodes(true);
    const { data, error } = await supabase
      .from('codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showAlert('error', `Failed to load codes: ${error.message}`);
    } else {
      setCodes(data || []);
    }
    setLoadingCodes(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      showAlert('error', `Failed to load settings: ${error.message}`);
    } else if (data) {
      setSettings({
        default_wait_seconds: data.default_wait_seconds,
        scroll_seconds: data.scroll_seconds,
      });
    }
    setLoadingSettings(false);
  }, []);

  useEffect(() => {
    if (session) {
      fetchArticles();
      fetchCodes();
      fetchSettings();
    }
  }, [session, fetchArticles, fetchCodes, fetchSettings]);

  // --------------------------------------------------------------------------
  // Auth Handlers
  // --------------------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    }
    setLoggingIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // --------------------------------------------------------------------------
  // Articles Handlers
  // --------------------------------------------------------------------------
  const handleArticleTitleChange = (val, formState, setFormState) => {
    const updated = { ...formState, title: val };
    // Auto-generate slug if it has not been manually detached or if creating new
    if (!formState.manualSlug) {
      updated.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    setFormState(updated);
  };

  const handleSaveArticle = async (e, formState) => {
    e.preventDefault();
    if (!formState.title || !formState.slug || !formState.body || !formState.category) {
      showAlert('error', 'Please fill in all required fields (Title, Slug, Category, Body).');
      return;
    }

    const payload = {
      title: formState.title.trim(),
      slug: formState.slug.trim(),
      excerpt: formState.excerpt?.trim() || '',
      body: formState.body.trim(),
      category: formState.category.trim().toLowerCase(),
      author: formState.author?.trim() || 'Editorial Team',
      cover_alt: formState.cover_alt?.trim() || null,
      status: formState.status || 'published',
    };

    const isNewArticle = editingArticle === 'new' || !editingArticle?.id;

    if (isNewArticle) {
      const { error } = await supabase.from('articles').insert([payload]);
      if (error) {
        showAlert('error', `Failed to create article: ${error.message}`);
        return;
      }
      showAlert('success', 'Article created successfully.');
    } else {
      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editingArticle.id);
      if (error) {
        showAlert('error', `Failed to update article: ${error.message}`);
        return;
      }
      showAlert('success', 'Article updated successfully.');
    }

    setEditingArticle(null);
    fetchArticles();
  };

  const handleDeleteArticle = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      showAlert('error', `Failed to delete article: ${error.message}`);
    } else {
      showAlert('success', 'Article deleted.');
      fetchArticles();
    }
  };

  const handleToggleArticleStatus = async (article) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('articles')
      .update({ status: nextStatus })
      .eq('id', article.id);

    if (error) {
      showAlert('error', `Status update failed: ${error.message}`);
    } else {
      showAlert('success', `Article marked as ${nextStatus}.`);
      fetchArticles();
    }
  };

  // --------------------------------------------------------------------------
  // Codes Handlers
  // --------------------------------------------------------------------------
  const handleSaveCode = async (e, formState) => {
    e.preventDefault();
    const normalizedCode = formState.code.trim().toUpperCase();
    let targetUrl = formState.target_url.trim();

    if (!normalizedCode) {
      showAlert('error', 'Code is required.');
      return;
    }

    if (!targetUrl.startsWith('https://') && !targetUrl.startsWith('http://')) {
      targetUrl = 'https://' + targetUrl;
    }

    let parsedWait = null;
    if (formState.wait_seconds !== '' && formState.wait_seconds !== null && formState.wait_seconds !== undefined) {
      parsedWait = parseInt(formState.wait_seconds, 10);
      if (isNaN(parsedWait) || parsedWait < 0 || parsedWait > 30) {
        showAlert('error', 'Wait seconds override must be between 0 and 30.');
        return;
      }
    }

    const payload = {
      code: normalizedCode,
      target_url: targetUrl,
      active: formState.active,
      wait_seconds: parsedWait,
    };

    const isNewCode = editingCode === 'new' || !editingCode?.code;

    if (isNewCode) {
      const { error } = await supabase.from('codes').insert([payload]);
      if (error) {
        showAlert('error', `Failed to create code: ${error.message}`);
        return;
      }
      showAlert('success', `Code ${normalizedCode} created.`);
    } else {
      const { error } = await supabase
        .from('codes')
        .update(payload)
        .eq('code', editingCode.code);
      if (error) {
        showAlert('error', `Failed to update code: ${error.message}`);
        return;
      }
      showAlert('success', `Code ${normalizedCode} updated.`);
    }

    setEditingCode(null);
    fetchCodes();
  };

  const handleDeleteCode = async (codeKey) => {
    if (!confirm(`Are you sure you want to delete code "${codeKey}"?`)) return;

    const { error } = await supabase.from('codes').delete().eq('code', codeKey);
    if (error) {
      showAlert('error', `Failed to delete code: ${error.message}`);
    } else {
      showAlert('success', 'Code deleted.');
      fetchCodes();
    }
  };

  const handleToggleCodeActive = async (codeObj) => {
    const nextActive = !codeObj.active;
    const { error } = await supabase
      .from('codes')
      .update({ active: nextActive })
      .eq('code', codeObj.code);

    if (error) {
      showAlert('error', `Failed to toggle code: ${error.message}`);
    } else {
      showAlert('success', `Code ${codeObj.code} is now ${nextActive ? 'Active' : 'Inactive'}.`);
      fetchCodes();
    }
  };

  // --------------------------------------------------------------------------
  // Settings Handler
  // --------------------------------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    const defaultWait = parseInt(settings.default_wait_seconds, 10);
    const scrollSec = parseInt(settings.scroll_seconds, 10);

    if (isNaN(defaultWait) || defaultWait < 0 || defaultWait > 30) {
      showAlert('error', 'Default wait seconds must be between 0 and 30.');
      setSavingSettings(false);
      return;
    }

    if (isNaN(scrollSec) || scrollSec < 0 || scrollSec > 180) {
      showAlert('error', 'Scroll seconds must be between 0 and 180.');
      setSavingSettings(false);
      return;
    }

    const { error } = await supabase
      .from('settings')
      .update({
        default_wait_seconds: defaultWait,
        scroll_seconds: scrollSec,
      })
      .eq('id', 1);

    if (error) {
      showAlert('error', `Failed to save settings: ${error.message}`);
    } else {
      showAlert('success', 'Site settings successfully updated.');
    }
    setSavingSettings(false);
  };

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Login Form (Unauthenticated)
  // --------------------------------------------------------------------------
  if (!session) {
    return (
      <div className="container" style={{ maxWidth: '440px', padding: '5rem 1.25rem' }}>
        <div className="admin-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="hero-tag">Staff Access</span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>Admin Login</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Sign in with your Supabase administrative credentials.
            </p>
          </div>

          {loginError && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techpublisher.example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-pass">Password</label>
              <input
                id="admin-pass"
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loggingIn}
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              marginTop: '1.5rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Public sign-ups are disabled. Administrator invitations are provisioned exclusively via Supabase Project Settings.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Authenticated Dashboard
  // --------------------------------------------------------------------------
  return (
    <div className="container admin-wrapper">
      {/* Top Header */}
      <header className="admin-header">
        <div>
          <span className="hero-tag" style={{ background: '#e1e7ec', color: 'var(--text-primary)' }}>
            Admin Control Center
          </span>
          <h1 style={{ fontSize: '1.875rem', marginTop: '0.25rem' }}>Publication Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
            {session.user.email}
          </span>
          <button onClick={handleSignOut} className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.875rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Global Alert Notification */}
      {alertMsg && (
        <div
          role="status"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9375rem',
            backgroundColor: alertMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: alertMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${alertMsg.type === 'success' ? '#2da44e40' : '#cf222e40'}`,
          }}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="admin-nav-tabs" aria-label="Dashboard Tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => { setActiveTab('articles'); setEditingArticle(null); }}
        >
          Articles ({articles.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'codes' ? 'active' : ''}`}
          onClick={() => { setActiveTab('codes'); setEditingCode(null); }}
        >
          Redeem Codes ({codes.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Site Settings
        </button>
      </nav>

      {/* -------------------------------------------------------------------- */}
      {/* TAB 1: ARTICLES                                                      */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'articles' && (
        <div>
          {editingArticle ? (
            <ArticleEditor
              article={editingArticle}
              onSave={handleSaveArticle}
              onCancel={() => setEditingArticle(null)}
              onTitleChange={handleArticleTitleChange}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Published & Draft Articles</h2>
                <button
                  onClick={() =>
                    setEditingArticle({
                      title: '',
                      slug: '',
                      category: 'gadget-reviews',
                      author: 'Editorial Team',
                      excerpt: '',
                      body: '',
                      status: 'published',
                      cover_alt: '',
                    })
                  }
                  className="btn-primary"
                >
                  + Create Article
                </button>
              </div>

              {loadingArticles ? (
                <p>Loading articles...</p>
              ) : (
                <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Published Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                            No articles created yet. Click "+ Create Article" above.
                          </td>
                        </tr>
                      ) : (
                        articles.map((art) => (
                          <tr key={art.id}>
                            <td>
                              <strong>{art.title}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/{art.slug}</div>
                            </td>
                            <td>{art.category}</td>
                            <td>
                              <button
                                onClick={() => handleToggleArticleStatus(art)}
                                className={`status-badge ${art.status}`}
                                title="Click to toggle status"
                                style={{ border: 'none', cursor: 'pointer' }}
                              >
                                {art.status}
                              </button>
                            </td>
                            <td>{new Date(art.published_at).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => setEditingArticle(art)}
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id, art.title)}
                                className="btn-danger"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 2: REDEEM CODES                                                  */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'codes' && (
        <div>
          {editingCode ? (
            <CodeEditor
              codeObj={editingCode}
              onSave={handleSaveCode}
              onCancel={() => setEditingCode(null)}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>Instagram Video Codes</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Map short video codes to target URLs. Public visitors cannot query this table directly.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCode({
                      code: '',
                      target_url: 'https://',
                      wait_seconds: '',
                      active: true,
                    })
                  }
                  className="btn-primary"
                >
                  + Add New Code
                </button>
              </div>

              {loadingCodes ? (
                <p>Loading codes...</p>
              ) : (
                <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Destination URL</th>
                        <th>Wait Override</th>
                        <th>Status</th>
                        <th>Total Clicks</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                            No redemption codes configured yet.
                          </td>
                        </tr>
                      ) : (
                        codes.map((c) => (
                          <tr key={c.code}>
                            <td style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{c.code}</td>
                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <a href={c.target_url} target="_blank" rel="noopener noreferrer">
                                {c.target_url}
                              </a>
                            </td>
                            <td>
                              {c.wait_seconds !== null && c.wait_seconds !== undefined
                                ? `${c.wait_seconds}s (override)`
                                : `Default (${settings.default_wait_seconds}s)`}
                            </td>
                            <td>
                              <button
                                onClick={() => handleToggleCodeActive(c)}
                                className={`status-badge ${c.active ? 'published' : 'draft'}`}
                                style={{ border: 'none', cursor: 'pointer' }}
                                title="Click to toggle active state"
                              >
                                {c.active ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td style={{ fontWeight: 600 }}>{c.click_count}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => setEditingCode(c)}
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCode(c.code)}
                                className="btn-danger"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 3: SETTINGS                                                      */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="admin-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Global Publication Settings</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              These parameters control visitor link unlock behavior and reading auto-scroll speed.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-wait">
                  Default Countdown Wait Duration (Seconds)
                </label>
                <input
                  id="setting-wait"
                  type="number"
                  min="0"
                  max="30"
                  className="form-input"
                  value={settings.default_wait_seconds}
                  onChange={(e) =>
                    setSettings({ ...settings, default_wait_seconds: e.target.value })
                  }
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontFamily: 'var(--font-sans)' }}>
                  Honest countdown time before links unlock (between 0 and 30 seconds). Individual codes can override this value.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setting-scroll">
                  Article Auto-Scroll Duration (Seconds)
                </label>
                <input
                  id="setting-scroll"
                  type="number"
                  min="0"
                  max="180"
                  className="form-input"
                  value={settings.scroll_seconds}
                  onChange={(e) =>
                    setSettings({ ...settings, scroll_seconds: e.target.value })
                  }
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontFamily: 'var(--font-sans)' }}>
                  Total seconds for the linear auto-scroll down to the code box on articles (default 40s, range 0–180s). Set to 0 to completely disable auto-scrolling. Stops instantly on user interaction.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={savingSettings || loadingSettings}
              >
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sub-Component: ArticleEditor
// ----------------------------------------------------------------------------
function ArticleEditor({ article, onSave, onCancel, onTitleChange }) {
  const [form, setForm] = useState({
    title: article.title || '',
    slug: article.slug || '',
    category: article.category || 'gadget-reviews',
    author: article.author || 'Editorial Team',
    excerpt: article.excerpt || '',
    body: article.body || '',
    status: article.status || 'published',
    cover_alt: article.cover_alt || '',
    manualSlug: Boolean(article.slug),
  });

  return (
    <div className="admin-card">
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
        {article.id ? 'Edit Article' : 'Compose New Article'}
      </h2>

      <form onSubmit={(e) => onSave(e, form)}>
        <div className="form-group">
          <label className="form-label">Article Title *</label>
          <input
            type="text"
            required
            className="form-input"
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value, form, setForm)}
            placeholder="e.g. Review: Next-Gen Silicon Benchmarks"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">URL Slug (Auto-generated, editable) *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value, manualSlug: true })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="gadget-reviews">Gadget Reviews</option>
              <option value="tech-news">Tech News</option>
              <option value="research-explainers">Research Explainers</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Author Byline</label>
            <input
              type="text"
              className="form-input"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Publication Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">Published</option>
              <option value="draft">Draft (Hidden from Public)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Summary / Excerpt *</label>
          <textarea
            required
            className="form-input"
            style={{ minHeight: '80px', fontFamily: 'var(--font-sans)' }}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short 2-3 sentence overview for index and social cards..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Article Body (Plain text, paragraphs separated by blank lines) *</label>
          <textarea
            required
            className="form-textarea"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write article text here. Separate each paragraph with an empty line..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cover Image Description / Alt Text</label>
          <input
            type="text"
            className="form-input"
            value={form.cover_alt}
            onChange={(e) => setForm({ ...form, cover_alt: e.target.value })}
            placeholder="e.g. Minimalist tablet on workspace"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn-primary">
            Save Article
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sub-Component: CodeEditor
// ----------------------------------------------------------------------------
function CodeEditor({ codeObj, onSave, onCancel }) {
  const [form, setForm] = useState({
    code: codeObj.code || '',
    target_url: codeObj.target_url || 'https://',
    wait_seconds: codeObj.wait_seconds !== null && codeObj.wait_seconds !== undefined ? codeObj.wait_seconds : '',
    active: codeObj.active !== undefined ? codeObj.active : true,
  });

  return (
    <div className="admin-card" style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
        {codeObj.code ? `Edit Code: ${codeObj.code}` : 'Add New Instagram Code'}
      </h2>

      <form onSubmit={(e) => onSave(e, form)}>
        <div className="form-group">
          <label className="form-label">Code (Uppercase Alphanumeric) *</label>
          <input
            type="text"
            required
            disabled={Boolean(codeObj.code)} // Primary key cannot be altered once created
            className="form-input"
            style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. TECH26"
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Destination URL (Must start with https://) *</label>
          <input
            type="url"
            required
            className="form-input"
            value={form.target_url}
            onChange={(e) => setForm({ ...form, target_url: e.target.value })}
            placeholder="https://example.com/target-link"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Countdown Wait Seconds Override (Optional)</label>
          <input
            type="number"
            min="0"
            max="30"
            className="form-input"
            value={form.wait_seconds}
            onChange={(e) => setForm({ ...form, wait_seconds: e.target.value })}
            placeholder="Leave empty to use global setting default"
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', fontFamily: 'var(--font-sans)' }}>
            Enter 0 for immediate unlock, or up to 30 seconds. If left blank, uses global default.
          </p>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="code-active-cb"
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <label htmlFor="code-active-cb" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', cursor: 'pointer' }}>
            Code is Active (Allow visitors to redeem)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn-primary">
            Save Code
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
