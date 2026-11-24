import HandHeartLineIcon from 'remixicon-react/HandHeartLineIcon';
import TeamLineIcon from 'remixicon-react/TeamLineIcon';
import GroupLineIcon from 'remixicon-react/GroupLineIcon';
import MagicLineIcon from 'remixicon-react/MagicLineIcon';

const METRICS = [
  { value: '500,000', label: 'Monthly Unique Visitors' },
  { value: '100,000+', label: 'Newsletter Subscribers' },
  { value: '10,000+', label: 'Published Articles' },
  { value: '150+', label: 'Countries Trust Us' },
];

const VALUES = [
  {
    icon: HandHeartLineIcon,
    title: 'Integrity',
    description: 'We uphold the highest standards of journalistic ethics and integrity.',
  },
  {
    icon: TeamLineIcon,
    title: 'Transparency',
    description: 'We are committed to transparency in our reporting processes.',
  },
  {
    icon: GroupLineIcon,
    title: 'Inclusivity',
    description: 'We believe in amplifying diverse voices and fostering an inclusive community.',
  },
  {
    icon: MagicLineIcon,
    title: 'Innovation',
    description: "We embrace new tech and storytelling to enhance our readers' experience.",
  },
];

const JOURNALISTS = [
  {
    name: 'Alex Wood',
    role: 'Editor-in-Chief',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Taylor Kim',
    role: 'Senior Reporter',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Riley Brooks',
    role: 'Features Writer',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  },
];

const SectionHeading = ({ eyebrow, title, dark = false }) => (
  <div>
    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#D04A33] mb-2">
      {eyebrow}
    </span>
    <div className="flex items-start gap-3.5">
      <span className="w-0.75 h-9 bg-[#D04A33] shrink-0 mt-1" />
      <h2
        className={`text-2xl sm:text-3xl font-bold leading-tight ${
          dark ? 'text-white' : 'text-[#1E1E1E]'
        }`}
      >
        {title}
      </h2>
    </div>
  </div>
);

const About = () => {
  return (
    <main className="bg-white text-[#1E1E1E]">
      {/* 1. Top Wide Hero Image */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="w-full h-65 sm:h-100 lg:h-117.5 overflow-hidden bg-gray-100">
          <img
            src="/src/assets/hero.avif"
            alt="Nexus News editorial team collaborating"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 2. Our Journey: From Vision to Voice */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="OUR JOURNEY" title="From Vision to Voice" />
          </div>

          <div className="lg:col-span-7 space-y-5 text-sm sm:text-[15px] text-[#333333] leading-relaxed">
            <p>
              In 2015, in a small coffee shop bustling with ideas and ambition, a group of
              passionate journalists and thought leaders came together with a singular vision:
              to create a news platform that would bridge the gap between breaking news and
              insightful analysis. We noticed a growing demand for quality journalism that not
              only reported facts but also provided context and depth.
            </p>
            <p>
              Driven by a commitment to transparency and diversity, we launched Nexus News as a
              digital haven for curious minds. Our founders, Alex Wood, believed in the power of
              storytelling to illuminate complex issues and spark meaningful conversations. From
              covering local community stories to global events, our journey has been about
              connecting people through the power of information.
            </p>
            <p>
              Today, Nexus News continues to evolve, driven by a passionate team and a
              supportive community. As we look to the future, we remain committed to elevating
              voices, uncovering truths, and inspiring change through our stories.
            </p>
          </div>
        </div>

        {/* 3. Terracotta Metrics Banner */}
        <div className="mt-14 bg-[#D04A33] text-white py-9 px-6 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-white/25">
            {METRICS.map((item, idx) => (
              <div
                key={item.label}
                className={idx === 0 ? 'sm:pr-6' : 'sm:px-8'}
              >
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-white/90 mt-1.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The Mission & Vision (Full-bleed Darkened Photo + Floating Terracotta Box) */}
      <section className="relative bg-[#1E1E1E] overflow-hidden">
        <img
          src="/src/assets/ot-bg.avif"
          alt="Journalists reviewing stories"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="OUR THOUGHTS"
                title="The Mission & Vision"
                dark
              />
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#D04A33] text-white p-8 sm:p-11 shadow-lg">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    Mission: Informing Minds
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-2.5">
                    Our mission is to deliver accurate, comprehensive, and thought-provoking
                    news that empowers our readers to make informed decisions and engage with
                    the world around them.
                  </p>
                </div>

                <hr className="border-white/25 my-7" />

                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    Vision: Connecting Communities
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed mt-2.5">
                    Our vision is to become a leading platform that connects diverse
                    communities through insightful journalism, fostering understanding and
                    driving positive change globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="WHAT WE BELIEVE" title="Our Values" />
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val) => {
              const IconComponent = val.icon;
              return (
                <div
                  key={val.title}
                  className="border border-gray-200 p-7 hover:border-[#D04A33] transition-colors"
                >
                  <IconComponent size={24} className="text-[#D04A33] mb-5" />
                  <h3 className="text-lg font-bold text-[#1E1E1E]">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mt-2.5">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Experienced Journalists (Full-bleed Charcoal/Black Section) */}
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="OUR THOUGHTS"
            title="Experienced Journalists"
            dark
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-12">
            {JOURNALISTS.map((person) => (
              <article key={person.name} className="group">
                <div className="w-full h-90 overflow-hidden bg-zinc-900">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mt-4">{person.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{person.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonial: What Readers Are Saying */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading eyebrow="TESTIMONIAL" title="What Readers Are Saying" />

            <blockquote className="text-xs sm:text-sm text-[#444444] leading-relaxed max-w-md">
              “Discovering Nexus News has truly transformed how I keep up with current events.
              The depth and quality of their reporting are unmatched, offering a refreshing
              blend of hard-hitting journalism and insightful analysis. Whether it&apos;s breaking
              news or in-depth features, Nexus News never fails to provide the context and
              clarity I need. The diverse range of topics and the commitment to unbiased
              reporting make it my go-to source for staying informed. Kudos to the team for
              maintaining such high standards!”
            </blockquote>

            <div>
              <p className="text-xs font-bold text-[#D04A33]">— Jordan Mitchell</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Avid Reader</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="w-full h-[270px] sm:h-[330px] overflow-hidden bg-gray-100">
              <img
                src="/src/assets/testi.avif"
                alt="Reader enjoying Nexus News on a laptop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;