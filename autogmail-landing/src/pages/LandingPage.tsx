import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, Zap, Mail, ArrowRight, Sparkles, FileText, Clock, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.get('/auth/login');
      window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
      // For demo, navigate to login page
      navigate('/login');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-3 font-display font-bold text-2xl text-foreground">
          <div className="p-2 bg-gradient-primary rounded-xl">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <span>AutoGmail</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
        </div>
        <Button onClick={handleLogin} variant="default" size="default">
          Get Started
        </Button>
      </motion.nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-secondary border border-border px-4 py-2 rounded-full text-sm font-medium text-foreground mb-8"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Now with RAG Knowledge Base
        </motion.div>

        <motion.h1 
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
        >
          Turn your inbox into <br />
          <span className="text-gradient">automated productivity.</span>
        </motion.h1>

        <motion.p 
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          AutoGmail learns from your past emails and company documents to draft 
          accurate, professional replies in seconds.
        </motion.p>

        <motion.div 
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button onClick={handleLogin} variant="hero" size="xl">
            Sign in with Google
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="hero-outline" size="xl">
            <Sparkles className="w-5 h-5" />
            View Demo
          </Button>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-card rounded-2xl p-3 shadow-card-hover border border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="bg-secondary rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
              {/* Mock Dashboard Preview */}
              <div className="w-full h-full flex">
                {/* Sidebar Mock */}
                <div className="w-1/4 bg-card border-r border-border p-4 space-y-3">
                  <div className="h-8 bg-gradient-primary rounded-lg w-3/4" />
                  <div className="space-y-2 mt-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-2 bg-muted/50 rounded w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <div className="p-4 bg-gradient-hero rounded-2xl">
                    <Mail className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-sm font-medium">AI-Powered Email Dashboard</p>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Elements */}
          <div className="absolute -left-8 top-1/4 animate-float">
            <div className="p-4 bg-card rounded-2xl shadow-card border border-border">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="absolute -right-8 top-1/3 animate-float-delayed">
            <div className="p-4 bg-card rounded-2xl shadow-card border border-border">
              <Bot className="w-6 h-6 text-accent" />
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              <span className="text-gradient">Powerful Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to reclaim your time from email overload.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
              title="Instant Drafts"
              desc="Click one button to generate a context-aware reply based on the email thread."
              delay={0}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
              title="Private Knowledge"
              desc="Upload PDF policies or sync past emails. Your data stays in your private vector database."
              delay={0.1}
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
              title="Human-in-the-loop"
              desc="AI drafts the email, but you always have the final say. Edit, approve, or discard."
              delay={0.2}
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three simple steps to transform your email workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Connect Gmail"
              desc="Securely link your Google account with OAuth. We never store your password."
              icon={<Mail className="w-8 h-8" />}
              delay={0}
            />
            <StepCard
              number="02"
              title="Train Your AI"
              desc="Upload company documents or sync sent emails to build your personal knowledge base."
              icon={<FileText className="w-8 h-8" />}
              delay={0.15}
            />
            <StepCard
              number="03"
              title="Draft & Send"
              desc="Click to generate replies instantly. Review, edit, and send with confidence."
              icon={<Zap className="w-8 h-8" />}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCard value="85%" label="Time Saved" icon={<Clock className="w-5 h-5" />} />
            <StatCard value="10K+" label="Emails Drafted" icon={<Mail className="w-5 h-5" />} />
            <StatCard value="99.9%" label="Accuracy Rate" icon={<Check className="w-5 h-5" />} />
            <StatCard value="500+" label="Happy Users" icon={<Users className="w-5 h-5" />} />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-12 bg-card rounded-3xl border border-border shadow-card relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to <span className="text-gradient">automate</span> your inbox?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of professionals who save hours every week with AI-powered email drafting.
              </p>
              <Button onClick={handleLogin} variant="hero" size="xl">
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-card py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 font-display font-bold text-xl text-foreground">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>AutoGmail</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 AutoGmail Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  delay: number;
}

const FeatureCard = ({ icon, iconBg, iconColor, title, desc, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="bg-card p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group"
  >
    <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-6 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="font-display text-xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

interface StepCardProps {
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  delay: number;
}

const StepCard = ({ number, title, desc, icon, delay }: StepCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    <div className="text-8xl font-display font-bold text-gradient opacity-10 absolute -top-6 -left-2 group-hover:opacity-20 transition-opacity duration-300">
      {number}
    </div>
    <div className="relative pt-8">
      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 text-primary-foreground shadow-button group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard = ({ value, label, icon }: StatCardProps) => (
  <div className="text-center group">
    <div className="inline-flex items-center gap-2 text-primary mb-2">
      {icon}
    </div>
    <div className="font-display text-4xl font-bold text-foreground mb-1 group-hover:text-gradient transition-all duration-300">{value}</div>
    <div className="text-muted-foreground text-sm">{label}</div>
  </div>
);

export default LandingPage;
