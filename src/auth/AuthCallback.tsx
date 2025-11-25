import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // nice spinner icon

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleOAuthRedirect() {
      const { data: { session }, error } = await supabase.auth.getSession(); 
      if (error) {
        console.error(error);
        return;
      }

      if (session?.user) {
        console.log("Logged in user:", session.user);

        // Send user info to backend to store in tbl_user
        await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            full_name: session.user.user_metadata.full_name || "",
            phone_number: session.user.user_metadata.phone || "",
            user_uuid: session.user.id, // ✅ Add Supabase Auth UUID here
          }),
        });

        navigate("/dashboard");
      }
    }

    handleOAuthRedirect();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Logging you in...</h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Please wait while we securely sign you in with Google.
        </p>
      </div>
    </div>
  );
}
