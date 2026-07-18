import './SettingsForm.css'
import { FC, FormEvent, useState } from 'react'

export const SettingsForm: FC = () => {
  const [email] = useState('user@example.com')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sessions] = useState([
    { id: 1, device: 'MacBook Pro', location: 'Canada', active: true },
    { id: 2, device: 'iPhone 14', location: 'Montreal', active: false }
  ])

  const handleEmailChange = (e: FormEvent): void => {
    e.preventDefault()
    // Call backend to update email
  }

  const handlePasswordChange = (e: FormEvent): void => {
    e.preventDefault()
    // Call backend to update password
  }

  return (
    <div className='settings-page'>
      <h1>Settings</h1>

      <section className='settings-section'>
        <h2>Change Email</h2>
        <form onSubmit={handleEmailChange} className='settings-form'>
          <input
            type='email'
            placeholder='New email'
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button type='submit'>Update Email</button>
        </form>
        <p className='current-email'>Current email: <strong>{email}</strong></p>
      </section>

      <section className='settings-section'>
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange} className='settings-form'>
          <input
            type='password'
            placeholder='Current password'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type='password'
            placeholder='New password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type='submit'>Update Password</button>
        </form>
      </section>

      <section className='settings-section'>
        <h2>Active Sessions</h2>
        <ul className='sessions-list'>
          {sessions.map((s) => (
            <li key={s.id}>
              <div>
                <strong>{s.device}</strong> — {s.location}
              </div>
              <span className={`session-status ${s.active ? 'active' : 'inactive'}`}>
                {s.active ? 'Active' : 'Logged out'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className='settings-section danger-zone'>
        <h2>Danger Zone</h2>
        <button className='delete-account-btn'>Delete My Account</button>
      </section>
    </div>
  )
}
