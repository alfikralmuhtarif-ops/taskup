import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'

/// Strips a leading "966" or "0" so pasting/typing the full number (with country
/// code) doesn't get double-prefixed into "+966966XXXXXXXXX" — this was silently
/// creating the wrong account and causing repeated "Incorrect code" confusion.
function normalizeLocalPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('966')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [requestId, setRequestId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRequestOtp = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.requestOtp('+966', normalizeLocalPhone(phone))
      setRequestId(res.requestId)
      setStep('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال الرمز')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(requestId, code)

      const payload = JSON.parse(atob(res.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.is_admin !== 'true' && payload.is_admin !== true) {
        setError('هذا الحساب لا يملك صلاحية الوصول للوحة التحكم.')
        return
      }

      login(res.accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'رمز غير صحيح')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-[#2185C7] mb-1">TaskUp</div>
          <div className="text-sm text-gray-500">لوحة التحكم الإدارية</div>
        </div>

        {step === 'phone' ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">رقم الجوال</label>
              <div dir="ltr" className="flex gap-2">
                <div className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 shrink-0">+966</div>
                <input
                  value={phone}
                  onChange={e => setPhone(normalizeLocalPhone(e.target.value))}
                  placeholder="5XXXXXXXX"
                  maxLength={9}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2185C7]"
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              onClick={handleRequestOtp}
              disabled={phone.length < 8 || loading}
              className="w-full py-2.5 rounded-lg bg-[#2185C7] text-white text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? '...' : 'إرسال رمز التحقق'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">رمز التحقق</label>
              <input
                dir="ltr"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-lg text-center tracking-[6px] outline-none focus:border-[#2185C7]"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
              className="w-full py-2.5 rounded-lg bg-[#2185C7] text-white text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? '...' : 'تأكيد'}
            </button>
            <button onClick={() => setStep('phone')} className="text-xs text-gray-400">
              تغيير الرقم
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
