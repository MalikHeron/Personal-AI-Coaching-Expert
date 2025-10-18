import Navbar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { IconBarbell } from "@tabler/icons-react";
import { BotIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "AI Motion Tracking",
    description: "Your camera becomes your trainer. Using MediaPipe, P.A.C.E analyzes body movement in real-time to detect your posture, form, and exercise performance.",
    icon: <IconBarbell />
  },
  {
    title: "Rep-by-Rep Feedback",
    description: "Every repetition counts. P.A.C.E classifies each rep as Good or Bad, giving you immediate feedback so you can correct form instantly.",
    icon: <IconBarbell />
  },
  {
    title: "AI Coaching",
    description: "Get personalized coaching tips based on your performance. P.A.C.E suggests adjustments to improve your form, speed, and overall workout effectiveness.",
    icon: <BotIcon />
  }
]

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className='flex flex-col px-4 py-8 md:py-16 w-full overflow-hidden'>
        <main className="flex flex-col justify-center mx-auto w-full max-w-7xl gap-12">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="flex flex-col max-w-lg gap-4">
              <TextAnimate animation="blurInUp" by="word" delay={0.3} once className="text-5xl font-bold tracking-tight">
                Master Every Rep with AI Precision.
              </TextAnimate>
              <TextAnimate animation="blurInUp" by="word" delay={0.3} once className="text-foreground">
                Meet P.A.C.E, your personal AI fitness coach that uses cutting-edge motion tracking to perfect your workouts — rep by rep, set by set.
              </TextAnimate>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate('/signup')} className="cursor-pointer" data-aos='fade-right' data-aos-delay={400}>
                  <IconBarbell />
                  Start Training
                </Button>
                <Button variant="secondary" size="lg" className="cursor-pointer" data-aos='fade-right' data-aos-delay={300}>How it works</Button>
              </div>
              <div data-aos='flip-up' data-aos-delay={200} className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-muted flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Form Accuracy</p>
                  <p className="text-xl font-bold">92%</p>
                </div>
                <div className="bg-muted flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Avg. Rep Speed</p>
                  <p className="text-xl font-bold">1.2s</p>
                </div>
                <div className="bg-muted flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Tempo</p>
                  <p className="text-xl font-bold text-green-300">Good</p>
                </div>
              </div>
            </div>
            <img src="/pose_tracking.svg" alt="Pose Tracking Illustration" className="md:ml-auto md:max-w-xl" />
          </div>

          {/* Features Section */}
          <div id='features' className="flex flex-col gap-6">
            <TextAnimate animation="blurInUp" by="character" once className="text-2xl font-bold tracking-tight">Features</TextAnimate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} data-aos='fade-up' data-aos-delay={index * 100} className="bg-muted p-6 rounded-lg flex flex-col gap-4 cursor-pointer hover:scale-105 hover:active:scale-95 transition-transform duration-500">
                  <div className="flex gap-4">
                    <div className="text-4xl text-primary">{feature.icon}</div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-md text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How it works Section */}
          <div className="flex flex-col gap-4">
            <TextAnimate animation="blurInUp" by="character" once className="text-2xl font-bold tracking-tight">How P.A.C.E works</TextAnimate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside text-muted-foreground max-w-lg flex flex-col gap-2 ml-4">
                <li><b>Precision Feedback:</b> No more guessing — get real, measurable insights into your workout form.</li>
                <li><b>Consistency Tracking:</b> See how your form improves from workout to workout.</li>
                <li><b>Maximize Results:</b> Eliminate bad habits early and reach peak efficiency faster.</li>
                <li><b>Hands-Free Coaching:</b> No wearables, no distractions — just your camera and your movement.</li>
                <li><b>AI-Powered Accuracy:</b> Built using state-of-the-art MediaPipe motion tracking technology.</li>
              </ul>
              <div className="bg-muted flex flex-col gap-4 rounded-sm p-4">
                <p className="">Live session preview</p>
                <div className="bg-card flex rounded-sm">
                  
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}