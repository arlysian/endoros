"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Cropper, { Area } from "react-easy-crop";
import {
  Shirt,
  Sparkles,
  Dumbbell,
  Plane,
  UtensilsCrossed,
  Monitor,
  Gamepad2,
  Clapperboard,
  GraduationCap,
  Briefcase,
  ArrowLeft,
  Check,
  Upload,
  MapPin,
  User,
} from "lucide-react";

const TOTAL_STEPS = 6; // 0-5

const categories = [
  { label: "Fashion & Style", icon: Shirt },
  { label: "Beauty & Makeup", icon: Sparkles },
  { label: "Fitness & Health", icon: Dumbbell },
  { label: "Travel & Adventure", icon: Plane },
  { label: "Food & Cooking", icon: UtensilsCrossed },
  { label: "Technology", icon: Monitor },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Entertainment", icon: Clapperboard },
  { label: "Education", icon: GraduationCap },
  { label: "Business & Finance", icon: Briefcase },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = url;
  });
}

async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
  });
}

export default function Onboarding() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [firstName, setFirstName] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    location: "",
    category: "",
    phone: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [userFailed, setUserFailed] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [userNameError, setUserNameError] = useState<string | null>(null);
  const [checkingUserName, setCheckingUserName] = useState(false);
  const userNameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Photo state
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function waitForUser() {
      for (let i = 0; i < 20; i++) {
        const res = await fetch("/api/user");
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.firstName) setFirstName(data.firstName);
          setUserReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!cancelled) setUserFailed(true);
    }
    waitForUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const checkUserNameAvailability = useCallback(async (userName: string) => {
    if (!userName) {
      setUserNameError(null);
      setCheckingUserName(false);
      return;
    }
    setCheckingUserName(true);
    try {
      const res = await fetch(
        `/api/user/check-username?userName=${encodeURIComponent(userName)}`
      );
      if (res.ok) {
        const data = await res.json();
        setUserNameError(data.taken ? "This username is already taken" : null);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUserName(false);
    }
  }, []);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^\d+\-\s()]/g, "");
    setFormData((prev) => ({ ...prev, phone: cleaned }));

    if (!cleaned) {
      setPhoneError(null);
    } else if (
      !/^\+\d{1,3}[\s\-]?\d{8,14}$/.test(cleaned.replace(/[\s\-()]/g, ""))
    ) {
      setPhoneError(
        "Enter a valid number with country code (e.g. +1 555 1234567)"
      );
    } else {
      setPhoneError(null);
    }
  };

  const handleUserNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userName: value }));
    if (userNameCheckTimeout.current) {
      clearTimeout(userNameCheckTimeout.current);
    }
    userNameCheckTimeout.current = setTimeout(() => {
      checkUserNameAvailability(value);
    }, 500);
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handlePhotoCrop = async () => {
    if (!photoFile || !croppedAreaPixels) return;
    const blob = await getCroppedImg(photoFile, croppedAreaPixels);
    setCroppedPhoto(blob);
    setCroppedPreview(URL.createObjectURL(blob));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoFile(reader.result as string);
      setCroppedPhoto(null);
      setCroppedPreview(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoFile(reader.result as string);
      setCroppedPhoto(null);
      setCroppedPreview(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Upload photo if present
      if (croppedPhoto) {
        const fd = new FormData();
        fd.append("file", croppedPhoto, "profile.jpg");
        fd.append("type", "pfp");
        await fetch("/api/user/image", { method: "POST", body: fd });
      }

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.userName,
          location: formData.location || undefined,
          category: formData.category,
          phone: formData.phone,
          bio: formData.bio || undefined,
          onboardingCompleted: true,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save profile");
      }

      // Move to completion step
      goNext();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  // Loading / error state
  if (!userReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center px-6 h-16 relative z-10">
          <Link
            href="/"
            className="text-base font-semibold text-black tracking-tight"
          >
            endoros
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          {userFailed ? (
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-4">
                Something went wrong setting up your account.
              </p>
              <button
                onClick={() => {
                  setUserFailed(false);
                  setUserReady(false);
                  let i = 0;
                  const retry = setInterval(async () => {
                    const res = await fetch("/api/user");
                    if (res.ok) {
                      setUserReady(true);
                      clearInterval(retry);
                    }
                    if (++i >= 10) {
                      setUserFailed(true);
                      clearInterval(retry);
                    }
                  }, 1000);
                }}
                className="px-4 py-2 text-sm font-medium text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">
              Setting up your account...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 h-16 relative z-10">
        <Link
          href="/"
          className="text-base font-semibold text-black tracking-tight"
        >
          endoros
        </Link>
      </header>

      {/* Progress bar */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="w-full h-1 bg-neutral-100">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0 — Welcome */}
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                  className="flex flex-col items-center"
                >
                  <motion.h1
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-3xl font-semibold text-black mb-3"
                  >
                    Welcome to endoros
                    {firstName ? `, ${firstName}` : ""}!
                  </motion.h1>
                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-neutral-500 mb-10"
                  >
                    Let&apos;s set up your creator profile in just a few steps.
                  </motion.p>
                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    onClick={goNext}
                    className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 1 — Username */}
            {step === 1 && (
              <motion.div
                key="username"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition-colors mb-6"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="text-2xl font-semibold text-black mb-2">
                  Choose your username
                </h2>
                <p className="text-neutral-500 mb-6">
                  This is how others will find you on endoros.
                </p>
                <div className="bg-neutral-50 rounded-2xl p-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => handleUserNameChange(e.target.value)}
                      placeholder="yourname"
                      autoFocus
                      className={`w-full pl-8 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 ${
                        userNameError ? "ring-2 ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {checkingUserName && (
                    <p className="text-sm text-neutral-500 mt-2">
                      Checking availability...
                    </p>
                  )}
                  {userNameError && (
                    <p className="text-sm text-red-500 mt-2">{userNameError}</p>
                  )}
                  {formData.userName &&
                    !checkingUserName &&
                    !userNameError && (
                      <p className="text-sm text-green-600 mt-2">
                        Username available
                      </p>
                    )}
                </div>
                <button
                  onClick={goNext}
                  disabled={
                    !formData.userName || !!userNameError || checkingUserName
                  }
                  className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2 — Category */}
            {step === 2 && (
              <motion.div
                key="category"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition-colors mb-6"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="text-2xl font-semibold text-black mb-2">
                  What&apos;s your niche?
                </h2>
                <p className="text-neutral-500 mb-6">
                  Pick the category that best describes your content.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(({ label, icon: Icon }) => {
                    const selected = formData.category === label;
                    return (
                      <button
                        key={label}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: label }))
                        }
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-neutral-50 text-black hover:border-neutral-400"
                        }`}
                      >
                        <Icon size={24} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={goNext}
                  disabled={!formData.category}
                  className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 3 — Details */}
            {step === 3 && (
              <motion.div
                key="details"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition-colors mb-6"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="text-2xl font-semibold text-black mb-2">
                  A few more details
                </h2>
                <p className="text-neutral-500 mb-6">
                  Help brands get to know you better.
                </p>
                <div className="bg-neutral-50 rounded-2xl p-6 space-y-5">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+1 555 1234567"
                      className={`w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 ${
                        phoneError ? "ring-2 ring-red-500/20" : ""
                      }`}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Los Angeles, CA"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={goNext}
                  disabled={!formData.phone || !!phoneError}
                  className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 4 — Profile Photo */}
            {step === 4 && (
              <motion.div
                key="photo"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black transition-colors mb-6"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="text-2xl font-semibold text-black mb-2">
                  Add a profile photo
                </h2>
                <p className="text-neutral-500 mb-6">
                  Show brands the face behind the content.
                </p>

                {!photoFile ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300 p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-neutral-400 transition-colors"
                  >
                    <Upload size={32} className="text-neutral-400" />
                    <p className="text-sm text-neutral-500">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-neutral-400">
                      JPEG, PNG or WebP, max 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>
                ) : croppedPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-200">
                      <Image
                        src={croppedPreview}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setCroppedPhoto(null);
                        setCroppedPreview(null);
                      }}
                      className="text-sm text-neutral-500 hover:text-black transition-colors"
                    >
                      Re-crop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                      <Cropper
                        image={photoFile}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Zoom</span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-black"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setPhotoFile(null);
                          setCroppedPhoto(null);
                          setCroppedPreview(null);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={handlePhotoCrop}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        Crop
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setCroppedPhoto(null);
                      setCroppedPreview(null);
                      handleSubmit();
                    }}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-neutral-100 text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || (!!photoFile && !croppedPreview)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5 — Completion */}
            {step === 5 && (
              <motion.div
                key="done"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={32} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-black mb-2">
                  You&apos;re all set!
                </h2>
                <p className="text-neutral-500 mb-8">
                  Your creator profile is ready to go.
                </p>

                {/* Profile preview card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-neutral-50 rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                      {croppedPreview ? (
                        <Image
                          src={croppedPreview}
                          alt="Profile"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-black truncate">
                        @{formData.userName}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {formData.category}
                      </p>
                      {formData.location && (
                        <p className="text-sm text-neutral-400 flex items-center gap-1 truncate">
                          <MapPin size={12} /> {formData.location}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
