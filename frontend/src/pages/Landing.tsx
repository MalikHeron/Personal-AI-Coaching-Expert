import Navbar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

const members = [
  {
    name: "Malik Heron",
    role: "Frontend Engineer & UX",
    initial: "M"
  },
  {
    name: "Sherissa Pinnock",
    role: "AI Engineer",
    initial: "S"
  },
  {
    name: "Trishanna Ford",
    role: "Backend Engineer",
    initial: "T"
  }
]
export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className='flex flex-col px-8 md:px-4 py-8 w-full overflow-hidden'>
        <main className="flex flex-col justify-center mx-auto w-full max-w-7xl gap-12">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="flex flex-col max-w-lg gap-4">
              <TextAnimate animation="blurInUp" by="word" delay={0.3} once className="text-3xl md:text-5xl font-bold tracking-tight">
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
              <div data-aos='flip-up' data-aos-delay={200} data-aos-once className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-muted flex flex-col p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Form Accuracy</p>
                  <p className="text-xl font-bold">92%</p>
                </div>
                <div className="bg-muted flex flex-col p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg. Rep Speed</p>
                  <p className="text-xl font-bold">1.2s</p>
                </div>
                <div className="bg-muted flex flex-col p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tempo</p>
                  <p className="text-xl font-bold text-green-500">Good</p>
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
          <div id='product' className="flex flex-col gap-4">
            <TextAnimate animation="blurInUp" by="character" once className="text-2xl font-bold tracking-tight">How P.A.C.E works</TextAnimate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-none text-foreground max-w-lg flex flex-col gap-2 ml-4 leading-tight">
                <li className="flex items-start"><span className="mr-2 mt-1 text-primary">•</span><span><b>Precision Feedback:</b> No more guessing — get real, measurable insights into your workout form.</span></li>
                <li className="flex items-start"><span className="mr-2 mt-1 text-primary">•</span><span><b>Consistency Tracking:</b> See how your form improves from workout to workout.</span></li>
                <li className="flex items-start"><span className="mr-2 mt-1 text-primary">•</span><span><b>Maximize Results:</b> Eliminate bad habits early and reach peak efficiency faster.</span></li>
                <li className="flex items-start"><span className="mr-2 mt-1 text-primary">•</span><span><b>Hands-Free Coaching:</b> No wearables, no distractions — just your camera and your movement.</span></li>
                <li className="flex items-start"><span className="mr-2 mt-1 text-primary">•</span><span><b>AI-Powered Accuracy:</b> Built using state-of-the-art MediaPipe motion tracking technology.</span></li>
              </ul>
              <div className="bg-muted flex flex-col gap-4 rounded-lg p-4">
                <p className="text-green-500">Live session preview</p>
                <div className="bg-card flex flex-col rounded-sm p-4">
                  <p className="text-sm text-muted-foreground">Current exercise: Bicep Curls</p>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="bg-muted flex flex-col p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Reps completed</p>
                      <p className="text-lg font-bold">5 / 10</p>
                    </div>
                    <div className="bg-muted flex flex-col p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Sets completed</p>
                      <p className="text-lg font-bold">3 / 5</p>
                    </div>
                    <div className="bg-muted flex flex-col p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold">00:25 mins</p>
                    </div>
                    <div className="bg-muted flex flex-col p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Rest timer</p>
                      <p className="text-lg font-bold">15 secs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div id='about' className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <TextAnimate animation="blurInUp" by="character" once className="text-2xl font-bold tracking-tight">About P.A.C.E</TextAnimate>
              <p className="text-foreground max-w-xl">
                Personal AI Coaching Expert (P.A.C.E) is redefining home fitness through computer vision and machine learning.
                By leveraging MediaPipe’s real-time pose estimation, P.A.C.E turns any camera into an intelligent trainer that evaluates your movements with precision — helping you train smarter, safer, and more efficiently.
                Whether you’re a beginner looking to perfect your form or an athlete chasing micro-improvements, P.A.C.E keeps you in sync with your body’s best potential.
              </p>
            </div>

            {/* Meet the Team Section */}
            <div className="flex flex-col gap-4 mt-10 justify-center items-center w-full">
              <TextAnimate animation="blurInUp" by="character" once className="text-center text-2xl font-bold tracking-tight">Meet the Team</TextAnimate>
              <p className="text-foreground max-w-xl text-center">
                Our team is composed of experts in AI, fitness, and wellness, all dedicated to helping you achieve your goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
                {members.map((member) => (
                  <div key={member.name} className='bg-muted rounded-lg p-6 flex flex-col items-center'>
                    <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4 text-2xl font-bold">
                      {member.initial}
                    </div>
                    <p className="text-lg font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact us Section */}
          <div className="flex flex-col gap-4 mt-10 justify-center items-center w-full">
            <TextAnimate animation="blurInUp" by="character" once className="text-center text-2xl font-bold tracking-tight">Get in Touch</TextAnimate>
            <p className="text-foreground max-w-xl text-center">
              Have questions or want to learn more? Reach out to our team — we're here to help you take your fitness journey to the next level with P.A.C.E.
            </p>
            <Button
              size="lg"
              onClick={() => window.open("mailto:example@gmail.com")}
              className="cursor-pointer"
              data-aos='fade-up'
              data-aos-delay={400}
            >
              Contact Us
            </Button>
          </div>


        </main>

        <Separator className="mt-12" />
        {/* Footer Section */}
        <footer className="w-full p-6 flex flex-col items-center">
          <p className="text-muted-foreground text-sm text-center">
            &copy; {new Date().getFullYear()} P.A.C.E. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  )
}