/* oxlint-disable react/react-compiler -- Account status is loaded from the hosting API. */
'use client';
import { useEffect, useState } from 'react';
import { parseSave, type Save } from '@/lib/game';

export default function CloudSave({
  save,
  disabled,
  onRestore,
}: {
  save: Save;
  disabled: boolean;
  onRestore: (s: Save) => void;
}) {
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recovery, setRecovery] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [remote, setRemote] = useState<{
    save: Save;
    etag: string;
    updated: string;
  } | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [newRecovery, setNewRecovery] = useState('');
  async function request(path: string, method: string = 'GET', body?: unknown) {
    const r = await fetch('/api/' + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Turboat-Request': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await r
      .json()
      .catch(() => ({
        error: 'Cloud services are unavailable. Your device save is safe.',
      }))) as {
      error?: string;
      name?: string;
      recovery?: string;
      save?: Save;
      etag: string;
      updated: string;
    };
    if (!r.ok) throw new Error(data.error || 'Cloud request failed');
    return data;
  }
  async function check() {
    const data = await request('account');
    setAccount(data.name || '');
    setChecked(false);
    setRemote(null);
    setEtag(null);
  }
  useEffect(() => {
    void check().catch(() =>
      setMessage(
        'Guest mode. Cloud services are unavailable or you are offline.',
      ),
    );
  }, []);
  async function action(fn: () => Promise<void>) {
    setWorking(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setWorking(false);
    }
  }
  return (
    <section className="cloud-panel">
      <h2>Save across devices</h2>
      <p>
        {account
          ? 'Signed in as ' + account
          : 'Guest progress is saved on this device.'}
      </p>
      <p>
        Check the cloud first, then choose which save to keep. Upload again
        after playing to continue on another device.
      </p>
      <fieldset disabled={disabled || working}>
        {!account ? (
          <>
            {/* Microsoft authentication requires a full server navigation. */}
            {/* oxlint-disable-next-line next/no-html-link-for-pages */}
            <a
              className="primary"
              href="/.auth/login/aad?post_login_redirect_uri=/turboat/"
            >
              Sign in with Microsoft
            </a>
            <h3>Or use a game account</h3>
            <label>
              Account action
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="login">Sign in</option>
                <option value="register">Create account</option>
                <option value="recover">Recover account</option>
              </select>
            </label>
            <label>
              Username
              <input
                autoComplete="username"
                value={username}
                maxLength={24}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              {mode === 'recover' ? 'New password' : 'Password'}
              <input
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <p>
              Use 3–24 letters, numbers, or underscores for your username and at
              least 12 characters for your password.
            </p>
            {mode === 'recover' && (
              <label>
                Recovery code
                <input
                  value={recovery}
                  onChange={(e) => setRecovery(e.target.value)}
                />
              </label>
            )}
            <button
              onClick={() =>
                void action(async () => {
                  const data = await request('account', 'POST', {
                    action: mode,
                    username,
                    password,
                    recovery,
                  });
                  setPassword('');
                  setRecovery('');
                  setNewRecovery(data.recovery || '');
                  await check();
                  setMessage('Signed in. Check cloud save to continue.');
                })
              }
            >
              {mode === 'register'
                ? 'Create game account'
                : mode === 'recover'
                  ? 'Reset password'
                  : 'Sign in'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                void action(async () => {
                  const data = await request('save');
                  setRemote(
                    data.save
                      ? { ...data, save: parseSave(JSON.stringify(data.save)) }
                      : null,
                  );
                  setEtag(data.etag || null);
                  setChecked(true);
                  setMessage(
                    data.save
                      ? 'Cloud save found. Choose below.'
                      : 'No cloud save yet. You can upload this device.',
                  );
                })
              }
            >
              Check cloud save
            </button>
            {remote && (
              <div>
                <p>
                  Cloud: {remote.save.races} events · {remote.save.credits}{' '}
                  credits · {remote.save.garage?.length || 0} saved boats ·{' '}
                  {new Date(remote.updated).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    onRestore(remote.save);
                    setMessage('Cloud save loaded on this device.');
                  }}
                >
                  Use cloud save on this device
                </button>
              </div>
            )}
            <button
              disabled={!checked}
              onClick={() =>
                void action(async () => {
                  const data = await request('save', 'PUT', { save, etag });
                  setEtag(data.etag);
                  setRemote({ etag: data.etag, updated: data.updated, save });
                  setMessage(
                    'Uploaded. Check cloud save on your other device to continue.',
                  );
                })
              }
            >
              {remote
                ? 'Replace cloud with this device'
                : 'Upload this device to cloud'}
            </button>
            <button
              onClick={() =>
                void action(async () => {
                  await request('account', 'POST', { action: 'logout' });
                  window.location.href =
                    '/.auth/logout?post_logout_redirect_uri=/turboat/';
                })
              }
            >
              Sign out
            </button>
          </>
        )}
      </fieldset>
      {newRecovery && (
        <aside className="notice">
          <strong>
            Keep this recovery code somewhere safe. It is shown only now.
          </strong>
          <p>
            <code>{newRecovery}</code>
          </p>
          <button onClick={() => setNewRecovery('')}>
            I saved my recovery code
          </button>
        </aside>
      )}
      <output aria-live="polite">{working ? 'Connecting…' : message}</output>
      <p className="weight-note">
        Microsoft and game accounts are separate saves. Cloud saves are for
        personal play; progression is not a verified competitive leaderboard.
      </p>
    </section>
  );
}
