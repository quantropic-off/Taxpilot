import AppLayout from "@/components/layout/AppLayout";
import { MessageSquare, Sparkles, Send, Bot, User, BookOpen } from "lucide-react";

export default function AITaxAssistant() {
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto">
        <div className="flex-none mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Tax Tutor
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">Get intelligent hints and guidance without revealing direct answers.</p>
        </div>

        <div className="flex-1 bg-card border border-border/40 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
          
          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">Taxpilot AI</span>
                  <span className="text-[11px] text-muted-foreground">10:02 AM</span>
                </div>
                <div className="text-[14px] leading-relaxed text-foreground bg-accent/5 p-4 rounded-xl rounded-tl-none border border-border/30 inline-block">
                  <p>Welcome! I noticed you are working on the **GST Practice Module** (GSTR-3B). I've analyzed your current session.</p>
                  <p className="mt-2">I see you are trying to claim Input Tax Credit (ITC) for an invoice with HSN Code `9982`. However, the supplier's state code `27` (Maharashtra) differs from your state code `07` (Delhi), and you've entered it under SGST.</p>
                  <div className="mt-4 p-3 bg-card border border-border/50 rounded-lg flex gap-3 items-start">
                    <BookOpen className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <div>
                      <span className="text-[12px] font-medium text-foreground block">Hint: Inter-state vs Intra-state supply</span>
                      <span className="text-[12px] text-muted-foreground">When the supplier and place of supply are in different states, which tax component should you use instead of CGST/SGST?</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0">
                JD
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">10:05 AM</span>
                  <span className="text-[13px] font-medium text-foreground">You</span>
                </div>
                <div className="text-[14px] leading-relaxed text-card-foreground bg-primary/5 dark:bg-primary/20 p-4 rounded-xl rounded-tr-none border border-border/40 inline-block max-w-[80%]">
                  Ah, because it's inter-state, it should be IGST. Let me fix the table entry.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">Taxpilot AI</span>
                  <span className="text-[11px] text-muted-foreground">10:05 AM</span>
                </div>
                <div className="text-[14px] leading-relaxed text-foreground bg-accent/5 p-4 rounded-xl rounded-tl-none border border-border/30 inline-block">
                  Exactly! Good job spotting that. Inter-state transactions attract Integrated Goods and Services Tax (IGST). Let me know when you run into the next validation error.
                </div>
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-md">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Ask about a tax rule, section, or specific error..." 
                className="w-full bg-card border border-border/50 rounded-full pl-5 pr-12 py-3 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all shadow-sm"
              />
              <button className="absolute right-2 p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 justify-center mt-3">
              <button className="text-[11px] px-3 py-1 rounded-full border border-border/50 text-muted-foreground hover:bg-accent/10 transition-colors">Explain Section 194C</button>
              <button className="text-[11px] px-3 py-1 rounded-full border border-border/50 text-muted-foreground hover:bg-accent/10 transition-colors">Why did my GSTR-1 validation fail?</button>
              <button className="text-[11px] px-3 py-1 rounded-full border border-border/50 text-muted-foreground hover:bg-accent/10 transition-colors">Compare New vs Old Tax Regime</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
