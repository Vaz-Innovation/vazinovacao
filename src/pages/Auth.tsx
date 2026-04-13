import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/blog", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Login realizado com sucesso" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-normal text-foreground text-center mb-12 font-serif">
          Entrar
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-foreground/20 bg-background text-foreground"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-foreground/20 bg-background text-foreground"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Acesso restrito à equipe administrativa.
        </p>
      </div>
    </div>
  );
};

export default Auth;
