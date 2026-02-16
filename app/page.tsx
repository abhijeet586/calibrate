"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Shield,
  Target,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  ChevronRight,
  Circle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TerminalWindow } from "@/components/landing/TerminalWindow";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
              <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20">
                <ChevronRight className="mr-1 h-3 w-3" />
                Real-time market intelligence for students
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-5xl font-bold leading-tight md:text-7xl"
            >
              Don't Just Graduate.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                Be Market Ready.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl"
            >
              The first platform syncing college curriculum with real-time market data. Verified by mentors, powered by live tech trends.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-cyan-400 text-black hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/mentor">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Faculty Dashboard
                </Button>
              </Link>
            </motion.div>

            {/* Terminal Window */}
            <motion.div variants={fadeInUp}>
              <TerminalWindow />
            </motion.div>
          </motion.div>
        </div>
      </section >

      {/* Features Section */}
      < section className="py-20" >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-gray-400">
              Built for the modern learner. Designed by industry professionals.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-cyan-400/10 p-3">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-time Feed</h3>
              <p className="text-sm text-gray-400">
                Live updates on industry trends, tech stacks, and hiring patterns from top companies.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-green-400/10 p-3">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Mentor Verification</h3>
              <p className="text-sm text-gray-400">
                Industry experts validate your roadmap and ensure you're learning what actually matters.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-purple-400/10 p-3">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Skill Tracker</h3>
              <p className="text-sm text-gray-400">
                Quantify your progress with precision metrics that align with real job requirements.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-yellow-400/10 p-3">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fast Learning Paths</h3>
              <p className="text-sm text-gray-400">
                Optimized curricula designed to get you job-ready in the shortest time possible.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-blue-400/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Market Analytics</h3>
              <p className="text-sm text-gray-400">
                Data-driven insights showing which skills are trending and what companies are hiring for.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-lg bg-pink-400/10 p-3">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Peer Network</h3>
              <p className="text-sm text-gray-400">
                Connect with students and alumni who've successfully landed their dream roles.
              </p>
            </motion.div>
          </div>
        </div>
      </section >


      {/* How It Works Section */}
      < section className="py-20" >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              How It{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-gray-400">
              A seamless flow from industry insights to student success.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mx-auto max-w-4xl">
            {/* Vertical Line */}
            <div className="absolute left-[52px] top-12 bottom-12 w-px bg-gradient-to-b from-cyan-400/50 via-green-400/50 to-purple-400/50" />

            {/* Step 1 - Admin Updates */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative mb-24 flex items-start gap-8"
            >
              {/* Icon Circle - Outlined */}
              <div className="relative z-10 flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center bg-[#050505] rounded-full">
                <div className="absolute inset-0 rounded-full border-[3px] border-cyan-400" />
                <Circle className="h-10 w-10 text-cyan-400" strokeWidth={2.5} />
                <Check className="absolute h-5 w-5 text-cyan-400" strokeWidth={3} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-6">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">Admin Updates</h3>
                  <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-400 text-xs px-2 py-0.5">Live</Badge>
                </div>
                <p className="text-base text-gray-400 leading-relaxed">
                  Faculty and administrators curate industry-relevant content and roadmaps based on current market demands.
                </p>
              </div>
            </motion.div>

            {/* Step 2 - Mentor Roadmaps */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative mb-24 flex items-start gap-8"
            >
              {/* Icon Circle - Outlined */}
              <div className="relative z-10 flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center bg-[#050505] rounded-full">
                <div className="absolute inset-0 rounded-full border-[3px] border-green-400" />
                <Circle className="h-10 w-10 text-green-400" strokeWidth={2.5} />
                <Check className="absolute h-5 w-5 text-green-400" strokeWidth={3} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-6">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">Mentor Roadmaps</h3>
                  <Badge className="border-green-400/30 bg-green-400/10 text-green-400 text-xs px-2 py-0.5">Verified</Badge>
                </div>
                <p className="text-base text-gray-400 leading-relaxed">
                  Industry mentors review and validate learning paths, ensuring they align with real-world job requirements.
                </p>
              </div>
            </motion.div>

            {/* Step 3 - Student Action */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative flex items-start gap-8"
            >
              {/* Icon Circle - Outlined */}
              <div className="relative z-10 flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center bg-[#050505] rounded-full">
                <div className="absolute inset-0 rounded-full border-[3px] border-purple-400" />
                <Circle className="h-10 w-10 text-purple-400" strokeWidth={2.5} />
                <Check className="absolute h-5 w-5 text-purple-400" strokeWidth={3} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-6">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">Student Action</h3>
                  <Badge className="border-purple-400/30 bg-purple-400/10 text-purple-400 text-xs px-2 py-0.5">Active</Badge>
                </div>
                <p className="text-base text-gray-400 leading-relaxed">
                  Students access personalized roadmaps, track progress, and build skills that matter to employers.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section >



      {/* Final CTA Section */}
      < section className="py-20" >
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-12 text-center backdrop-blur-sm">
            <h2 className="mb-4 text-4xl font-bold">
              Ready to Transform Your Future?
            </h2>
            <p className="mb-8 text-lg text-gray-400">
              Join thousands of students who are already ahead of the curve.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-cyan-400 text-black hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section >

      <Footer />
    </div >
  );
}
