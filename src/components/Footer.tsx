'use client';
import Link from 'next/link';
import { Github, Twitter, Disc, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/5 bg-black/40 backdrop-blur-xl">
      {/* Creative Background Elements */}
      <div className="absolute -top-[300px] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Large Watermark Text */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none text-[12vw] font-bold leading-none text-white/[0.02]">
        PROMPTVERSE
      </div>

      <div className="container relative mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="flex flex-col justify-between md:col-span-5">
            <div className="space-y-4">
              <h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
                PromptVerse.
              </h3>
              <p className="max-w-sm text-base text-muted-foreground/80">
                The next generation marketplace for AI prompts.
                Tokenize your imagination and trade the future.
              </p>
            </div>

            <div className="mt-8 flex gap-4 md:mt-0">
              <SocialLink icon={<Twitter size={20} />} href="#" />
              <SocialLink icon={<Github size={20} />} href="#" />
              <SocialLink icon={<Disc size={20} />} href="#" />
            </div>
          </div>

          {/* Links Column */}
          <div className="flex flex-col justify-end gap-8 md:col-span-7 md:flex-row md:gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-sm text-purple-400">EXPLORE</h4>
              <FooterLink href="/marketplace">Marketplace</FooterLink>
              <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              <FooterLink href="/create">Create</FooterLink>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-sm text-blue-400">ACCOUNT</h4>
              <FooterLink href="/profile">Profile</FooterLink>
              <FooterLink href="/profile?tab=favorites">Favorites</FooterLink>
              <FooterLink href="/profile?tab=following">Following</FooterLink>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-sm text-green-400">LEGAL</h4>
              <FooterLink href="#">Privacy</FooterLink>
              <FooterLink href="#">Terms</FooterLink>
              <FooterLink href="#">License</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PromptVerse Inc.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a
    href={href}
    className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400"
  >
    {icon}
  </a>
);

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="group flex items-center gap-1 text-muted-foreground transition-colors hover:text-white"
  >
    <span>{children}</span>
    <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
  </Link>
);

export default Footer;
