import React from 'react';
import useLogin from './useLogin';

const AuthForm = () => {
  const {
    formData,
    loading,
    message,
    handleInput,
    handleSubmit,
  } = useLogin();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-purple-700 via-blue-500 to-indigo-800 blur-3xl opacity-40" />

      <div className="z-10 bg-white shadow-xl rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Master Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <select
            name="role"
            value={formData.role}
            onChange={handleInput}
            className="w-full p-3 rounded-xl border border-gray-300"
          >
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="therapist">Therapist</option>
          </select> */}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInput}
            required
            className="w-full p-3 rounded-xl border border-gray-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInput}
            required
            className="w-full p-3 rounded-xl border border-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200"
          >
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-red-500 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
