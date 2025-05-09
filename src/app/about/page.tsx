import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Droplets, Target, Users, HeartHandshake } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">About Qatrah Hayat</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our mission is to bridge the gap between blood donors and recipients, creating a community dedicated to saving lives through the precious gift of blood donation.
        </p>
      </section>

      <section id="our-story" className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-primary flex items-center"><Droplets className="mr-2 h-7 w-7"/>Our Story</h2>
          <p className="text-muted-foreground mb-4">
            Qatrah Hayat (meaning "Drop of Life" in Arabic) was founded with the vision of making blood donation more accessible and efficient. We saw the critical need for a centralized platform to connect donors, patients, and blood banks, especially during emergencies.
          </p>
          <p className="text-muted-foreground">
            Driven by a passion for community health and leveraging technology, we aim to simplify the process, raise awareness, and foster a culture of regular, voluntary blood donation.
          </p>
        </div>
        <div>
           <Image
             src="https://picsum.photos/seed/teamwork/500/350"
             data-ai-hint="diverse team working together"
             alt="Qatrah Hayat Team Collaboration"
             width={500}
             height={350}
             className="rounded-lg shadow-lg mx-auto"
           />
        </div>
      </section>

      <section id="mission-vision" className="grid md:grid-cols-2 gap-8 text-center">
         <Card className="shadow-md hover:shadow-lg transition-shadow p-6">
           <CardHeader className="items-center">
             <Target className="h-12 w-12 text-primary mb-3"/>
             <CardTitle className="text-2xl">Our Mission</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">To facilitate timely access to safe blood by connecting voluntary blood donors with patients in need, fostering a healthier community.</p>
           </CardContent>
         </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow p-6">
           <CardHeader className="items-center">
             <Users className="h-12 w-12 text-primary mb-3"/>
             <CardTitle className="text-2xl">Our Vision</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">A future where no life is lost due to blood shortage, supported by a proactive and informed community of blood donors.</p>
           </CardContent>
         </Card>
      </section>

      <section id="why-donate" className="py-12 px-6 bg-muted/50 rounded-lg shadow-md">
           <h2 className="text-3xl font-bold text-center mb-8 text-primary flex items-center justify-center"><HeartHandshake className="mr-3 h-8 w-8"/>The Impact of Your Donation</h2>
           <div className="prose prose-lg max-w-none text-muted-foreground mx-auto text-center">
             <p>
               Every blood donation is a lifeline. It supports patients undergoing major surgeries, those battling cancer, individuals with chronic blood disorders like sickle cell anemia or thalassemia, accident victims, and mothers experiencing complications during childbirth.
             </p>
             <p>
               By donating blood, you are directly contributing to the health and well-being of your community. It's a simple act with a profound impact, offering hope and a second chance at life to countless individuals.
             </p>
              <p>
                 Beyond saving lives, donation encourages regular health check-ups and fosters a sense of civic responsibility and altruism.
              </p>
           </div>
           <div className="text-center mt-10">
               <Button asChild>
                   <Link href="/donate">Become a Donor Today</Link>
               </Button>
           </div>
      </section>

      <section id="our-team" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary flex items-center justify-center">
          <Users className="mr-3 h-8 w-8"/> Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">YM</span>
              </div>
              <CardTitle className="text-xl">Youssef Mohamed Abdelfattah Elmorali</CardTitle>
              <CardDescription className="text-primary font-medium">Project Lead & FullStack Developer</CardDescription>
            </CardHeader>
          </Card>

          {/* Team Member 2 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">AE</span>
              </div>
              <CardTitle className="text-xl">Ahmed Mohamed Abdelsalam Essa</CardTitle>
              <CardDescription className="text-primary font-medium">Frontend Developer</CardDescription>
            </CardHeader>
          </Card>

          {/* Team Member 3 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">BR</span>
              </div>
              <CardTitle className="text-xl">Bassant Mahmoud Mohamed Rakha</CardTitle>
              <CardDescription className="text-primary font-medium">Backend Developer</CardDescription>
            </CardHeader>
          </Card>

          {/* Team Member 4 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">GN</span>
              </div>
              <CardTitle className="text-xl">Gamila Omar Nasr Ali</CardTitle>
              <CardDescription className="text-primary font-medium">UI/UX Designer</CardDescription>
            </CardHeader>
          </Card>

          {/* Team Member 5 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">AG</span>
              </div>
              <CardTitle className="text-xl">Ahmed Samir Thabet Gad El Rabb</CardTitle>
              <CardDescription className="text-primary font-medium">Backend Developer</CardDescription>
            </CardHeader>
          </Card>

          {/* Team Member 6 */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">MA</span>
              </div>
              <CardTitle className="text-xl">Mohamed Osama Awad Ali Awad</CardTitle>
              <CardDescription className="text-primary font-medium">Frontend Developer</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

    </div>
  );
}
