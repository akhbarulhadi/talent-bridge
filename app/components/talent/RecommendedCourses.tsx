import MaterialIcon from "../ui/MaterialIcon";

interface Course {
  title: string;
  description: string;
  duration: string;
  level: string;
  image?: string;
  fallbackIcon?: string;
}

const courses: Course[] = [
  {
    title: "Advanced Cloud Infrastructure",
    description:
      "Master high-availability architectures and automated scaling in modern environments.",
    duration: "12h 40m",
    level: "Advanced",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDYoe8Wu7yDSw4HfLFzvRGisOjwTMADfxTMoQvRTreDBHSm4ngamPTpcJ0akHeCaRNLBht1rMrObhJSbUG4UnKkrStf5fpQx3jQontvnObbDNqlhM4pcbdDtGbsvO21GaPbzHUXaIPGjD5D9sg9sVlS3UoGgLHhWVREh8C8nXHLb1S5GUPCBOFEDXNmsis2Q7CeoAASZ8VqEX4GEypvN7kfGkNHzXuwKyrRXOd6UbP8225BeXpRO8BT_A",
  },
  {
    title: "Network Security Fundamentals",
    description:
      "Core principles of securing enterprise networks against modern threat vectors.",
    duration: "8h 15m",
    level: "Intermediate",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCiweOY2Yx94SPafTrLNjai-F1R3DG-Eoasy6rxgy19wHauQoGGZ8Lfk9GL55EpCA9m_gWb_cs-QxtaF2InXYrZhDJGmjU1EAQCRzPl8eN_EfYYGW8YZItky2hjOt-RqNc3GfyoWdR_8r_YOYQvZNVtdK8IQF_0RXifAz_LcXyn9fnvVquXsUeV1pPo0sneSG3LNHErVRYG24KUQS7jk3VM-KBPxDddwBry0mjliQ1Jkvz5Op7FvJ7REg",
  },
  {
    title: "Python for Data Engineering",
    description:
      "Build scalable data pipelines and understand core ETL processes.",
    duration: "15h 00m",
    level: "Intermediate",
    fallbackIcon: "terminal",
  },
];

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="min-w-[280px] md:min-w-[320px] snap-start glass-panel rounded-xl overflow-hidden group flex flex-col">
      {/* Thumbnail */}
      <div className="h-32 w-full relative overflow-hidden">
        {course.image ? (
          <img
            alt={`${course.title} Thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={course.image}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <MaterialIcon
              name={course.fallbackIcon || "school"}
              className="text-4xl text-outline"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim to-transparent" />
        <span className="absolute bottom-3 left-3 bg-surface/80 backdrop-blur text-primary font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs px-2 py-1 rounded">
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-[var(--font-body)] text-[16px] leading-[1.5] font-bold text-on-surface mb-2 leading-tight">
            {course.title}
          </h3>
          <p className="font-[var(--font-body)] text-[14px] leading-[1.5] text-outline-variant line-clamp-2 mb-4">
            {course.description}
          </p>
        </div>
        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
          <span className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs text-outline flex items-center gap-1">
            <MaterialIcon name="schedule" size="14px" />
            {course.duration}
          </span>
          <button className="text-secondary font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold uppercase hover:text-secondary-fixed transition-colors">
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendedCourses() {
  return (
    <div className="xl:col-span-2 animate-stagger stagger-delay-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-on-surface">
          Recommended for Gold Tier
        </h2>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4">
        {courses.map((course) => (
          <CourseCard key={course.title} course={course} />
        ))}
      </div>
    </div>
  );
}
