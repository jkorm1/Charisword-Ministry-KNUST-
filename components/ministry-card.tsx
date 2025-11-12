import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MinistryCardProps {
  title: string;
  description: string;
  image: string;
  icon: string;
}

const ministries = [
  {
    title: "CMM",
    description: "CharisWord Music Ministry",
    image: "/camm-ministry.jpg",
    icon: "🎵",
  },
  {
    title: "MIC",
    description: "CharisWord Dance Ministry",
    image: "/ccm-ministry.jpg",
    icon: "💃",
  },
  {
    title: "Children Ministry",
    description: "Nurturing next generation",
    image: "/children-ministry.jpg",
    icon: "👶",
  },
  {
    title: "CTRM",
    description: "Television and Radio Ministry",
    image: "/ctrm-ministry.jpg",
    icon: "📺",
  },
  {
    title: "Prayer",
    description: "Raising a people of Prayerr",
    image: "/prayer-ministry.jpg",
    icon: "🙏",
  },
];

export function MinistryCard({
  title,
  description,
  image,
  icon,
}: MinistryCardProps) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center text-pretty">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export { ministries };
