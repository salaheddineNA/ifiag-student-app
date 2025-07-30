import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 py-8">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-900 mb-2">IFIAG</h1>
          <p className="text-orange-700">Student Registration</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
