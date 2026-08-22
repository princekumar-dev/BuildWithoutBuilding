import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Key, ArrowRight, CheckCircle2,
  Copy, Sparkles, UserCheck, Plus, Trash2, Crown, Radio,
  Mail, Phone, GraduationCap
} from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { useGameStore } from '../../store/gameStore'
import { api } from '../../lib/api'
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

  // Auto-fetch active games and default to the latest created room
  useEffect(() => {
    api.listGames().then((games) => {
      setActiveGames(games)
      if (games.length > 0) {
        const latest = games[games.length - 1]
        setCode(latest.code)
      }
    }).catch(() => {})
  }, [])

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
      setError(err instanceof Error ? err.message : 'Unable to register team.')
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
                      {copied ? <CheckCircle2 size={14} className="text-bwb-success mr-1" /> : <Copy size={14} className="mr-1" />}
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
            {/* Locked Active Event Room Header */}
            <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-bwb-bg/80 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
              <div className="truncate">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-bwb-success animate-pulse shrink-0" />
                  <label className="text-[10px] font-mono uppercase text-bwb-muted font-bold tracking-widest truncate">
                    ACTIVE EVENT ROOM
                  </label>
                </div>
                <p className="text-xs font-semibold text-bwb-text truncate">
                  {activeGames.length > 0 ? (activeGames[activeGames.length - 1]?.name || 'Live Tournament Room') : 'Live Competition Room'}
                </p>
              </div>

              <div className="px-3 sm:px-4 py-2 rounded-xl bg-bwb-surface-2 border border-bwb-accent/40 font-mono text-sm sm:text-base tracking-widest font-black text-bwb-accent shadow-sm flex items-center gap-1.5 shrink-0 select-all">
                <Radio size={13} className="text-bwb-accent animate-pulse shrink-0" />
                <span>{code || (activeGames.length > 0 ? activeGames[activeGames.length - 1]?.code : 'BWB-LIVE')}</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-bwb-bg rounded-2xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError('') }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-bwb-accent text-bwb-bg shadow-md'
                    : 'text-bwb-muted hover:text-bwb-text'
                }`}
              >
                <UserPlus size={15} />
                <span>Register Team</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('passcode'); setError('') }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'passcode'
                    ? 'bg-bwb-accent text-bwb-bg shadow-md'
                    : 'text-bwb-muted hover:text-bwb-text'
                }`}
              >
                <Key size={15} />
                <span>Passcode</span>
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {/* TAB 1: FULL TEAM REGISTRATION */}
              {activeTab === 'register' && (
                <motion.form
                  key="join-tab-register"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
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
                        placeholder="e.g. teamlead@college.edu"
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
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full px-3 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
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
                      </div>

                      {/* Year Dropdown */}
                      <div>
                        <label className="text-[11px] font-mono text-bwb-muted font-semibold block mb-1">
                          Year
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full px-3 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>

                      {/* Section Dropdown */}
                      <div>
                        <label className="text-[11px] font-mono text-bwb-muted font-semibold block mb-1">
                          Section
                        </label>
                        <select
                          value={section}
                          onChange={(e) => setSection(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full px-3 py-2.5 rounded-xl bg-bwb-surface border border-bwb-border text-bwb-text text-xs font-semibold focus:border-bwb-accent outline-none cursor-pointer"
                        >
                          <option value="">Select Section</option>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="Nil">Nil</option>
                        </select>
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
              )}

              {/* TAB 2: JOIN WITH UNIQUE TEAM PASSCODE */}
              {activeTab === 'passcode' && (
                <motion.form
                  key="join-tab-passcode"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
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
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
