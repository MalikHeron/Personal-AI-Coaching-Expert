import Navbar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { IconBarbell } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className='flex grow p-6'>
        <main className="flex flex-row justify-center mx-auto w-full max-w-7xl gap-12">
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="flex flex-col max-w-md gap-4">
              <TextAnimate animation="blurInUp" by="character" once className="text-3xl font-bold tracking-tight">
                Master Every Rep with AI Precision.
              </TextAnimate>
              <TextAnimate animation="blurInUp" by="character" once className="text-foreground">
                Meet P.A.C.E, your personal AI fitness coach that uses cutting-edge motion tracking to perfect your workouts — rep by rep, set by set.
              </TextAnimate>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate('/signup')} className="cursor-pointer">
                  <IconBarbell />
                  Start Training
                </Button>
                <Button variant="secondary" size="lg">How it works</Button>
              </div>
              <div data-aos='flip-up' data-aos-delay={200} className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-card flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Form Accuracy</p>
                  <p className="text-xl font-bold">92%</p>
                </div>
                <div className="bg-card flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Avg. Rep Speed</p>
                  <p className="text-xl font-bold">1.2s</p>
                </div>
                <div className="bg-card flex flex-col p-4 rounded-sm">
                  <p className="text-sm text-muted-foreground">Tempo</p>
                  <p className="text-xl font-bold text-green-300">Good</p>
                </div>
              </div>
            </div>
            <img src="/pose_tracking.svg" alt="Pose Tracking Illustration" className="md:mx-auto md:max-w-lg" />
          </div>


        </main>
      </div>
    </>
  )
}