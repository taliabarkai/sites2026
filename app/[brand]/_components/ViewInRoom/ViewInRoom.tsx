'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { PanelPortal } from '../PanelPortal'
import styles from './ViewInRoom.module.css'

type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

/** What hangs on the wall: the live preview's artwork, at its real size. */
export interface WallArt {
  /** The artwork image (the same one the live preview draws). */
  src: string | null
  widthIn: number
  heightIn: number
  material: 'canvas' | 'metal' | 'acrylic'
  /** Frame (canvas) or edge (metal, acrylic) color. */
  edgeHex: string
}

interface ViewInRoomProps {
  open: boolean
  onClose: () => void
  art: WallArt
  icons: { ViewInRoomIcon?: IconCmp; ArrowIcon?: IconCmp; CameraIcon?: IconCmp }
  /** Opened from the desktop QR code: the shopper's choices came with them. */
  fromQr?: boolean
  /** The customizer's tabs — the sheet's handle, always in view once the canvas is up. */
  sheetHeader: ReactNode
  /** The active tab's fields and footer. */
  children: ReactNode
  /** Changes when the tab changes, so the sheet scrolls back to its top. */
  sheetKey?: string
}

type Step = 'intro' | 'find' | 'line' | 'on'

// The scene scales to the screen: the floor line starts at 69% of the height,
// and the screen's width shows about 100 in (2.5 m) of wall.
const WALL_INCHES_ACROSS = 100
// A canvas hangs with its center 57 in (145 cm) above the floor — gallery height
const EYE_IN = 57
const MOVE_PX = 6

const STEP_TOASTS: Partial<Record<Step, string>> = {
  find: 'Point at an empty wall, about 2 m (6 ft) away',
  line: 'Drag the line to where the wall meets the floor',
}

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }

export function ViewInRoomButton({ Icon, onClick, collapse = true, className }: { Icon?: IconCmp; onClick: () => void; collapse?: boolean; className?: string }) {
  return (
    <button
      type="button"
      className={[styles.trigger, collapse && styles.triggerCollapse, className].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-label="View in Room"
    >
      <span className={styles.triggerIcon} aria-hidden="true">{Icon ? <Icon size={22} /> : null}</span>
      <span className={styles.triggerLabel}><span>View in Room</span></span>
    </button>
  )
}

/**
 * View in Room, on the phone: the live camera with the shopper's canvas on the
 * wall at its real size. Mark where the wall meets the floor, then drag the
 * canvas; the customizer's tabs sit in a sheet below, so the song, size and
 * frame change while they look.
 */
export function ViewInRoom({ open, onClose, art, icons, fromQr, sheetHeader, children, sheetKey }: ViewInRoomProps) {
  const { ArrowIcon, CameraIcon } = icons
  // Callback refs: the portal mounts its children a render late, so plain refs miss them
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [handleEl, setHandleEl] = useState<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [box, setBox] = useState({ w: 390, h: 760 })
  const [step, setStep] = useState<Step>('intro')
  const [camError, setCamError] = useState(false)
  const [found, setFound] = useState(false)
  const [lineY, setLineY] = useState(0)
  const [floorY, setFloorY] = useState(0)
  const [pos, setPos] = useState<{ cx: number; cy: number } | null>(null)
  const [moved, setMoved] = useState(false)
  const [sheetUp, setSheetUp] = useState(false)
  const [handleH, setHandleH] = useState(124)
  const [dragTop, setDragTop] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [flash, setFlash] = useState(0)

  const { w: W, h: H } = box
  const K = W / WALL_INCHES_ACROSS
  const FLOOR = Math.round(H * 0.69)
  const lineStart = FLOOR - Math.round(H * 0.1)

  // ── Size the scene to the screen ──────────────────────────────────────────
  useLayoutEffect(() => {
    if (!rootEl) return
    const measure = () => setBox({ w: rootEl.clientWidth, h: rootEl.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(rootEl)
    return () => ro.disconnect()
  }, [rootEl])

  // ── Start over every time it opens; stop the camera when it closes ────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (open) {
      setStep('intro'); setCamError(false); setFound(false); setPos(null); setMoved(false); setSheetUp(false); setToast(null)
      return
    }
    stopCamera()
  }, [open, stopCamera])

  useEffect(() => stopCamera, [stopCamera])

  // Lock the page behind
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Attach the stream once the video element is on screen
  useEffect(() => {
    const v = videoRef.current
    if (v && streamRef.current && v.srcObject !== streamRef.current) {
      v.srcObject = streamRef.current
      v.play().catch(() => { /* autoplay is muted + inline: it plays */ })
    }
  })

  // ── Toasts ────────────────────────────────────────────────────────────────
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const say = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  // ── Steps ─────────────────────────────────────────────────────────────────
  const allowCamera = async () => {
    setCamError(false)
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera')
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      setFound(false)
      setStep('find')
    } catch {
      setCamError(true)
    }
  }

  // Looking for a wall, then found, then on to the floor line
  useEffect(() => {
    if (step !== 'find') return
    const t1 = setTimeout(() => setFound(true), 1800)
    const t2 = setTimeout(() => { setLineY(lineStart); setStep('line') }, 2700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [step, lineStart])

  const confirmLine = () => {
    setFloorY(lineY)
    setPos(null)
    setMoved(false)
    setSheetUp(false)
    setStep('on')
    say('Drag up the tabs to change it while you look.')
  }

  // ── The canvas on the wall ────────────────────────────────────────────────
  const geo = () => {
    const w = art.widthIn * K, h = art.heightIn * K
    let cx = pos ? pos.cx : W / 2
    let cy = pos ? pos.cy : floorY - EYE_IN * K
    cx = clamp(cx, w / 2 + 4, W - w / 2 - 4)
    const topMin = H * 0.12
    cy = clamp(cy, topMin + h / 2, Math.max(topMin + h / 2, floorY - 6 - h / 2))
    return { w, h, cx, cy, left: cx - w / 2, top: cy - h / 2 }
  }
  const g = geo()

  const artDrag = useRef<{ id: number; x: number; y: number; cx: number; cy: number } | null>(null)
  const onArtDown = (e: React.PointerEvent) => {
    if (artDrag.current) return // a second finger is ignored, so pinch does nothing
    artDrag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: g.cx, cy: g.cy }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }
  const onArtMove = (e: React.PointerEvent) => {
    const d = artDrag.current
    if (!d || e.pointerId !== d.id) return
    setPos({ cx: d.cx + e.clientX - d.x, cy: d.cy + e.clientY - d.y })
    if (!moved && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > MOVE_PX) setMoved(true)
  }
  const onArtUp = (e: React.PointerEvent) => {
    const d = artDrag.current
    if (d && e.pointerId === d.id) {
      // Keep the clamped spot, so the next drag starts where the canvas is
      setPos({ cx: g.cx, cy: g.cy })
      artDrag.current = null
    }
  }

  // ── The floor line ────────────────────────────────────────────────────────
  const lineDrag = useRef<number | null>(null)
  const setLineFrom = (clientY: number) => {
    const top = rootEl?.getBoundingClientRect().top ?? 0
    setLineY(clamp(clientY - top, FLOOR - H * 0.3, FLOOR + H * 0.2))
  }

  // ── The sheet: just the tabs while the canvas is up; drag or tap to open ──
  // Collapsed, the sheet shows exactly the handle: follow its height as fonts and tabs settle
  useLayoutEffect(() => {
    if (!handleEl) return
    const ro = new ResizeObserver(() => setHandleH(handleEl.offsetHeight))
    ro.observe(handleEl)
    return () => ro.disconnect()
  }, [handleEl])

  const sheetUpTop = Math.round(H * 0.42)
  const sheetTop = step !== 'on' ? H : dragTop ?? (sheetUp ? sheetUpTop : H - handleH)
  // With the sheet up, the camera view slides up so the canvas stays above it
  const shift = step === 'on' && sheetUp && dragTop === null ? clamp(g.top + g.h + 28 - sheetUpTop, 0, Math.max(0, g.top - 64)) : 0

  const sheetDrag = useRef<{ id: number; y: number; top: number; moved: boolean } | null>(null)
  const onHandleDown = (e: React.PointerEvent) => {
    if (sheetDrag.current) return
    sheetDrag.current = { id: e.pointerId, y: e.clientY, top: sheetTop, moved: false }
  }
  const onHandleMove = (e: React.PointerEvent) => {
    const d = sheetDrag.current
    if (!d || e.pointerId !== d.id) return
    const dy = e.clientY - d.y
    if (!d.moved && Math.abs(dy) > 5) {
      d.moved = true
      // Only now take the pointer: a plain tap still reaches the tab under it
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    if (d.moved) setDragTop(clamp(d.top + dy, H * 0.3, H - handleH))
  }
  const onHandleUp = (e: React.PointerEvent) => {
    const d = sheetDrag.current
    if (!d || e.pointerId !== d.id) return
    sheetDrag.current = null
    if (d.moved) {
      setSheetUp(d.top + (e.clientY - d.y) < H * 0.72)
      setDragTop(null)
      return
    }
    // A tap: on a tab, open the sheet at that tab; anywhere else, toggle it
    const onTab = (e.target as HTMLElement).closest('[role="tab"]')
    setSheetUp(onTab ? true : !sheetUp)
  }

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [sheetKey])

  // ── Take a photo: the camera frame with the canvas on it ──────────────────
  const takePhoto = async () => {
    setFlash((n) => n + 1)
    const v = videoRef.current
    if (!v || !v.videoWidth || !art.src) { say('Photo saved'); return }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const c = document.createElement('canvas')
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    // The video, cropped to cover the screen as it shows
    const vr = v.videoWidth / v.videoHeight, sr = W / H
    const sw = vr > sr ? v.videoHeight * sr : v.videoWidth
    const sh = vr > sr ? v.videoHeight : v.videoWidth / sr
    ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, W, H)
    // The canvas: edge, then the artwork inside it
    const img = new Image()
    img.src = art.src
    await img.decode().catch(() => undefined)
    const edge = art.material === 'canvas' ? Math.max(2, g.w * 0.06) : 1
    ctx.fillStyle = art.edgeHex
    ctx.fillRect(g.left, g.top, g.w, g.h)
    ctx.drawImage(img, g.left + edge, g.top + edge, g.w - edge * 2, g.h - edge * 2)
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9))
    if (!blob) return
    const file = new File([blob], 'my-canvas-on-the-wall.jpg', { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'My canvas on the wall' }).catch(() => { /* closed the share sheet */ })
      return
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    say('Photo saved')
  }

  if (!open) return null

  const artStyle: React.CSSProperties = {
    left: g.left, top: g.top, width: g.w, height: g.h,
    ['--vir-edge' as string]: art.edgeHex,
    ['--vir-edge-w' as string]: `${art.material === 'canvas' ? Math.max(2, g.w * 0.06) : 1}px`,
  }

  return (
    <PanelPortal>
      <div ref={setRootEl} className={styles.root} role="dialog" aria-modal="true" aria-label="View in Room">
        {/* The camera, or a dark screen until it's allowed */}
        <div className={styles.scene} style={{ transform: shift ? `translateY(${-shift}px)` : undefined }}>
          <video ref={videoRef} className={`${styles.video} ${step === 'intro' ? styles.dim : ''}`} autoPlay playsInline muted />
          <div className={styles.vignette} />

          {step === 'on' && (
            <>
              <div
                className={`${styles.art} ${styles[`art_${art.material}`]}`}
                style={artStyle}
                onPointerDown={onArtDown}
                onPointerMove={onArtMove}
                onPointerUp={onArtUp}
                onPointerCancel={onArtUp}
              >
                {art.src && <img src={art.src} alt="Your canvas" draggable={false} />}
              </div>
              <div className={styles.pill} style={{ left: g.cx, top: Math.max(H * 0.1, g.top - 28) }}>
                {art.widthIn} × {art.heightIn} in · real size
              </div>
              {!moved && !sheetUp && (
                <div className={styles.hint} style={{ top: Math.min(g.top + g.h + 14, floorY - 30) }}>Drag to move</div>
              )}
            </>
          )}
        </div>

        {/* Looking for a wall */}
        {step === 'find' && <div className={`${styles.reticle} ${found ? styles.reticleOk : ''}`} aria-hidden="true" />}

        {/* The floor line: drag anywhere to move it */}
        {step === 'line' && (
          <>
            <div
              className={styles.dragzone}
              onPointerDown={(e) => { if (lineDrag.current != null) return; lineDrag.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); setLineFrom(e.clientY); e.preventDefault() }}
              onPointerMove={(e) => { if (e.pointerId === lineDrag.current) setLineFrom(e.clientY) }}
              onPointerUp={(e) => { if (e.pointerId === lineDrag.current) lineDrag.current = null }}
              onPointerCancel={() => { lineDrag.current = null }}
            />
            <div className={styles.calib} style={{ top: lineY - 1 }} aria-hidden="true">
              <span className={styles.calibHandle} style={{ left: 34 }} />
              <span className={styles.calibHandle} style={{ right: 34 }} />
            </div>
          </>
        )}

        {/* Top bar: back, and the camera once the canvas is up */}
        {step !== 'intro' && (
          <div className={styles.hud}>
            <button type="button" className={styles.chip} onClick={onClose}>
              {ArrowIcon && <ArrowIcon size={20} className={styles.backIcon} />}
              Back
            </button>
            {step === 'on' && (
              <button type="button" className={styles.chip} onClick={takePhoto}>
                {CameraIcon && <CameraIcon size={20} />}
                Take Photo
              </button>
            )}
          </div>
        )}

        {/* Instructions */}
        {STEP_TOASTS[step] && <div className={`${styles.toast} ${styles.toastTop}`}>{STEP_TOASTS[step]}</div>}
        {step === 'find' && (
          <div className={`${styles.toast} ${styles.toastBottom} ${found ? styles.toastOk : ''}`}>
            {found ? 'Wall found' : 'Looking for a wall…'}
          </div>
        )}
        {toast && step === 'on' && <div className={`${styles.toast} ${styles.toastTop}`} role="status">{toast}</div>}

        {/* Ask first, then the browser asks */}
        {step === 'intro' && (
          <div className={styles.card}>
            <p className={styles.cardTitle}>Use your camera</p>
            {fromQr && <p className={styles.cardNote}>Opened from your computer. Your song, size and frame came with you.</p>}
            <p className={styles.cardText}>We&apos;ll show your canvas on your own wall at its real size. Nothing is recorded or saved.</p>
            {camError && (
              <p className={styles.cardError} role="alert">
                We couldn&apos;t open your camera. Check that this site is allowed to use it in your browser settings, then try again.
              </p>
            )}
            <button type="button" className={styles.primary} onClick={allowCamera}>{camError ? 'Try again' : 'Allow camera'}</button>
            <button type="button" className={styles.link} onClick={onClose}>Not now</button>
          </div>
        )}

        {step === 'line' && (
          <div className={styles.card}>
            <p className={styles.cardText}>We use this line to show your canvas at its real size.</p>
            <button type="button" className={styles.primary} onClick={confirmLine}>That&apos;s the line</button>
          </div>
        )}

        {/* The customizer, in a sheet under the canvas */}
        <div
          className={`${styles.sheet} ${step === 'on' ? styles.sheetOn : ''} ${dragTop !== null ? styles.sheetDragging : ''}`}
          style={{ top: sheetTop }}
          aria-hidden={step !== 'on'}
        >
          <div
            ref={setHandleEl}
            className={`${styles.handle} ${sheetUp ? styles.handleUp : ''}`}
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={() => { sheetDrag.current = null; setDragTop(null) }}
          >
            <span className={styles.grab} aria-hidden="true" />
            {sheetHeader}
          </div>
          <div ref={scrollRef} className={styles.sheetScroll}>{children}</div>
        </div>

        {flash > 0 && <div key={flash} className={styles.flash} aria-hidden="true" />}
      </div>
    </PanelPortal>
  )
}
