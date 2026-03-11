import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import wakaLogo from "@/assets/waka-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to home
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Credenciales incorrectas. Verifica tu email y contraseña.");
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <img src={wakaLogo} alt="WAKA XP" className="h-12 w-12 rounded-xl object-contain" />
              <div className="absolute -inset-1 rounded-xl bg-primary/10 blur-sm -z-10" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-wide">WAKA XP</h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Experience Platform</p>
          </div>
        </div>

        {/* Login card */}
        <Card className="border-border/50">
          <CardHeader className="pb-0 pt-5 px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>Acceso restringido</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@organización.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/60">
          Acceso exclusivo para operadores autorizados
        </p>
      </div>
    </div>
  );
}
