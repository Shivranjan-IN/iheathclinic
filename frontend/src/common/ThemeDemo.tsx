import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Moon, Sun, Heart, Brain, Stethoscope, Pill } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    { icon: Heart, title: "Heart Health", description: "Monitor cardiovascular health" },
    { icon: Brain, title: "AI Analysis", description: "Smart health insights" },
    { icon: Stethoscope, title: "Expert Consultation", description: "Connect with doctors" },
    { icon: Pill, title: "Medicine Management", description: "Track medications" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">I Health Clinic Theme Demo</h1>
            <Button onClick={toggleTheme} variant="outline" size="lg">
              {theme === 'light' ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </Button>
          </div>
          <p className="text-xl text-muted-foreground">
            Current theme: <Badge variant="secondary">{theme}</Badge>
          </p>
        </div>

        {/* Theme Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-pink-100 text-pink-600' 
                    : 'bg-pink-900/30 text-pink-400 border border-pink-800/30'
                }`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Color Palette Showcase */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Theme Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 bg-primary rounded-lg"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-secondary rounded-lg"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-accent rounded-lg"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-muted rounded-lg"></div>
              <p className="text-sm font-medium">Muted</p>
            </div>
          </div>
        </Card>

        {/* Interactive Elements */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Interactive Elements</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge>Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
          </div>
        </Card>

        {/* Typography Showcase */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-lg">Large paragraph text with normal weight</p>
            <p className="text-base">Regular paragraph text for body content</p>
            <p className="text-sm text-muted-foreground">Muted text for secondary information</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
