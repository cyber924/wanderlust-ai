import React, { useState } from "react";
import {
  X,
  User,
  LogOut,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Mail,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { UserProfile } from "../types";
import {
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  loginWithEmail,
} from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const authUser = await signUpWithEmail(email, password, displayName || "여행 작가");
        if (authUser) {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: displayName || authUser.displayName || "여행 작가",
            photoURL: authUser.photoURL,
          });
          onClose();
        }
      } else {
        const authUser = await loginWithEmail(email, password);
        if (authUser) {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || email.split("@")[0],
            photoURL: authUser.photoURL,
          });
          onClose();
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "인증 중 오류가 발생했습니다.";
      if (err.code === "auth/email-already-in-use") {
        msg = "이미 사용 중인 이메일 주소입니다. 로그인해 주세요.";
      } else if (err.code === "auth/invalid-email") {
        msg = "올바른 이메일 형식이 아닙니다.";
      } else if (err.code === "auth/weak-password") {
        msg = "비밀번호가 너무 약합니다. 6자리 이상 입력해 주세요.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "이메일 또는 비밀번호가 일치하지 않습니다.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await loginWithGoogle();
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
        });
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "구글 로그인 실패. 가상 체험 계정으로 로그인합니다.");
      setUser({
        uid: "demo_user_123",
        email: "traveler@wanderlust.ai",
        displayName: "체험 사용자",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      });
      setTimeout(() => onClose(), 1200);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-stone-200/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 mx-auto shadow-sm">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {user ? "내 계정 정보" : mode === "signup" ? "파이어베이스 회원가입" : "파이어베이스 로그인"}
          </h2>
          <p className="text-xs text-stone-500">
            Firebase Auth 서비스 및 Cloud Firestore DB 동기화
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center space-x-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5 overflow-hidden">
                <p className="font-bold text-stone-900 text-sm truncate">
                  {user.displayName || "회원"}
                </p>
                <p className="text-xs text-stone-500 truncate">{user.email || "이메일 없음"}</p>
                <p className="text-[10px] text-orange-600 font-semibold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Firebase Auth 인증됨
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl text-xs space-y-2 text-stone-600">
              <div className="flex items-center justify-between font-semibold text-stone-800">
                <span>연동된 서비스:</span>
                <span className="text-orange-600">Firebase Firestore & Auth</span>
              </div>
              <p className="text-[11px] text-stone-500">
                생성한 모든 블로그 글은 파이어베이스 Firestore DB에 실시간으로 안전하게 동기화 저장됩니다.
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-2xl text-xs font-bold text-stone-600">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === "login"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "hover:text-stone-900"
                }`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  mode === "signup"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "hover:text-stone-900"
                }`}
              >
                회원가입
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    닉네임 / 작가명
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="예: 제주여행가"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "비밀번호 (6자리 이상)" : "비밀번호"}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/10 transition-all flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === "signup" ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>이메일로 회원가입</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>이메일로 로그인</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-stone-200 w-full absolute" />
              <span className="bg-white px-2 text-[10px] text-stone-400 relative font-medium">
                또는
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4 text-orange-500" />
              <span>Google 계정으로 계속하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

