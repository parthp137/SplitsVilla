import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const tabs = ["Profile", "Security", "Preferences"];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState(0);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currency, setCurrency] = useState(user?.currencyPreference || "INR");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({ title: "Name cannot be empty", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      updateProfile({ name, bio });
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleChangeAvatar = async () => {
    toast({ title: "Avatar upload coming soon!", description: "This feature will be available in the next update." });
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Please fill all password fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (currentPassword === newPassword) {
      toast({ title: "New password must be different from current", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Simulate password change
      await new Promise((r) => setTimeout(r, 800));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update password", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      updateProfile({ currencyPreference: currency });
      toast({ title: "Preferences saved successfully!" });
    } catch (error) {
      toast({ title: "Failed to save preferences", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Settings</h1>
        <div className="mt-6 flex gap-1 rounded-xl bg-muted p-1">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActive(i)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${i === active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
        {active === 0 && (
          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{user?.name?.[0]}</div>
              <Button variant="outline" size="sm" onClick={handleChangeAvatar}>Change Avatar</Button>
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Email</label><Input value={user?.email} disabled /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label><Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." /></div>
            <Button onClick={handleUpdateProfile} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        )}
        {active === 1 && (
          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
            <Button onClick={handlePasswordChange} disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
          </div>
        )}
        {active === 2 && (
          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
            <div><label className="mb-1.5 block text-sm font-medium text-foreground">Currency Preference</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="AED">AED (د.إ)</option></select>
            </div>
            <Button onClick={handleSavePreferences} disabled={loading}>{loading ? "Saving..." : "Save Preferences"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
