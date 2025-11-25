import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const [userUuid, setUserUuid] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  // -----------------------------
  // 1. GET SESSION + LOAD PROFILE
  // -----------------------------
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Supabase getSession error:", error.message);
        return;
      }

      const user = data.session?.user;

if (user) {
  setUserUuid(user.id);     // Supabase Auth UUID
  setEmail(user.email ?? "");

  // Fetch user profile using user_uuid
const { data: profile, error: profileError } = await supabase
  .from("tbl_user")
  .select("*")
  .eq("user_uuid", user.id)   // user.id is a UUID string
  .single();


  if (!profileError && profile) {
    setFullName(profile.full_name || "");
    setPhoneNumber(profile.phone_number || "");
  }
}

    }

    fetchUser();
  }, []);

  // -----------------------------
  // 2. UPDATE PROFILE
  // -----------------------------
  const handleUpdateProfile = async () => {
    if (!userUuid) {
      toast.error("User not logged in");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase
      .from("tbl_user")
      .update({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        password: password,
      })
      .eq("user_uuid", userUuid);   // ← FIXED

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
      return;
    }

    toast.success("Profile updated successfully!");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
