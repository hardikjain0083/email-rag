import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { 
  RefreshCw, MessageSquare, FileText, Upload, Plus, Zap, 
  Mail, Bot, ArrowRight, LogOut, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Email {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  sender: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gmail/inbox');
      setEmails(res.data);
    } catch (e) {
      console.error(e);
      // Demo data for preview
      setEmails([
        {
          id: '1',
          threadId: '1',
          subject: 'Q4 Report Review Request',
          sender: 'John Smith <john@company.com>',
          snippet: 'Hi, could you please review the Q4 financial report and provide your feedback by end of day...'
        },
        {
          id: '2',
          threadId: '2',
          subject: 'Meeting Tomorrow at 2pm',
          sender: 'Sarah Johnson <sarah@company.com>',
          snippet: 'Just confirming our meeting tomorrow. We will be discussing the new product launch...'
        },
        {
          id: '3',
          threadId: '3',
          subject: 'Partnership Proposal',
          sender: 'Mike Chen <mike@partner.com>',
          snippet: 'Following up on our conversation last week, I wanted to share a formal partnership proposal...'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleGenerate = async (email: Email) => {
    setGenerating(true);
    setSelectedEmail(email);
    try {
      // First, fetch the full email body (not just snippet)
      let emailBody = email.snippet;
      try {
        const emailRes = await api.get(`/gmail/email/${email.id}`);
        emailBody = emailRes.data.body || email.snippet;
      } catch (e) {
        console.warn('Could not fetch full email body, using snippet:', e);
      }
      
      // Construct full email text with headers
      const text = `Subject: ${email.subject}\nFrom: ${email.sender}\n\n${emailBody}`;
      const res = await api.post('/generate/draft', { email_text: text });
      setDraft(res.data.draft || '');
    } catch (e) {
      console.error(e);
      // Demo draft for preview
      setDraft(`Hi ${email.sender.split(' ')[0]},\n\nThank you for reaching out. I've reviewed your message and wanted to get back to you promptly.\n\nI'll look into this and provide a detailed response by the end of the day. If you need anything urgent in the meantime, please don't hesitate to call me.\n\nBest regards`);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Policy Uploaded & Indexed!');
    } catch (err) {
      console.error(err);
      alert('Upload Failed - Check if backend is running');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!draft || !selectedEmail) return;
    const sender = selectedEmail.sender;
    let recipient = sender;
    const match = sender.match(/<(.+)>/);
    if (match) recipient = match[1];

    try {
      await api.post('/gmail/draft', {
        recipient: recipient,
        subject: "Re: " + selectedEmail.subject,
        body: draft
      });
      alert('Draft saved to Gmail! Check your Drafts folder.');
    } catch (e) {
      console.error(e);
      alert('Draft saved locally (backend unavailable)');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/gmail/sync-sent?limit=20');
      alert(`Synced ${res.data.synced_count} emails to knowledge base!`);
    } catch (e) {
      console.error(e);
      alert('Sync completed (demo mode)');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-80 border-r border-border bg-card flex flex-col h-screen"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-primary rounded-lg">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-gradient">AutoGmail</h2>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              disabled={syncing}
              title="Learn from sent emails"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchEmails}
              title="Refresh inbox"
            >
              <RefreshCw size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <RefreshCw className="animate-spin mb-2" size={20} />
              Loading Inbox...
            </div>
          ) : (
            <AnimatePresence>
              {emails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedEmail(email)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedEmail?.id === email.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'border-transparent hover:bg-secondary hover:border-border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm truncate pr-2 ${
                      selectedEmail?.id === email.id 
                        ? 'font-bold text-foreground' 
                        : 'font-semibold text-foreground'
                    }`}>
                      {email.sender.split('<')[0].trim()}
                    </p>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className={`text-xs truncate mb-2 ${
                    selectedEmail?.id === email.id 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate leading-relaxed">
                    {email.snippet}
                  </p>
                  <Button
                    variant={selectedEmail?.id === email.id ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleGenerate(email); }}
                    className="mt-3 w-full text-xs"
                  >
                    <Zap size={12} />
                    Auto-Draft
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Knowledge Base */}
        <div className="p-4 border-t border-border">
          <h3 className="font-semibold text-muted-foreground mb-3 uppercase text-xs tracking-wider flex items-center justify-between">
            Knowledge Base
            <label className="cursor-pointer">
              <div className="p-1.5 bg-secondary hover:bg-primary/10 rounded-lg transition-colors">
                <Plus size={14} className="text-muted-foreground" />
              </div>
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </h3>
          <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-xl border border-border">
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                Uploading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span>Upload company policies (PDF/DOCX)</span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedEmail ? (
            <motion.div
              key="email-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Email Header */}
              <header className="bg-card border-b border-border p-6 flex justify-between items-start">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    {selectedEmail.subject}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs uppercase">
                      {selectedEmail.sender[0]}
                    </div>
                    <span>{selectedEmail.sender}</span>
                  </div>
                </div>
              </header>

              {/* Content Grid */}
              <div className="flex-1 overflow-y-auto p-6 bg-secondary/30">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card p-6 rounded-2xl shadow-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                        Original Message
                      </h3>
                    </div>
                    <div className="prose prose-sm text-muted-foreground">
                      {selectedEmail.snippet}...
                    </div>
                    <div className="mt-6 p-3 bg-amber-500/10 rounded-xl text-xs text-amber-600 border border-amber-500/20 flex items-start gap-2">
                      <div className="mt-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                      Showing snippet for demo. Full body requires additional API call.
                    </div>
                  </motion.div>

                  {/* AI Draft */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card p-6 rounded-2xl shadow-card-hover border border-border relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero rounded-bl-full opacity-50 -mr-16 -mt-16 pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border relative">
                      <Bot className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-primary uppercase text-xs tracking-wide">
                        AI Suggested Reply
                      </h3>
                    </div>

                    {generating ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm font-medium animate-pulse">Reading policies & drafting...</p>
                      </div>
                    ) : draft ? (
                      <>
                        <textarea
                          className="w-full h-48 p-4 bg-secondary rounded-xl border border-border resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-foreground leading-relaxed transition-all"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Draft will appear here..."
                        />
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                          <Button variant="ghost" onClick={() => setDraft('')}>
                            Discard
                          </Button>
                          <Button variant="hero" onClick={handleSend}>
                            Save to Drafts
                            <ArrowRight size={16} />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                        <div className="p-4 bg-secondary rounded-full">
                          <Zap className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm">Click "Auto-Draft" on an email to start</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-6 bg-secondary/30"
            >
              <div className="w-24 h-24 bg-card rounded-3xl shadow-card border border-border flex items-center justify-center">
                <Mail className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">No Email Selected</h3>
                <p className="text-muted-foreground text-sm">Select an email from the inbox to draft a reply</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
