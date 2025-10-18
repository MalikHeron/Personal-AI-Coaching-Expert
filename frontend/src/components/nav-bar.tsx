import {
  IconX,
  IconStretching,
  IconMenu3,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { useActiveSection } from "@/hooks/use-active-section";
import { useNavigate } from "react-router-dom";

function NavLinks({ onClick, activeId }: { onClick: (id: string) => void; activeId: string }) {
  const links = ["features", "product", "about", "contact"];
  const isMobile = useIsMobile();

  return (
    <>
      {links.map((id) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          onClick={() => onClick(id)}
          className={`cursor-pointer px-2 tracking-wide transition ${activeId === id
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-primary"
            }`}
        >
          <span className={`${isMobile ? "uppercase" : "capitalize"}`}>{id}</span>
        </Button>
      ))}
    </>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const scrollY = useScrollPosition();
  const activeId = useActiveSection(["features", "product", "about", "contact"]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <nav
      className={`flex justify-between md:justify-evenly px-4 sticky top-0 h-16 shrink-0 items-center gap-2 w-full z-[45] transition-all duration-300 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ${scrollY > 20
        ? "bg-background/60 backdrop-blur-lg shadow-sm"
        : "bg-transparent"
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2  cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <IconStretching className="size-5 text-primary" />
        <span className="font-semibold text-base tracking-wide">P.A.C.E</span>
      </div>

      {/* Desktop Links */}
      {!isMobile && (
        <>
          <div className='group text-sm flex gap-4'>
            <NavLinks onClick={handleScrollTo} activeId={activeId} />
          </div>
          <div className='flex gap-2 items-center'>
            <Button variant='ghost' size='sm' onClick={() => navigate('/login')} className='cursor-pointer px-2 text-muted-foreground transition'>Log in</Button>
            <ShimmerButton className="shadow-2xl p-2" onClick={() => navigate('/signup')}>
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white dark:from-white dark:to-slate-500/10">
                Sign up
              </span>
            </ShimmerButton>
            <AnimatedThemeToggler />
          </div>
        </>
      )}

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <div className='flex gap-4 items-center justify-end'>
          <ShimmerButton className="shadow-2xl p-2" onClick={() => navigate('/signup')}>
            <span className="text-center text-md leading-none font-medium tracking-tight whitespace-pre-wrap text-white dark:from-white dark:to-slate-500/10">
              Sign up
            </span>
          </ShimmerButton>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => {
              if (!open) {
                // window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => setOpen(true), 200);
              } else {
                setOpen(false);
              }
            }}
            className="focus:outline-none z-[65]"
          >
            {open ? (
              <IconX className="size-6 text-foreground" />
            ) : (
              <IconMenu3 className="size-6 text-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)} // tap outside closes
          className={`fixed left-0 right-0 top-0 h-[100vh] z-[60] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden touch-none ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
            className={`flex flex-col items-center justify-center h-full space-y-8 transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-6"
              }`}
          >
            <NavLinks onClick={handleScrollTo} activeId={activeId} />
            {/* Theme Toggler */}
            <div className="absolute bottom-10 flex justify-center">
              <AnimatedThemeToggler />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}