import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Key, ArrowRight, CheckCircle2,
  Copy, Sparkles, UserCheck, Plus, Trash2, Crown, Radio,
  Mail, Phone, GraduationCap, Users, AlertTriangle, ShieldAlert, ChevronDown, Lock
} from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { SoundFX } from '../../lib/soundEffects'
import { useGameStore } from '../../store/gameStore'
import { api } from '../../lib/api'
import { WhatsAppGroupCard, WhatsAppIcon, OFFICIAL_WHATSAPP_GROUP_URL } from '../../components/ui/WhatsAppGroupCard'
import type { Game, ParticipantSession } from '../../types'

type JoinTab = 'register' | 'passcode'

export default function JoinPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSession, setGame, game } = useGameStore()

  // Tabs & Game Selection
  const [activeTab, setActiveTab] = useState<JoinTab>('register')
  const [code, setCode] = useState(searchParams.get('code') || game.code || '')
  const [activeGames, setActiveGames] = useState<Game[]>([])

  // Register Team State
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [section, setSection] = useState('')
  const [members, setMembers] = useState<string[]>(['', ''])

  // Passcode Quick Join State
  const [passcode, setPasscode] = useState('')

  // Success / Modal state
  const [registeredSession, setRegisteredSession] = useState<{
    session: ParticipantSession
    game: Game
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fetch active games and poll every 3 seconds for real-time room & registration updates
  useEffect(() => {
    const fetchGames = () => {
      api.listGames().then((games) => {
        setActiveGames(games)
        const openRooms = games.filter((g) => g.phase !== 'RESULTS' && g.isRegistrationOpen !== false)
        if (openRooms.length > 0) {
          if (!code || !openRooms.some((g) => g.code === code)) {
            setCode(openRooms[openRooms.length - 1].code)
          }
        } else if (games.length > 0 && !code) {
          setCode(games[games.length - 1].code)
        }
      }).catch(() => {})
    }
    fetchGames()
    const interval = setInterval(fetchGames, 3000)
    return () => clearInterval(interval)
  }, [code])

  const openGames = activeGames.filter((g) => g.phase !== 'RESULTS' && g.isRegistrationOpen !== false)
  const currentTargetGame = openGames.find((g) => g.code === code)
    || (openGames.length > 0 ? openGames[openGames.length - 1] : (activeGames.find((g) => g.code === code) || (activeGames.length > 0 ? activeGames[activeGames.length - 1] : null)))
  const roomMaxTeams = currentTargetGame ? (currentTargetGame.maxTeams || 32) : 32
  const roomRegisteredCount = currentTargetGame ? currentTargetGame.teams.length : 0
  const isRoomFull = currentTargetGame ? roomRegisteredCount >= roomMaxTeams : false
  const isRegistrationClosedByHost = currentTargetGame ? currentTargetGame.isRegistrationOpen === false : (openGames.length === 0)
  const slotsRemaining = Math.max(0, roomMaxTeams - roomRegisteredCount)

  const handleAddMember = () => {
    if (members.length < 3) {
      setMembers([...members, ''])
    }
  }

  const handleRemoveMember = (idx: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== idx))
    }
  }

  const handleMemberChange = (idx: number, val: string) => {
    const updated = [...members]
    updated[idx] = val
    setMembers(updated)
  }

  // 1. REGISTER NEW TEAM
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegistrationClosedByHost) {
      setError(`New team registrations for "${currentTargetGame?.name || 'this room'}" are currently closed by the tournament host.`)
      return
    }

    if (isRoomFull) {
      setError(`We sincerely apologize! Registration for this room is full (${roomRegisteredCount}/${roomMaxTeams} teams).`)
      return
    }

    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) {
      setError('Please provide the Event Game Code (e.g. BWB-472).')
      return
    }
    if (!teamName.trim()) {
      setError('Please enter a team name.')
      return
    }
    const cleanMembers = members.map((m) => m.trim()).filter(Boolean)
    if (cleanMembers.length < 2) {
      setError('A team must have either 2 or 3 members. Please enter at least 2 member names.')
      return
    }

    setLoading(true)
    try {
      const result = await api.joinGame(normalizedCode, {
        teamName: teamName.trim(),
        name: cleanMembers[0],
        members: cleanMembers,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        year: year.trim() || undefined,
        section: section.trim() || undefined,
      })

      setRegisteredSession(result)
      setSession(result.session)
      setGame(result.game)
      toast.success(`Team "${teamName}" registered with Passcode: ${result.session.passcode || result.session.teamId}!`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unable to register team.'
      setError(errMsg)
      // Refresh games if room was full
      api.listGames().then(setActiveGames).catch(() => {})
    } finally {
      setLoading(false)
    }
  }

  // 2. JOIN BY UNIQUE TEAM PASSCODE (DIRECT AS FULL TEAM)
  const handlePasscodeJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) {
      setError('Please enter the Event Game Code.')
      return
    }
    if (!passcode.trim()) {
      setError('Please enter your Team Passcode.')
      return
    }
    setLoading(true)
    try {
      const result = await api.joinGame(normalizedCode, {
        passcode: passcode.trim(),
      })
      setSession(result.session)
      setGame(result.game)
      toast.success(`Connected as Team "${result.session.teamName}"!`)
      navigate('/lobby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid Passcode or Game Code.')
    } finally {
      setLoading(false)
    }
  }

  const rawPasscode = registeredSession?.session.passcode || registeredSession?.session.teamId || ''
  const displayPasscode = (rawPasscode.startsWith('team_') || rawPasscode.length > 12)
    ? ((registeredSession?.session.teamName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'TEAM') + '-' + Math.floor(100 + Math.random() * 900))
    : rawPasscode.toUpperCase()

  const copyPasscode = () => {
    if (displayPasscode) {
      navigator.clipboard.writeText(displayPasscode)
      setCopied(true)
      toast.success(`Team Passcode "${displayPasscode}" copied!`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEnterLobby = () => {
    navigate('/lobby')
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-1 sm:px-6 py-2 sm:py-6">
        {/* Header Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-bwb-accent/15 border border-bwb-accent/30 text-bwb-accent text-xs font-mono font-bold uppercase tracking-widest mb-2.5 shadow-sm">
            <Sparkles size={13} /> Official Event Entry
          </div>
          <h1 className="font-display text-2xl sm:text-5xl font-black text-bwb-text tracking-tight">
            Team Registration & Entry
          </h1>
          <p className="text-bwb-muted text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
            Register your team roster to receive a unique Team Passcode, or join directly with your team code.
          </p>
        </div>

        {/* REGISTRATION SUCCESS CARD MODAL */}
        <AnimatePresence>
          {registeredSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="mb-8"
            >
              <div className="stereo-card rounded-3xl p-4 sm:p-8 border-2 border-bwb-success/50 bg-gradient-to-br from-emerald-950/40 via-bwb-surface-2 to-bwb-surface shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-bwb-success/20 text-bwb-success border border-bwb-success/40 flex items-center justify-center shrink-0 shadow-lg shadow-bwb-success/10">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-bwb-success tracking-widest block">
                      TEAM REGISTERED SUCCESSFULLY
                    </span>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-bwb-text">
                      {registeredSession.session.teamName}
                    </h3>
                  </div>
                </div>

                {/* Unique Team Passcode Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-bwb-bg/90 border border-amber-400/40 mb-6 shadow-inner">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider">
                      YOUR UNIQUE TEAM PASSCODE
                    </span>
                    <span className="text-[10px] font-mono text-bwb-muted">
                      Use to connect teammates
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-bwb-surface-2 px-3 sm:px-4 py-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <Key size={18} className="text-amber-400 shrink-0" />
                      <span className="font-mono text-xl sm:text-3xl font-black text-bwb-accent tracking-widest select-all">
                        {displayPasscode}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={copyPasscode}
                      className="border-amber-400/50 text-xs shrink-0 font-bold"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-bwb-success mr-1" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                {/* Team Roster Preview */}
                <div className="mb-6">
                  <p className="text-[11px] font-mono uppercase text-bwb-muted font-bold mb-2.5">
                    Registered Roster ({registeredSession.game.teams.find((t) => t.id === registeredSession.session.teamId)?.members.length || 1} Members):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {registeredSession.game.teams.find((t) => t.id === registeredSession.session.teamId)?.members.map((member, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-bwb-surface border border-white/10 text-bwb-text flex items-center gap-1.5 shadow-sm"
                      >
                        {i === 0 ? <Crown size={13} className="text-amber-400" /> : <UserCheck size={13} className="text-bwb-accent" />}
                        {member} {i === 0 && <span className="text-[10px] text-amber-400 font-mono font-bold">(Lead)</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Official WhatsApp Group Card with Room-Specific Link */}
                <WhatsAppGroupCard
                  className="mb-6"
                  teamName={registeredSession.session.teamName}
                  groupUrl={registeredSession.game.whatsappGroupUrl || currentTargetGame?.whatsappGroupUrl || OFFICIAL_WHATSAPP_GROUP_URL}
                />

                {/* Direct Action Button */}
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleEnterLobby}
                  className="shadow-xl shadow-bwb-accent/25 text-base font-bold"
                >
                  Enter Event Lobby Directly <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REGISTRATION & JOIN CARD */}
        {!registeredSession && (
          <Card glow padding="md" className="border-bwb-border/80 shadow-2xl bg-gradient-to-b from-bwb-surface-2 to-bwb-surface">
            {/* Active Event Room Header with Mobile-Optimized Layout */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-bwb-bg/95 border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-bwb-accent/10 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2.5">
                {/* Top Mini Bar: Status Tag, Room Selector, & PIN Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${openGames.length === 0 ? 'bg-rose-400' : isRoomFull ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse shrink-0`} />
                    <span className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-widest">
                      {openGames.length === 0
                        ? 'Registration Closed'
                        : isRoomFull
                        ? 'Room At Capacity'
                        : 'Active Event Arena'}
                    </span>
                  </div>

                  {/* Room Code Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-bwb-surface-2 border border-bwb-accent/40 font-mono text-xs tracking-wider font-black text-bwb-accent shadow-sm flex items-center gap-1.5 select-all shrink-0">
                    <Radio size={12} className="text-bwb-accent animate-pulse shrink-0" />
                    <span>{openGames.length > 0 ? (currentTargetGame?.code || code) : 'CLOSED'}</span>
                  </div>
                </div>

                {/* Room Selector Dropdown: ONLY when 2 or more OPEN rooms exist */}
                {openGames.length > 1 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-wider">
                        Select Tournament Room / Event:
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {openGames.length} Open {openGames.length === 1 ? 'Room' : 'Rooms'}
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value)
                          setError('')
                          SoundFX.playCutePop()
                        }}
                        aria-label="Select Tournament Room"
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-bwb-surface border border-emerald-500/30 text-bwb-text text-xs sm:text-sm font-semibold focus:border-bwb-accent outline-none appearance-none cursor-pointer"
                      >
                        {openGames.map((g) => {
                          const openCount = Math.max(0, (g.maxTeams || 32) - g.teams.length)
                          return (
                            <option key={g.code} value={g.code} className="bg-bwb-bg text-bwb-text">
                              {g.name} ({g.code}) — {g.teams.length}/{g.maxTeams || 32} Squads ({openCount} slots open)
                            </option>
                          )
                        })}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-bwb-muted">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Event Title */}
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black text-bwb-text tracking-tight truncate">
                    {openGames.length === 0
                      ? (activeGames.length === 1 ? `${activeGames[0].name} (Registration Closed)` : activeGames.length > 1 ? 'All Tournament Rooms Closed' : 'No Tournament Rooms Available')
                      : (currentTargetGame?.name || 'Build Without Building Championship')}
                  </h3>
                </div>

                {/* Bottom Meta Row: Capacity Quota, WhatsApp Link Preview & Round Tag */}
                {openGames.length > 0 && currentTargetGame ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                    <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-xs ${
                      isRoomFull
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold'
                        : 'bg-bwb-surface-2/80 border-white/10 text-bwb-muted'
                    }`}>
                      {isRoomFull ? (
                        <>
                          <AlertTriangle size={12} className="text-rose-400 shrink-0" />
                          <span className="text-rose-300 font-bold">Room Full ({roomRegisteredCount}/{roomMaxTeams})</span>
                        </>
                      ) : (
                        <>
                          <Users size={12} className="text-bwb-accent shrink-0" />
                          <span className="text-bwb-text font-bold">{roomRegisteredCount}/{roomMaxTeams} Squads</span>
                          <span className="text-emerald-400 text-[11px] font-bold">({slotsRemaining} open)</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 shrink-0">
                        <WhatsAppIcon className="w-3 h-3" /> WhatsApp Enabled
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                        Round {currentTargetGame?.currentRound || 1} · {currentTargetGame?.phase ? currentTargetGame.phase.replace('_', ' ') : 'LOBBY'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 text-xs font-mono text-bwb-muted flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>Awaiting host to open tournament rooms for registration...</span>
                  </div>
                )}
              </div>
            </div>


            {/* Mode Switcher Tabs with Spring Sliding Pill */}
            <div className="relative grid grid-cols-2 gap-2 p-1.5 bg-bwb-bg rounded-2xl mb-6 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  if (activeTab !== 'register') {
                    setActiveTab('register')
                    setError('')
                    SoundFX.playCutePop()
                  }
                }}
                className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 select-none ${
                  activeTab === 'register' ? 'text-bwb-bg font-extrabold' : 'text-bwb-muted hover:text-bwb-text'
                }`}
              >
                {activeTab === 'register' && (
                  <motion.div
                    layoutId="activeJoinTabPill"
                    className="absolute inset-0 rounded-xl bg-bwb-accent shadow-[0_0_20px_rgba(0,229,199,0.35)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <UserPlus size={15} className="relative z-10" />
                <span className="relative z-10 flex items-center gap-1.5">
                  Register Team
                  {isRegistrationClosedByHost ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Registration Closed by Host" />
                  ) : isRoomFull ? (
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" title="Full" />
                  ) : null}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTab !== 'passcode') {
                    setActiveTab('passcode')
                    setError('')
                    SoundFX.playCutePop()
                  }
                }}
                className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 select-none ${
                  activeTab === 'passcode' ? 'text-bwb-bg font-extrabold' : 'text-bwb-muted hover:text-bwb-text'
                }`}
              >
                {activeTab === 'passcode' && (
                  <motion.div
                    layoutId="activeJoinTabPill"
                    className="absolute inset-0 rounded-xl bg-bwb-accent shadow-[0_0_20px_rgba(0,229,199,0.35)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Key size={15} className="relative z-10" />
                <span className="relative z-10">Passcode</span>
              </button>
            </div>

            <motion.div layout transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }} className="w-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {/* TAB 1: FULL TEAM REGISTRATION */}
                {activeTab === 'register' && (
                  isRegistrationClosedByHost ? (
                    /* NOTICE WHEN REGISTRATION IS CLOSED BY HOST */
                    <motion.div
                      key="join-tab-closed-by-host"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                      className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-bwb-bg border border-amber-400/30 text-center space-y-4 shadow-xl will-change-transform gpu-layer"
                    >
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/10">
                        <Lock size={28} />
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                          <Lock size={13} /> {activeGames.length === 0 ? 'No Active Rooms' : 'Registration Closed by Host'}
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-black text-bwb-text">
                          {activeGames.length === 0
                            ? 'No Tournament Rooms Available Yet'
                            : activeGames.length === 1
                            ? `Registration Closed for "${activeGames[0].name}"`
                            : 'All Tournament Registrations Are Paused'}
                        </h3>
                        <p className="text-xs sm:text-sm text-bwb-muted mt-2 max-w-md mx-auto leading-relaxed">
                          {activeGames.length === 0
                            ? "The host has not launched an active tournament room yet. Please check back shortly or wait for the organizer's announcement."
                            : activeGames.length === 1
                            ? `The host has closed/paused new team registrations for "${activeGames[0].name}". If your squad registered earlier, you can connect directly with your Team Passcode.`
                            : `The host has closed/paused new team registrations across all ${activeGames.length} tournament rooms. If your squad registered earlier, you can connect directly with your Team Passcode.`}
                        </p>
                      </div>

                      {/* Guidance Box for Already Registered Squads */}
                      <div className="p-4 rounded-2xl bg-bwb-surface-2/90 border border-white/10 text-left space-y-1.5 shadow-inner">
                        <p className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                          <Key size={14} className="shrink-0 text-amber-400" /> Already Registered Your Team?
                        </p>
                        <p className="text-xs text-bwb-muted leading-relaxed">
                          Your spot is safe! Switch to the <strong>Passcode</strong> tab to enter the lobby as your full team with all members.
                        </p>
                      </div>

                      <Button
                        fullWidth
                        size="lg"
                        onClick={() => {
                          setActiveTab('passcode')
                          setError('')
                          SoundFX.playCutePop()
                        }}
                        className="bg-amber-400 text-bwb-bg hover:bg-amber-300 font-bold text-sm shadow-xl shadow-amber-400/20"
                      >
                        <Key size={16} className="mr-2" />
                        Switch to Passcode Quick Join <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </motion.div>
                  ) : isRoomFull ? (
                    /* APOLOGY NOTICE & CAPACITY REACHED EXPLANATION */
                    <motion.div
                      key="join-tab-full-apology"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                      className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-bwb-bg border border-amber-400/30 text-center space-y-4 shadow-xl will-change-transform gpu-layer"
                    >
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/10">
                        <AlertTriangle size={28} />
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                          <ShieldAlert size={13} /> Registration Limit Reached ({roomRegisteredCount}/{roomMaxTeams} Teams)
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-black text-bwb-text">
                          We're Sincerely Sorry, Room Is Full!
                        </h3>
                        <p className="text-xs sm:text-sm text-bwb-muted mt-2 max-w-md mx-auto leading-relaxed">
                          This tournament room has reached its maximum capacity of <strong className="text-bwb-text">{roomMaxTeams} registered squads</strong> set by the host. New team registrations are closed for this session.
                        </p>
                      </div>

                      {/* Guidance Box for Already Registered Squads */}
                      <div className="p-4 rounded-2xl bg-bwb-surface-2/90 border border-white/10 text-left space-y-1.5 shadow-inner">
                        <p className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                          <Key size={14} className="shrink-0 text-amber-400" /> Already Registered Your Team Earlier?
                        </p>
                        <p className="text-xs text-bwb-muted leading-relaxed">
                          Your team spot is safely reserved! You or your teammates can enter the lobby anytime by entering your unique <strong>Team Passcode</strong> on the Passcode tab.
                        </p>
                      </div>

                      <Button
                        fullWidth
                        size="lg"
                        onClick={() => {
                          setActiveTab('passcode')
                          setError('')
                          SoundFX.playCutePop()
                        }}
                        className="bg-amber-400 text-bwb-bg hover:bg-amber-300 font-bold text-sm shadow-xl shadow-amber-400/20"
                      >
                        <Key size={16} className="mr-2" />
                        Switch to Passcode Quick Join <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </motion.div>
                  ) : (
                    /* STANDARD TEAM REGISTRATION FORM */
                    <motion.form
                      key="join-tab-register"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                      onSubmit={handleRegisterTeam}
                      className="space-y-5 will-change-transform gpu-layer"
                    >
                      <Input
                        label="Team Name *"
                        placeholder="e.g. Neural Ninjas"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        hint="Choose a memorable, technical team name"
                      />

                      {/* Contact Information (Email & Phone) */}
                      <div className="grid sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-mono uppercase text-bwb-muted font-bold block mb-1.5 flex items-center gap-1.5">
                            <Mail size={13} className="text-bwb-accent" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. teamlead@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bwb-bg/70 border border-bwb-border text-bwb-text text-sm font-medium placeholder:text-bwb-muted/60 focus:border-bwb-accent outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono uppercase text-bwb-muted font-bold block mb-1.5 flex items-center gap-1.5">
                            <Phone size={13} className="text-bwb-accent" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bwb-bg/70 border border-bwb-border text-bwb-text text-sm font-medium placeholder:text-bwb-muted/60 focus:border-bwb-accent outline-none"
                          />
                        </div>
                      </div>

                      {/* Academic Details (Department, Year, Section Dropdowns) */}
                      <div className="p-4 rounded-2xl bg-bwb-bg/60 border border-white/5 space-y-3">
                        <p className="text-[11px] font-mono uppercase text-bwb-accent font-bold tracking-wider flex items-center gap-1.5">
                          <GraduationCap size={14} />
                          Academic & College Details
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-mono text-bwb-muted font-semibold block mb-1">
                              Department
                            </label>
                            <div className="relative">
                              <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
                              >
                                <option value="">Select Dept</option>
                                <option value="AIDS">AIDS (AI & DS)</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="Other">Other</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-bwb-muted pointer-events-none" />
                            </div>
                          </div>

                          {/* Year Dropdown */}
                          <div>
                            <label className="text-[11px] font-mono text-bwb-muted font-semibold block mb-1">
                              Year
                            </label>
                            <div className="relative">
                              <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
                              >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-bwb-muted pointer-events-none" />
                            </div>
                          </div>

                          {/* Section Dropdown */}
                          <div>
                            <label className="text-[11px] font-mono text-bwb-muted font-semibold block mb-1">
                              Section
                            </label>
                            <div className="relative">
                              <select
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
                              >
                                <option value="">Select Section</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="Nil">Nil</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-bwb-muted pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Team Members List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono uppercase text-bwb-muted font-bold tracking-wider">
                            Team Members ({members.length}/3) · 2 or 3 Members
                          </label>
                          {members.length < 3 && (
                            <button
                              type="button"
                              onClick={handleAddMember}
                              className="text-xs text-bwb-accent hover:underline flex items-center gap-1 font-bold"
                            >
                              <Plus size={13} /> Add 3rd Teammate
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {members.map((member, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-2xl bg-bwb-bg/60 border border-white/5 flex items-center gap-3 transition-colors hover:border-white/10"
                            >
                              {/* Member Role Badge */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                i === 0
                                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                                  : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                              }`}>
                                {i === 0 ? <Crown size={16} /> : <span className="font-mono text-xs font-bold">#{i + 1}</span>}
                              </div>

                              {/* Text Input */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder={
                                    i === 0
                                      ? 'Team Leader Name (Required)'
                                      : i === 1
                                      ? 'Teammate #2 Name (Required)'
                                      : 'Teammate #3 Name (Optional 3rd Member)'
                                  }
                                  value={member}
                                  onChange={(e) => handleMemberChange(i, e.target.value)}
                                  className="w-full bg-transparent border-none text-bwb-text text-sm font-medium placeholder:text-bwb-muted/60 focus:outline-none"
                                />
                              </div>
                              {/* Delete Button (Only for 3rd member) */}
                              {i === 2 && members.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(i)}
                                  className="p-1.5 text-bwb-muted hover:text-bwb-danger transition-colors rounded-lg hover:bg-bwb-danger/10"
                                  title="Remove 3rd Teammate"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <p className="text-xs text-bwb-danger font-medium p-3 rounded-xl bg-bwb-danger/10 border border-bwb-danger/20">
                          {error}
                        </p>
                      )}

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        disabled={loading}
                        className="shadow-xl shadow-bwb-accent/20 font-bold text-sm"
                      >
                        <Sparkles size={16} className="mr-2" />
                        {loading ? 'Registering Team...' : 'Register Team & Generate Team ID'}
                      </Button>
                    </motion.form>
                  )
                )}

                {/* TAB 2: JOIN WITH UNIQUE TEAM PASSCODE */}
                {activeTab === 'passcode' && (
                  <motion.form
                    key="join-tab-passcode"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                    onSubmit={handlePasscodeJoin}
                    className="space-y-6 will-change-transform gpu-layer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase text-bwb-muted font-bold tracking-wider">
                          Team Passcode / Unique ID *
                        </label>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
                          Case-Insensitive
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                          <Key size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. COOK-829"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-bwb-bg/90 border-2 border-white/10 text-bwb-accent font-mono text-xl tracking-widest font-black placeholder:text-bwb-muted/40 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-bwb-accent focus:ring-2 focus:ring-bwb-accent/20 transition-all shadow-inner"
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-bwb-muted">
                        Enter the passcode given at registration. You will be connected as the entire team with all registered members.
                      </p>
                    </div>

                    {error && (
                      <p className="text-xs text-bwb-danger font-medium p-3 rounded-xl bg-bwb-danger/10 border border-bwb-danger/20">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={loading || !passcode.trim()}
                      className="shadow-xl shadow-bwb-accent/20 font-bold"
                    >
                      <Key size={16} className="mr-2" />
                      {loading ? 'Connecting Team...' : 'Enter Team Lobby with Full Roster'}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
