
import { Bot, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { IconBarbell, IconMessageReport, IconTimeDuration15 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import NavBar from "@/components/nav-bar";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Rep-by-Rep Feedback",
      desc: "AI evaluates each repetition as Good or Bad and gives instant corrective cues.",
      icon: <IconMessageReport size={30} />,
    },
    {
      title: "Tempo & Speed Tracking",
      desc: "Detects if you're going too fast or too slow and helps you hit the optimal training rhythm.",
      icon: <IconTimeDuration15 size={30} />,
    },
    {
      title: "AI Coach",
      desc: "Chat with your AI coach for real-time tips and personalized guidance.",
      icon: <Bot size={30} />,
    },
  ];

  const team = [
    { name: "Malik Heron", role: "Frontend Developer & UX" },
    { name: "Sherissa Pinnock", role: "AI Engineer" },
    { name: "Trishanna Ford", role: "Backend Engineer" },
  ];

  // Scroll or navigate to section with offset for sticky navbar
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -75; // Offset for the navbar height in px (e.g., 64px)
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <NavBar />

      <div className="flex flex-col items-center overflow-hidden w-full min-h-screen">
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Hero */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <TextAnimate
                animation="blurInUp"
                by="word"
                delay={0.5}
                once
                className="text-4xl text-foreground md:text-5xl font-extrabold leading-tight"
              >
                Master every rep with AI precision.
              </TextAnimate>
              <TextAnimate animation="fadeIn" by="line" delay={0.5} once className="mt-4 text-muted-foreground">P.A.C.E (Personal AI Coaching Expert) uses real-time motion tracking to correct form, measure tempo, and score reps so you train smarter and safer.</TextAnimate>

              <div className="mt-6 flex gap-4">
                <Button
                  data-aos='fade-right'
                  data-aos-once="true"
                  data-aos-delay={500}
                  variant='default'
                  size='lg'
                  className="cursor-pointer"
                  onClick={() => navigate('/signup')}
                >
                  <IconBarbell /> Start Training
                </Button>
                <Button
                  data-aos='fade-right'
                  data-aos-once="true"
                  data-aos-delay={400}
                  variant='ghost'
                  size='lg'
                  className="cursor-pointer"
                  onClick={() => handleScrollTo('product')}
                >
                  How it works
                  <ChevronRight />
                </Button>
              </div>

              <div data-aos="flip-up" data-aos-once="true" data-aos-delay={500} className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">Form Accuracy</div>
                  <div className="text-xl font-semibold">92%</div>
                </div>
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">Good Reps</div>
                  <div className="text-xl font-semibold">78 / 100</div>
                </div>
                <div className="p-4 bg-card rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground">Avg Rep Speed</div>
                  <div className="text-xl font-semibold">1.8s</div>
                </div>
              </div>
            </div>

            {/* Camera / Pose mockup */}
            <div data-aos='zoom-in' data-aos-once="true" data-aos-delay={500} className="relative">
              <img src="/pose_tracking.svg" alt="Pose Tracking" />
            </div>
          </section>

          {/* Features */}
          <section id="features" className="mt-20">
            <TextAnimate
              animation="blurInUp"
              by="word"
              delay={0.5}
              once
              className="text-2xl font-bold">
              Features
            </TextAnimate>
            <TextAnimate animation="fadeIn" by="line" delay={0.5} once className="mt-2 text-muted-foreground max-w-2xl">Everything you need to bring an intelligent trainer into your home — without wearables.</TextAnimate>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} data-aos="zoom-in" data-aos-once="true" data-aos-delay={500}>
                  <div className="cursor-pointer p-6 bg-card rounded-xl shadow-sm transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 hover:shadow-lg will-change-transform">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-md">{f.icon}</div>
                      <div>
                        <h3 className="font-semibold">{f.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Product Explanation */}
          <section id="product" className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div data-aos='fade-up' data-aos-once="true" data-aos-delay={300}>
              <h2 className="text-2xl font-bold">How P.A.C.E helps you train</h2>
              <p className="mt-3 text-muted-foreground">Using MediaPipe pose estimation as the core motion detector, P.A.C.E processes keypoints and joint angles to determine posture and tempo. Our inference engine scores each repetition, flags risky ranges of motion, and offers micro-corrections you can apply mid-set.</p>

              <ul className="mt-6 space-y-3">
                <li className="flex gap-3 items-start">
                  <div className="mt-1">•</div>
                  <div>
                    <div className="font-semibold">Real-time correction</div>
                    <div className="text-sm text-muted-foreground">Audio and visual cues help you adjust form immediately so mistakes aren't repeated.</div>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="mt-1">•</div>
                  <div>
                    <div className="font-semibold">Progress analytics</div>
                    <div className="text-sm text-muted-foreground">Session summaries show trends in accuracy, tempo, and rep quality to guide program tweaks.</div>
                  </div>
                </li>
              </ul>

              <div className="mt-6 flex gap-3">
                <Button
                  data-aos='fade-right'
                  data-aos-once="true"
                  data-aos-delay={100}
                  variant='default'
                  className="cursor-pointer"
                  onClick={() => navigate('/demo')}
                >
                  Try a Demo
                </Button>
                <Button data-aos='fade-right' data-aos-once="true" variant='outline' className="cursor-pointer">Read Docs</Button>
              </div>
            </div>

            <div data-aos='fade-up' data-aos-once="true" data-aos-delay={300} className="bg-card p-4 rounded-xl shadow-sm">
              <h4 className="font-semibold">Live session preview</h4>
              <div className="mt-4 bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Exercise</div>
                    <div className="font-medium">Bicep Curls</div>
                  </div>
                  <AnimatedCircularProgressBar
                    className="size-12 text-sm"
                    value={80}
                    gaugePrimaryColor="rgb(34 197 94)"
                    gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                  />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="p-2 bg-card rounded-md shadow-sm">
                    <div className="text-xs text-muted-foreground">Reps Completed</div>
                    <div className="font-semibold">8 / 10</div>
                  </div>
                  <div className="p-2 bg-card rounded-md shadow-sm">
                    <div className="text-xs text-muted-foreground">Sets Completed</div>
                    <div className="font-semibold">1 / 5</div>
                  </div>
                  <div className="p-2 bg-card rounded-md shadow-sm">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="font-semibold">00:24 mins</div>
                  </div>
                  <div className="p-2 bg-card rounded-md shadow-sm">
                    <div className="text-xs text-muted-foreground">Rest Timer</div>
                    <div className="font-semibold">15 secs</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">Tip: Slow the descent 10% to increase tension and improve depth.</div>
              </div>
            </div>
          </section>

          {/* About & Team Combined Section */}
          <section id='about' className="mt-20">
            <div data-aos='fade-up' data-aos-once="true" data-aos-delay={300} className="md:flex md:items-center md:justify-between">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold">About Us</h2>
                <p className="mt-4 text-muted-foreground max-w-lg">P.A.C.E (Personal AI Coaching Expert) combines MediaPipe pose estimation with custom inference logic to deliver high-quality, real-time workout feedback. We focus on usability, privacy-first camera processing, and reproducible progress so you can improve safely.</p>
                <div className="mt-8">
                  <Button data-aos='fade-right' data-aos-once="true" data-aos-delay={300} variant='secondary' className="cursor-pointer" onClick={() => navigate('/login')}>Start your journey</Button>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="mt-20">
              <TextAnimate
                animation="blurInUp"
                by="word"
                delay={0.5}
                once
                className="text-2xl font-bold text-center"
              >
                Meet the Team
              </TextAnimate>
              <TextAnimate
                animation="fadeIn"
                by="line"
                delay={0.5}
                once
                className="mt-2 text-muted-foreground text-center"
              >
                Engineers and designers building the future of at-home coaching.
              </TextAnimate>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
                {team.map((m, i) => (
                  <div
                    key={m.name}
                    data-aos="fade-up"
                    data-aos-once="true"
                    data-aos-delay={300 + i * 100}
                    className="p-6 bg-card rounded-xl text-center shadow-sm w-full max-w-xs"
                  >
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                      {m.name.split(" ")[0].slice(0, 1)}
                    </div>
                    <div className="mt-4 font-semibold">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mt-32 max-w-4xl mx-auto text-center px-6">
            <TextAnimate
              animation="blurInUp"
              by="word"
              delay={0.5}
              once
              className="text-2xl font-bold"
            >
              Get in Touch
            </TextAnimate>
            <TextAnimate
              animation="fadeIn"
              by="line"
              delay={0.5}
              once
              className="mt-2 text-muted-foreground"
            >
              Have questions or feedback? We'd love to hear from you.
            </TextAnimate>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer"
                onClick={() => (window.location.href = "mailto:example@gmail.com")}
              >
                Email Us
              </Button>
            </div>
          </section>
        </main>
      </div>

      <Separator className="max-w-full" />
      {/* Footer */}
      <footer className="py-6 md:py-8 px-2 sm:px-4 w-full">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} P.A.C.E</div>
          <a href="mailto:example@gmail.com" className="hover:text-foreground">Contact Support</a>
        </div>
      </footer>
    </>
  );
};