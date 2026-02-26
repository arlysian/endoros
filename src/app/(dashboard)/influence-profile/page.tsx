"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useUser } from "@/components/DashboardLayout";
import Cropper, { Area } from "react-easy-crop";

export default function InfluenceProfile() {
  const { user, refreshUser } = useUser();

  // Image URLs (from server or local preview)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Pending files to upload on save
  const [pendingPfp, setPendingPfp] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  // Username validation
  const [userNameError, setUserNameError] = useState<string | null>(null);
  const [checkingUserName, setCheckingUserName] = useState(false);
  const userNameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const pfpInputRef = useRef<HTMLInputElement>(null);

  // Sync images with user data (always keep in sync after save)
  useEffect(() => {
    if (user) {
      if (user.profileImageUrl && !pendingPfp) setProfileImagePreview(user.profileImageUrl);
    }
  }, [user, pendingPfp]);

  // Sync form data only on initial load
  useEffect(() => {
    if (user && !formLoaded) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        category: user.category || "",
        website: user.website || "",
        location: user.location || "",
        bio: user.bio || "",
        audienceSummary: user.audienceSummary || "",
      });
      setFormLoaded(true);
    }
  }, [user, formLoaded]);

  // Check username availability with debounce
  const checkUserNameAvailability = useCallback(async (userName: string) => {
    if (!userName || userName === user?.userName) {
      setUserNameError(null);
      setCheckingUserName(false);
      return;
    }
    const reserved = ["example"];
    if (reserved.includes(userName.toLowerCase())) {
      setUserNameError("This username is already taken");
      setCheckingUserName(false);
      return;
    }

    setCheckingUserName(true);
    try {
      const res = await fetch(`/api/user/check-username?userName=${encodeURIComponent(userName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.taken) {
          setUserNameError("This username is already taken");
        } else {
          setUserNameError(null);
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUserName(false);
    }
  }, [user?.userName]);

  // Handle username change with debounce
  const handleUserNameChange = (value: string) => {
    const sanitized = value.replace(/\s/g, "");
    setFormData({ ...formData, userName: sanitized });

    // Clear previous timeout
    if (userNameCheckTimeout.current) {
      clearTimeout(userNameCheckTimeout.current);
    }

    // Clear error while typing
    if (value === user?.userName) {
      setUserNameError(null);
      return;
    }

    // Debounce the check
    userNameCheckTimeout.current = setTimeout(() => {
      checkUserNameAvailability(value);
    }, 500);
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not create blob"));
          return;
        }
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg", 0.9);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCropImage(previewUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropModalOpen(true);
    }
    e.target.value = "";
  };

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    try {
      const croppedFile = await createCroppedImage(cropImage, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);

      setPendingPfp(croppedFile);
      setProfileImagePreview(previewUrl);

      setCropModalOpen(false);
      setCropImage(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image");
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropImage(null);
  };

  const handleSaveChanges = async () => {
    // Prevent saving if username is taken
    if (userNameError) {
      alert("Please fix the username error before saving");
      return;
    }

    setSaving(true);
    try {
      // Upload pending profile image
      if (pendingPfp) {
        await uploadImage(pendingPfp, "pfp");
      }

      // Save form data
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save profile");
      }

      // Refresh user data first, then clear pending files
      // This prevents useEffect from briefly showing old images
      await refreshUser();

      setPendingPfp(null);

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const res = await fetch("/api/user/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pfp" }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to remove image");
        return;
      }

      setProfileImagePreview(null);
      setPendingPfp(null);

      await refreshUser();
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove image");
    }
  };

  const uploadImage = async (file: File, type: "pfp" | "hero") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/user/image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Upload failed");
    }

    const { url } = await res.json();
    setProfileImagePreview(url);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    category: "",
    website: "",
    location: "",
    bio: "",
    audienceSummary: "",
  });

  interface Achievement {
    id: string;
    title: string;
    description: string | null;
    date: string | null;
    category: string | null;
  }

  interface Collaboration {
    id: string;
    brand: string;
    campaign: string | null;
    date: string | null;
    type: string | null;
  }

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);

  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabDate, setCollabDate] = useState<Date | undefined>(undefined);
  const [newCollab, setNewCollab] = useState({
    brand: "",
    campaign: "",
    date: "",
    type: "Paid",
  });

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementDate, setAchievementDate] = useState<Date | undefined>(undefined);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    date: "",
    category: "Media",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "collab" | "achievement"; id: string | number } | null>(null);

  // Fetch achievements and collaborations on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [achievementsRes, collaborationsRes] = await Promise.all([
          fetch("/api/achievements"),
          fetch("/api/collaborations"),
        ]);

        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          setAchievements(data);
        }

        if (collaborationsRes.ok) {
          const data = await collaborationsRes.json();
          setCollaborations(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchData();
  }, []);

  const categories = [
    "Fashion & Style",
    "Beauty & Makeup",
    "Fitness & Health",
    "Travel & Adventure",
    "Food & Cooking",
    "Technology",
    "Gaming",
    "Entertainment",
    "Education",
    "Business & Finance",
  ];

  const addCollaboration = async () => {
    if (newCollab.brand && newCollab.campaign) {
      try {
        const res = await fetch("/api/collaborations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCollab),
        });

        if (res.ok) {
          const data = await res.json();
          setCollaborations([data, ...collaborations]);
          setNewCollab({ brand: "", campaign: "", date: "", type: "Paid" });
          setCollabDate(undefined);
          setShowCollabModal(false);
          await refreshUser(); // Update Live Preview
        } else {
          alert("Failed to add collaboration");
        }
      } catch (error) {
        console.error("Error adding collaboration:", error);
        alert("Failed to add collaboration");
      }
    }
  };

  const addAchievement = async () => {
    if (newAchievement.title && newAchievement.description) {
      try {
        const res = await fetch("/api/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAchievement),
        });

        if (res.ok) {
          const data = await res.json();
          setAchievements([data, ...achievements]);
          setNewAchievement({ title: "", description: "", date: "", category: "Media" });
          setAchievementDate(undefined);
          setShowAchievementModal(false);
          await refreshUser(); // Update Live Preview
        } else {
          alert("Failed to add achievement");
        }
      } catch (error) {
        console.error("Error adding achievement:", error);
        alert("Failed to add achievement");
      }
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        if (deleteConfirm.type === "collab") {
          const res = await fetch(`/api/collaborations?id=${deleteConfirm.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setCollaborations(collaborations.filter(c => c.id !== deleteConfirm.id));
            await refreshUser(); // Update Live Preview
          } else {
            alert("Failed to delete collaboration");
          }
        } else {
          const res = await fetch(`/api/achievements?id=${deleteConfirm.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setAchievements(achievements.filter(a => a.id !== deleteConfirm.id));
            await refreshUser(); // Update Live Preview
          } else {
            alert("Failed to delete achievement");
          }
        }
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete");
      }
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Profile</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your influencer profile</p>
      </div>

      {/* Basic Information */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-black mb-6">Basic Information</h2>

        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center relative ${profileImagePreview ? "" : "bg-gray-200"}`}>
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-400" />
            )}
            {pendingPfp && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => pfpInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-black hover:bg-hover transition-colors"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {profileImagePreview ? "Change" : "Upload"}
                </span>
              </button>
              {profileImagePreview && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove</span>
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-400">
              JPG, PNG up to 5MB
              {pendingPfp && <span className="text-yellow-600 ml-2">• Unsaved</span>}
            </p>
            <input
              ref={pfpInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              maxLength={50}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              maxLength={50}
              placeholder="Enter your last name"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">User Name / Creator Name</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleUserNameChange(e.target.value)}
              maxLength={30}
              placeholder="@yourname"
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black ${userNameError ? "border border-red-500" : ""}`}
            />
            {checkingUserName && (
              <p className="text-sm text-neutral-400 mt-1">Checking availability...</p>
            )}
            {userNameError && (
              <p className="text-sm text-red-500 mt-1">{userNameError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Select your primary category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black appearance-none cursor-pointer"
            >
              <option value="">Please select</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Website (Optional)</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              maxLength={200}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              maxLength={100}
              placeholder="Los Angeles, CA"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-black mb-2">Bio / About</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={500}
            rows={4}
            placeholder="Add a bio to tell brands about yourself."
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-black mb-2">Audience Summary</label>
          <textarea
            value={formData.audienceSummary}
            onChange={(e) => setFormData({ ...formData, audienceSummary: e.target.value })}
            maxLength={300}
            rows={3}
            placeholder="e.g., Young professionals aged 25-34, interested in tech and lifestyle..."
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black resize-none"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Achievements & Highlights */}
      <section className="bg-white rounded-xl p-6  mb-6">
        <h2 className="text-lg font-medium text-black mb-6">Achievements & Highlights</h2>

        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border border-border rounded-xl p-4 flex items-start justify-between"
            >
              <div>
                <h3 className="font-medium text-black mb-1">{achievement.title}</h3>
                <p className="text-sm text-neutral-400 mb-3">{achievement.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-black">
                    {achievement.date}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-black">
                    {achievement.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm({ type: "achievement", id: achievement.id })}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAchievementModal(true)}
          className="flex items-center gap-2 mt-4 text-neutral-500 hover:text-black transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Achievements</span>
        </button>
      </section>

      {/* Brand Collaborations */}
      <section className="bg-white rounded-xl p-6  mb-6">
        <h2 className="text-lg font-medium text-black mb-6">Brand Collaborations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collaborations.map((collab) => (
            <div
              key={collab.id}
              className="border border-border rounded-xl p-4 flex items-start justify-between"
            >
              <div>
                <h3 className="font-medium text-black mb-1">{collab.brand}</h3>
                <p className="text-sm text-neutral-400 mb-3">{collab.campaign}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-black">
                    {collab.date}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-black">
                    {collab.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm({ type: "collab", id: collab.id })}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowCollabModal(true)}
          className="flex items-center gap-2 mt-4 text-neutral-500 hover:text-black transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Brand Collaboration</span>
        </button>
      </section>

      {/* Add Collaboration Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">Add Brand Collaboration</h2>
              <button
                onClick={() => setShowCollabModal(false)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Brand Name *</label>
                <input
                  type="text"
                  value={newCollab.brand}
                  onChange={(e) => setNewCollab({ ...newCollab, brand: e.target.value })}
                  maxLength={100}
                  placeholder="e.g. Nike"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={newCollab.campaign}
                  onChange={(e) => setNewCollab({ ...newCollab, campaign: e.target.value })}
                  maxLength={150}
                  placeholder="e.g. Summer Collection"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-auto justify-start text-left font-normal px-4 py-3 bg-gray-50 rounded-lg text-black hover:bg-gray-100 border-none text-base"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {collabDate ? format(collabDate, "MMM yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={collabDate}
                        onSelect={(date) => {
                          setCollabDate(date);
                          if (date) {
                            setNewCollab({ ...newCollab, date: format(date, "yyyy-MM") });
                          }
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Type</label>
                  <select
                    value={newCollab.type}
                    onChange={(e) => setNewCollab({ ...newCollab, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Gifted">Gifted</option>
                    <option value="Event">Event</option>
                    <option value="Ambassador">Ambassador</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCollabModal(false)}
                className="flex-1 px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-black hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCollaboration}
                className="flex-1 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Add Collaboration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">Add Achievement</h2>
              <button
                onClick={() => setShowAchievementModal(false)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Title *</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  maxLength={150}
                  placeholder="e.g. Featured in Vogue Magazine"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Description *</label>
                <input
                  type="text"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  maxLength={300}
                  placeholder="e.g. Cover story feature"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-auto justify-start text-left font-normal px-4 py-3 bg-gray-50 rounded-lg text-black hover:bg-gray-100 border-none text-base"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {achievementDate ? format(achievementDate, "MMM yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={achievementDate}
                        onSelect={(date) => {
                          setAchievementDate(date);
                          if (date) {
                            setNewAchievement({ ...newAchievement, date: format(date, "yyyy-MM") });
                          }
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category</label>
                  <select
                    value={newAchievement.category}
                    onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                  >
                    <option value="Media">Media</option>
                    <option value="Events">Events</option>
                    <option value="Awards">Awards</option>
                    <option value="Features">Features</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAchievementModal(false)}
                className="flex-1 px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-black hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addAchievement}
                className="flex-1 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-black mb-2">Are you sure?</h2>
            <p className="text-sm text-neutral-400 mb-6">
              This {deleteConfirm.type === "collab" ? "collaboration" : "achievement"} will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-black hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-black">
                Crop Profile Picture
              </h2>
            </div>

            <div className="relative h-[400px] bg-gray-900">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-neutral-400">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-black hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex-1 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

