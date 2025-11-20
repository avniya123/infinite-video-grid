import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Gift, Calendar, FileText, PartyPopper, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/Layout';

const Landing = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const flashDeals = [
    { discount: '25%', title: 'Birthday Videos', color: 'from-pink-500 to-rose-500' },
    { discount: '15%', title: 'Wedding Templates', color: 'from-purple-500 to-indigo-500' },
    { discount: '28%', title: 'Business Promos', color: 'from-blue-500 to-cyan-500' },
    { discount: '21%', title: 'Festival Greetings', color: 'from-amber-500 to-orange-500' },
  ];

  const festivalCategories = [
    { name: 'Diwali', icon: Sparkles, gradient: 'from-yellow-400 to-orange-500', description: 'Festival of Lights celebrations' },
    { name: 'Pongal', icon: PartyPopper, gradient: 'from-green-400 to-emerald-500', description: 'Harvest festival templates' },
    { name: 'Christmas', icon: Gift, gradient: 'from-red-400 to-rose-500', description: 'Holiday season specials' },
    { name: 'New Year', icon: Zap, gradient: 'from-purple-400 to-pink-500', description: 'New beginnings celebrations' },
  ];

  const businessTemplates = [
    { title: 'Invoice Templates', icon: FileText, count: '50+' },
    { title: 'Product Showcase', icon: TrendingUp, count: '100+' },
    { title: 'Event Invitations', icon: Calendar, count: '75+' },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-6 animate-fade-in">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              New Templates Every Week
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Create Stunning Videos
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional video templates for every occasion. From celebrations to business needs,
              we've got you covered with ready-to-use templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/videos">
                <Button size="lg" className="gap-2 group">
                  Explore Templates
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="mb-2">
              <Zap className="w-3 h-3 mr-1 text-amber-500" />
              Limited Time Offers
            </Badge>
            <h2 className="text-4xl font-bold">Flash Deals</h2>
            <p className="text-muted-foreground">Grab these exclusive discounts before they expire</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((deal, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden p-6 border-2 transition-all duration-300 cursor-pointer ${
                  hoveredCard === index ? 'scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${deal.color} opacity-10`} />
                <div className="relative z-10 space-y-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${deal.color} text-white font-bold text-xl shadow-lg`}>
                    {deal.discount}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground">Premium templates included</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Shop Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Festival Templates Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="mb-2">
              <PartyPopper className="w-3 h-3 mr-1" />
              Celebrate Every Moment
            </Badge>
            <h2 className="text-4xl font-bold">Festival Celebrations</h2>
            <p className="text-muted-foreground">Beautiful templates for all your festive occasions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {festivalCategories.map((festival, index) => {
              const Icon = festival.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden p-8 border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${festival.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10 space-y-4 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${festival.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">{festival.name}</h3>
                      <p className="text-sm text-muted-foreground">{festival.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                      View Templates
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Templates Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="mb-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Professional Solutions
            </Badge>
            <h2 className="text-4xl font-bold">Business Templates</h2>
            <p className="text-muted-foreground">Elevate your business communication with professional videos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessTemplates.map((template, index) => {
              const Icon = template.icon;
              return (
                <Card
                  key={index}
                  className="group p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.count} Templates
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">{template.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Professional templates designed to make your business stand out
                      </p>
                    </div>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Explore Collection
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden p-12 border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to Create Amazing Videos?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of creators using our platform to bring their ideas to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/videos">
                  <Button size="lg" className="gap-2">
                    Start Creating Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  View All Templates
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2024 VideoMart. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Landing;
