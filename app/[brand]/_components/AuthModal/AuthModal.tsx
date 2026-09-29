'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'

import { Button } from '../Button'
import { Field } from '../Field'
import { Modal } from '../Modal'
import {
  createAccount, signIn, MIN_PASSWORD_LENGTH, type AuthUser,
} from '../../_lib/mockAuth'
import styles from './AuthModal.module.css'

export type AuthTab = 'signin' | 'create'

export interface AuthModalIcons {
  XIcon:        React.ComponentType<IconProps>
  EyeIcon:      React.ComponentType<IconProps>
  FacebookIcon: React.ComponentType<IconProps>
  GoogleIcon:   React.ComponentType<IconProps>
}

interface AuthModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: AuthTab
  icons: AuthModalIcons
  onAuthenticated: (user: AuthUser) => void
  /** Brand-prefixed hrefs for the legal links. */
  termsHref: string
  privacyHref: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TABS: Array<{ id: AuthTab; label: string }> = [
  { id: 'signin', label: 'Sign In' },
  { id: 'create', label: 'Create Account' },
]

/**
 * A password field's show/hide control.
 *
 * One icon for both states: the brand sets ship an eye but no crossed-out eye,
 * and drawing one would mean drawing it five times. The state is carried by
 * the accessible name and by the icon's colour going quiet when revealed.
 */
function RevealToggle({
  shown, onToggle, EyeIcon,
}: { shown: boolean; onToggle: () => void; EyeIcon: React.ComponentType<IconProps> }) {
  return (
    <button
      type="button"
      className={`${styles.reveal} ${shown ? styles.revealOn : ''}`}
      aria-label={shown ? 'Hide password' : 'Show password'}
      aria-pressed={shown}
      onClick={onToggle}
    >
      <EyeIcon size={20} />
    </button>
  )
}

/**
 * Sign In and Create Account, in one dialog.
 *
 * Which tab opens is the caller's business — the button beside the lookup form
 * opens Sign In, the "Sign up" link opens Create Account — so `defaultTab` is
 * read each time the modal opens rather than once at mount.
 */
export function AuthModal({
  open, onClose, defaultTab = 'signin', icons, onAuthenticated, termsHref, privacyHref,
}: AuthModalProps) {
  const { XIcon, EyeIcon, FacebookIcon, GoogleIcon } = icons
  const baseId = useId()
  const tabId  = (id: AuthTab) => `${baseId}-tab-${id}`
  const panelId = (id: AuthTab) => `${baseId}-panel-${id}`

  const [tab, setTab]         = useState<AuthTab>(defaultTab)
  const [busy, setBusy]       = useState(false)
  const [formError, setError] = useState<string | null>(null)

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [firstName, setFirst]     = useState('')
  const [lastName, setLast]       = useState('')
  const [showPassword, setShow]   = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  /** Set when the address is already registered, so the message can offer a way out. */
  const [emailTaken, setEmailTaken] = useState(false)

  const tabRefs   = useRef<Record<AuthTab, HTMLButtonElement | null>>({ signin: null, create: null })
  const firstFieldRef = useRef<HTMLInputElement>(null)

  /* Each opening is its own errand: start on the tab the caller asked for and
     drop whatever the last one left behind. */
  useEffect(() => {
    if (!open) return
    setTab(defaultTab)
    setError(null)
    setFieldErrors({})
    setEmailTaken(false)
    setShow(false)
    setBusy(false)
  }, [open, defaultTab])

  /* Focus the first field, not the dialog — the shopper came here to type.
     On opening only: keyed on the tab as well, this stole focus back from the
     tablist every time the tab changed, so the arrow keys could only ever move
     one way. */
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const switchTab = (next: AuthTab, { keepEmail = false } = {}) => {
    setTab(next)
    setError(null)
    setFieldErrors({})
    setEmailTaken(false)
    setPassword('')
    if (!keepEmail) setEmail('')
  }

  /* Arrow keys move between tabs, as the tab pattern expects. */
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next: AuthTab = tab === 'signin' ? 'create' : 'signin'
    switchTab(next)
    window.setTimeout(() => tabRefs.current[next]?.focus(), 0)
  }

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}
    if (!email.trim()) errors.email = 'Enter your email address'
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Enter your password'
    setFieldErrors(errors)
    setError(null)
    if (Object.keys(errors).length > 0) return

    setBusy(true)
    const result = await signIn(email, password)
    setBusy(false)

    if (!result.ok) {
      /* The email is almost certainly right; the password is the part worth
         retyping, so only that is cleared. */
      setError('The email or password you entered is incorrect.')
      setPassword('')
      return
    }
    onAuthenticated(result.user)
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}
    if (!firstName.trim()) errors.firstName = 'Enter your first name'
    if (!lastName.trim()) errors.lastName = 'Enter your last name'
    if (!email.trim()) errors.email = 'Enter your email address'
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Choose a password'
    else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`
    }
    setFieldErrors(errors)
    setError(null)
    setEmailTaken(false)
    if (Object.keys(errors).length > 0) return

    setBusy(true)
    const result = await createAccount({ firstName, lastName, email, password })
    setBusy(false)

    if (!result.ok) {
      setEmailTaken(true)
      return
    }
    onAuthenticated(result.user)
  }

  /* TODO: no social login is wired up in this project yet. */
  const socialButtons = (
    <div className={styles.social}>
      <button type="button" className={styles.socialButton}>
        <span className={styles.socialIcon} aria-hidden="true"><FacebookIcon size={24} /></span>
        Facebook
      </button>
      <button type="button" className={styles.socialButton}>
        <span className={styles.socialIcon} aria-hidden="true"><GoogleIcon size={24} /></span>
        Google
      </button>
    </div>
  )

  const orDivider = (
    <div className={styles.divider}><span className={styles.dividerLabel}>Or</span></div>
  )

  const errorBanner = formError && (
    <div className={styles.errorBanner} role="alert">{formError}</div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={tabId(tab)}
      closeIcon={<XIcon size={20} />}
      className={styles.panel}
    >
      <div className={styles.tablist} role="tablist" aria-label="Sign in or create an account">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            ref={node => { tabRefs.current[id] = node }}
            type="button"
            role="tab"
            id={tabId(id)}
            aria-selected={tab === id}
            aria-controls={panelId(id)}
            tabIndex={tab === id ? 0 : -1}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            onClick={() => switchTab(id)}
            onKeyDown={onTabKeyDown}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'signin' ? (
        <div role="tabpanel" id={panelId('signin')} aria-labelledby={tabId('signin')}>
          {errorBanner}
          <form className={styles.form} onSubmit={handleSignIn} noValidate>
            <Field
              ref={firstFieldRef}
              variant="floating"
              label="Email*"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={email}
              onChange={event => setEmail(event.target.value)}
              error={fieldErrors.email}
            />
            <Field
              variant="floating"
              label="Password*"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-required="true"
              value={password}
              onChange={event => setPassword(event.target.value)}
              error={fieldErrors.password}
              trailing={<RevealToggle shown={showPassword} onToggle={() => setShow(s => !s)} EyeIcon={EyeIcon} />}
            />

            {/* TODO: no reset-password flow exists in this project yet. */}
            <p className={styles.forgotRow}>
              <a className={styles.forgot} href="#">Forgot Your Password?</a>
            </p>

            <Button variant="primary" type="submit" className={styles.submit} disabled={busy}>
              {busy ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>

          {orDivider}
          {socialButtons}
        </div>
      ) : (
        <div role="tabpanel" id={panelId('create')} aria-labelledby={tabId('create')}>
          {errorBanner}
          <form className={styles.form} onSubmit={handleCreate} noValidate>
            <div className={styles.nameRow}>
              <Field
                ref={firstFieldRef}
                variant="floating"
                label="First Name*"
                autoComplete="given-name"
                required
                aria-required="true"
                value={firstName}
                onChange={event => setFirst(event.target.value)}
                error={fieldErrors.firstName}
                className={styles.nameField}
              />
              <Field
                variant="floating"
                label="Last Name*"
                autoComplete="family-name"
                required
                aria-required="true"
                value={lastName}
                onChange={event => setLast(event.target.value)}
                error={fieldErrors.lastName}
                className={styles.nameField}
              />
            </div>

            <Field
              variant="floating"
              label="Email*"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={email}
              onChange={event => setEmail(event.target.value)}
              error={fieldErrors.email}
              invalid={emailTaken}
            />
            {emailTaken && (
              <p className={styles.inlineError} role="alert">
                That email already has an account.{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => switchTab('signin', { keepEmail: true })}
                >
                  Sign in instead
                </button>
              </p>
            )}

            <Field
              variant="floating"
              label="Password*"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              aria-required="true"
              value={password}
              onChange={event => setPassword(event.target.value)}
              error={fieldErrors.password}
              hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
              trailing={<RevealToggle shown={showPassword} onToggle={() => setShow(s => !s)} EyeIcon={EyeIcon} />}
            />

            <Button variant="primary" type="submit" className={styles.submit} disabled={busy}>
              {busy ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>

          {orDivider}
          {socialButtons}

          <p className={styles.terms}>
            By creating an account you agree to our{' '}
            <Link href={termsHref} className={styles.termsLink}>Terms &amp; Conditions</Link>{' '}
            and{' '}
            <Link href={privacyHref} className={styles.termsLink}>Privacy Policy</Link>.
          </p>
        </div>
      )}
    </Modal>
  )
}
