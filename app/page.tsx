import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MissionCarousel } from "@/components/mission-carousel";
import { TimeCarousel } from "@/components/time-carousel";
import { MinistryCard, ministries } from "@/components/ministry-card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <img
                  src="/Logo-cw.png"
                  alt="Charisword Gospel Ministry"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-balance text-white">
                  Charisword Gospel Ministry
                </h1>
                <p className="text-sm text-white/80">
                  Raising Able Ministers of Grace Worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-white hover:bg-white  hover:text-primary"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mission Carousel */}
      <section>
        <MissionCarousel />
      </section>

      {/* Our Services Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        </div>

        <div className="container mx-auto max-w-7xl relative">
          {/* Welcome Message at Top */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h1 className="text-6xl font-bold mb-4 text-foreground">
                Welcome Home
              </h1>
              <div className="h-1 w-32 mx-auto mb-8 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <p className="text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
              Experience the warmth of our community and the transformative
              power of God's Word in a place where you truly belong
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Big Image with Integrated Info */}
            <div className="relative h-[600px] rounded-3xl overflow-hidden group shadow-2xl">
              <img
                src="/church-building.jpg"
                alt="Charisword Gospel Ministry"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Integrated Information Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">📍 Location</p>
                    <p className="text-sm">KNUST CAMPUS</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">📞 Contact</p>
                    <p className="text-sm">026 116 9859</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">📅 Services</p>
                    <p className="text-sm">Sun: 6:00PM & 9:30PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Action Cards */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Prayer & Worship Card */}
                <div className="p-8 hover:bg-muted/30 transition-all duration-300 rounded-lg border border-border">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-foreground">
                        Prayer & Worship
                      </h4>
                      <p className="text-muted-foreground">
                        Join us in powerful prayers and uplifting worship
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Join Prayer
                    </Button>
                  </div>
                </div>

                {/* Study & Grow Card */}
                <div className="p-8 hover:bg-muted/30 transition-all duration-300 rounded-lg border border-border">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-foreground">
                        Study & Grow
                      </h4>
                      <p className="text-muted-foreground">
                        Deep dive into God's Word and grow in grace
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="p-8 rounded-2xl bg-muted/50">
                <h4 className="text-2xl font-bold mb-4 text-center text-foreground">
                  A Place to Call Home
                </h4>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Where faith grows, friendships blossom, and lives are
                  transformed through the power of God's Word
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Beliefs Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              What We Believe
            </Badge>
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Our Statement of Faith
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">The Holy Spirit</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                We believe that The Bible contains the Inspired and Infallible
                Word of God, Inerrant and Final in Authority.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Godhead</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                We believe that there is only one God, Eternally Existing in
                Three Persons - Father, Son and Holy Spirit.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Salvation</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                We believe in Salvation by Grace through Faith apart from works.
                It is obtained and maintained by Grace alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Arms Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Ministry Arms
            </Badge>
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              Our Ministries
            </h3>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Discover our various ministries and find where you can serve
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {ministries.map((ministry, index) => (
              <MinistryCard
                key={index}
                title={ministry.title}
                description={ministry.description}
                image={ministry.image}
                icon={ministry.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
        </div>

        <div className="relative">
          {/* Section Header */}
          <div className="text-center mb-16 -mt-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-lg px-8 py-3 shadow-xl">
                Join Our Family
              </Badge>
              <div className="w-16 h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full" />
            </div>
            <h2 className="text-5xl font-bold text-foreground">
              Experience Community
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
              Join us in fellowship and grow together in grace
            </p>
          </div>
          {/* Full Width Church Group Picture */}
          <TimeCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <img
                  src="/Logo-cw.png"
                  alt="Charisword Gospel Ministry"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div>
                <p className="font-semibold text-foreground">
                  Charisword Gospel Ministry
                </p>
                <p className="text-sm text-muted-foreground">
                  Raising Able Ministers of Grace Worldwide
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2025 Charisword Gospel Ministry. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Demonstrating the Power of God's Word
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
