<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
<<<<<<< HEAD
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const [userUuid, setUserUuid] = useState(null);

=======

export default function Profile() {
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

<<<<<<< HEAD
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

=======
  const handleUpdateProfile = () => {
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
<<<<<<< HEAD

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
=======
    toast.success("Profile updated successfully!");
  };

>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
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
<<<<<<< HEAD

=======
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
<<<<<<< HEAD
=======
                placeholder="Enter your full name"
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
<<<<<<< HEAD

=======
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
<<<<<<< HEAD
=======
                placeholder="Enter your email"
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
<<<<<<< HEAD

=======
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
<<<<<<< HEAD
=======
                type="tel"
                placeholder="Enter your phone number"
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
<<<<<<< HEAD

=======
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
<<<<<<< HEAD
=======
                placeholder="Enter new password"
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
<<<<<<< HEAD

          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
=======
          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpdateProfile}>
              Update Profile
            </Button>
>>>>>>> 6429c629eeb1a71586c786a0a686eaf5be82bae9
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
