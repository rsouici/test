"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import api from "@/api/api";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";


type Step = "signup" | "login";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isSignup = step === "signup";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  try {
    setLoading(true);
    setMessage("");

    // 🔒 Eksekusi reCAPTCHA sebelum submit
    const token = await captchaRef.current?.executeAsync();
    captchaRef.current?.reset();

    const endpoint = isSignup ? "/signup" : "/login";
    const payload = isSignup
      ? {
          name: form.name,
          email: form.email,
          password: form.password,
          "g-recaptcha-response": token,
        }
      : {
          email: form.email,
          password: form.password,
          "g-recaptcha-response": token,
        };

    const res = await api.post(endpoint, payload);

    if (res.data.message?.toLowerCase().includes("otp")) {
      window.location.href = `/verify-otp?mode=${
        isSignup ? "signup" : "login"
      }&email=${encodeURIComponent(form.email)}`;
    } else {
      setMessage(res.data.message || "Silakan verifikasi email Anda.");
    }
  } catch (err: any) {
    console.error("❌ Error saat auth:", err);


if (err.response && err.response.data && err.response.data.errors) {
  const errors = err.response.data.errors;
  // Ensure that each item in errorMessages is a string
  const errorMessages: string[] = Object.values(errors)
    .flat()
    .map(e => String(e));

  setMessage(errorMessages[0] || "Terjadi kesalahan validasi.");
   } 
else if (err.response?.data?.message) {
  // Ensure err.response.data.message is converted to a string
  setMessage(String(err.response.data.message)); // <-- ADD String(...)
}
    else {
      setMessage("Terjadi kesalahan server. Coba lagi nanti.");
    }
  } finally {
    setLoading(false);
  }
};



  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const id_token = credentialResponse.credential;
      const res = await api.post("/auth/google", { id_token });

      if (res.data.is_new) {
        alert("Akun baru terdeteksi. OTP signup telah dikirim ke email Anda.");
        router.push(
          `/verify-otp?mode=signup&email=${encodeURIComponent(res.data.email)}`
        );
      } else {
        alert("OTP login telah dikirim ke email Anda.");
        router.push(
          `/verify-otp?mode=login&email=${encodeURIComponent(res.data.email)}`
        );
      }
    } catch (err: any) {
      console.error("❌ Google auth gagal:", err);
      alert(err.response?.data?.message || "Gagal login dengan Google.");
    }
  };

  const handleGoogleError = () => {
    alert("Login dengan Google gagal. Coba lagi.");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white overflow-hidden px-4">
      {/* === Background Video === */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video/richardmille1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* === Card === */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-richardmille.png"
            alt="Logo"
            width={140}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isSignup ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
        </h2>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-gray-500 rounded-lg px-10 py-3 focus:border-white outline-none text-white"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                placeholder="Alamat Email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-500 rounded-lg px-10 py-3 focus:border-white outline-none text-white"
              />
            </div>

            

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type="password"
                placeholder="Kata Sandi"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-500 rounded-lg px-10 py-3 focus:border-white outline-none text-white"
              />
            </div>

            {!isSignup && (
              <div className="text-right">
                <button
                  onClick={() => (window.location.href = "/forgot-password")}
                  className="text-xs text-gray-400 hover:text-white transition"
                >
                  Lupa kata sandi?
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Message */}
        {message && (
          <p className="text-sm text-gray-300 text-center mt-3">{message}</p>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-white text-black mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
        >
          {loading ? "Loading..." : isSignup ? "Daftar Sekarang" : "Masuk"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        

        {/* Garis pemisah */}
        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="px-4 text-sm text-gray-400">atau</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        {/* ✅ Google Sign In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
        </div>

        {/* Switch Mode */}
        <p className="text-sm text-gray-400 mt-6 text-center">
          {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            onClick={() => setStep(isSignup ? "login" : "signup")}
            className="text-white font-semibold hover:underline"
          >
            {isSignup ? "Masuk di sini" : "Buat Akun"}
          </button>
        </p>
      </motion.div>
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        size="invisible"
        ref={captchaRef}
      />

    </div>
  );
}
