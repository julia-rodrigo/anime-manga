import { useEffect, useRef, useState } from 'react'
import { KaraokeLine } from '../components/KaraokeLine'
import { activeCue, cueProgress, parseSubtitles, type Cue } from '../lib/subtitles'

export function MediaLab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [subsA, setSubsA] = useState<Cue[]>([])
  const [subsB, setSubsB] = useState<Cue[]>([])
  const [cueA, setCueA] = useState<Cue | null>(null)
  const [cueB, setCueB] = useState<Cue | null>(null)
  const [progressA, setProgressA] = useState(0)

  const [voiceIsolation, setVoiceIsolation] = useState(false)
  const [recording, setRecording] = useState(false)
  const [takeUrl, setTakeUrl] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const graphRef = useRef<{
    source: MediaElementAudioSourceNode
    dry: GainNode
    isolated: GainNode
    destStream: MediaStreamAudioDestinationNode
  } | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let raf: number
    const tick = () => {
      const t = video.currentTime
      const a = activeCue(subsA, t)
      const b = activeCue(subsB, t)
      setCueA(a)
      setCueB(b)
      setProgressA(a ? cueProgress(a, t) : 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [subsA, subsB])

  function onVideoFile(file: File) {
    setVideoUrl(URL.createObjectURL(file))
  }

  async function onSubtitleFile(file: File, which: 'A' | 'B') {
    const text = await file.text()
    const cues = parseSubtitles(text)
    if (which === 'A') setSubsA(cues)
    else setSubsB(cues)
  }

  /** Builds (once) a Web Audio graph that can cancel center-panned (dialogue) audio
   *  by subtracting the right channel from the left and vice-versa, and routes
   *  the result both to the speakers and to a MediaStream for mixing with the mic. */
  function ensureGraph() {
    const video = videoRef.current
    if (!video) return null
    if (graphRef.current) return graphRef.current

    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const source = ctx.createMediaElementSource(video)

    const splitter = ctx.createChannelSplitter(2)
    const merger = ctx.createChannelMerger(2)
    source.connect(splitter)

    // Center-channel cancellation: L' = L - R, R' = R - L.
    const invertR = ctx.createGain()
    invertR.gain.value = -1
    const invertL = ctx.createGain()
    invertL.gain.value = -1

    splitter.connect(merger, 0, 0) // L -> out L
    splitter.connect(invertR, 1)
    invertR.connect(merger, 0, 0) // -R -> out L

    splitter.connect(merger, 1, 1) // R -> out R
    splitter.connect(invertL, 0)
    invertL.connect(merger, 0, 1) // -L -> out R

    const dry = ctx.createGain()
    const isolated = ctx.createGain()
    source.connect(dry)
    merger.connect(isolated)

    const destStream = ctx.createMediaStreamDestination()
    dry.connect(ctx.destination)
    isolated.connect(ctx.destination)
    dry.connect(destStream)
    isolated.connect(destStream)

    dry.gain.value = 1
    isolated.gain.value = 0

    graphRef.current = { source, dry, isolated, destStream }
    return graphRef.current
  }

  function toggleVoiceIsolation() {
    const graph = ensureGraph()
    if (!graph) return
    const next = !voiceIsolation
    graph.dry.gain.value = next ? 0 : 1
    graph.isolated.gain.value = next ? 1 : 0
    setVoiceIsolation(next)
  }

  async function startRecording() {
    const graph = ensureGraph()
    if (!graph) return
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
    micStreamRef.current = mic

    const ctx = audioCtxRef.current!
    const mixDest = ctx.createMediaStreamDestination()
    graph.dry.connect(mixDest)
    graph.isolated.connect(mixDest)
    const micSource = ctx.createMediaStreamSource(mic)
    micSource.connect(mixDest)

    const recorder = new MediaRecorder(mixDest.stream)
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = () => {
      setTakeUrl(URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' })))
      mic.getTracks().forEach((t) => t.stop())
    }
    recorder.start()
    recorderRef.current = recorder
    setRecording(true)
    videoRef.current?.play()
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Media Lab</h1>
      <p className="mt-2 max-w-2xl text-white/60">
        Bring your own clip (anything you have the rights to use) to try dual
        subtitles, karaoke-style highlighting, voice isolation for dub
        practice, and record-along. Nothing here ships with any actual
        anime/song content.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <FileButton label="Load video" accept="video/*" onFile={onVideoFile} />
        <FileButton
          label="Subtitle track A"
          accept=".srt,.vtt"
          onFile={(f) => onSubtitleFile(f, 'A')}
        />
        <FileButton
          label="Subtitle track B (optional)"
          accept=".srt,.vtt"
          onFile={(f) => onSubtitleFile(f, 'B')}
        />
      </div>

      {videoUrl ? (
        <div className="mt-6">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            crossOrigin="anonymous"
            className="w-full rounded-xl bg-black"
          />

          <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 min-h-24">
            {cueA ? <KaraokeLine text={cueA.text} progress={progressA} /> : null}
            {cueB ? (
              <p className="text-center text-base text-white/50">{cueB.text}</p>
            ) : null}
            {!cueA && !cueB ? (
              <p className="text-center text-white/30">
                Load a .srt/.vtt subtitle file to see captions here.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={toggleVoiceIsolation}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                voiceIsolation
                  ? 'bg-fuchsia-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {voiceIsolation ? 'Voice isolation: on' : 'Voice isolation: off'}
            </button>
            <span className="text-xs text-white/40">
              Attenuates center-panned dialogue on stereo clips — works best on
              well-mixed stereo audio, not mono TV rips.
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
              >
                ● Record my take
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                ■ Stop
              </button>
            )}
            {takeUrl ? (
              <a
                href={takeUrl}
                download="my-take.webm"
                className="text-sm text-fuchsia-300 underline"
              >
                Download your take
              </a>
            ) : null}
          </div>
          {takeUrl ? <audio className="mt-2 w-full" src={takeUrl} controls /> : null}
        </div>
      ) : (
        <p className="mt-10 text-center text-white/30">
          Load a video above to get started.
        </p>
      )}
    </div>
  )
}

function FileButton({
  label,
  accept,
  onFile,
}: {
  label: string
  accept: string
  onFile: (file: File) => void
}) {
  return (
    <label className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-fuchsia-400/50 hover:text-fuchsia-300">
      {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </label>
  )
}
