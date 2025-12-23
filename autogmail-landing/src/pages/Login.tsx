import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Link } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/login');
      window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card rounded-3xl border border-border p-10 shadow-card relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-hero opacity-30 pointer-events-none" />
          
          <div className="relative">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-4 bg-gradient-primary rounded-2xl shadow-button"
              >
                <Bot className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue to AutoGmail
              </p>
            </motion.div>

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleLogin}
                disabled={loading}
                variant="hero"
                size="xl"
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Sign in with Google
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-secondary/50 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <span>AI-powered drafting with your company knowledge</span>
              </div>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-muted-foreground text-sm mt-6"
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
