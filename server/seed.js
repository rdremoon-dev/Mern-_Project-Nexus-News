const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config({ path: require('node:path').resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const User = require('./models/User');
const Blog = require('./models/Blog');

const SAMPLE_BLOGS = [
  {
    title: 'Exploring the Connection Between Gut Health and Mental Well-being',
    category: 'Health',
    coverImage:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'New clinical research reveals how the gut microbiome communicates directly with the central nervous system to regulate mood and stress.',
    paragraphs: [
      'Recent breakthroughs in neurogastroenterology have highlighted the intricate bidirectional communication network linking the gastrointestinal tract and the brain.',
      'Researchers found that balanced microbial diversity supports neurotransmitter synthesis, influencing emotional resilience and cognitive clarity.',
    ],
    pullQuote:
      'A thriving microbiome serves as a foundational pillar for both metabolic vitality and mental clarity.',
    author: 'Editorial Desk',
    isFeatured: true,
  },
  {
    title: 'The Athletes to Watch in International Track and Aquatics',
    category: 'Sports',
    coverImage:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'From record-breaking freestyle swimmers to endurance cyclists, meet the competitors redefining peak athletic performance.',
    paragraphs: [
      'International training camps are buzzing as a new generation of swimmers and endurance athletes prepares to shatter long-standing records.',
      'Sports scientists attribute these gains to data-driven recovery protocols and precision nutrition.',
    ],
    pullQuote:
      'Modern athletic excellence is built equally in the recovery lab and on the training track.',
    author: 'Sports Desk',
  },
  {
    title: 'Key Policy Issues Shaping the Upcoming Election Trail',
    category: 'Politics',
    coverImage:
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Economic reform, domestic manufacturing, and healthcare affordability top voter priorities across key battleground regions.',
    paragraphs: [
      'As campaign rallies draw thousands of voters, candidates are sharpening their platforms around domestic job creation and inflation relief.',
      'Independent analysts note that turnout among first-time voters could prove decisive in closely contested districts.',
    ],
    author: 'Political Correspondent',
  },
  {
    title: 'The Role of Sleep in Immune System Support',
    category: 'Health',
    coverImage:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Consistent deep sleep cycles trigger critical cytokine production needed to fight inflammation and seasonal infections.',
    paragraphs: [
      'During slow-wave sleep, the immune system releases protective proteins that target infection and systemic inflammation.',
      'Chronic sleep deprivation suppresses T-cell response, leaving individuals significantly more vulnerable to viral exposure.',
    ],
    author: 'Health Desk',
  },
  {
    title: 'Breaking Down the Latest Nutritional Guidelines',
    category: 'Health',
    coverImage:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Whole citrus fruits, dietary fiber, and plant-forward meals take center stage in updated global dietary recommendations.',
    paragraphs: [
      'Nutrition panels have updated daily micronutrient benchmarks, emphasizing antioxidant-rich whole foods over ultra-processed alternatives.',
      'Simple daily adjustments—such as pairing vitamin C-rich fruits with plant proteins—dramatically improve nutrient absorption.',
    ],
    author: 'Health Desk',
  },
  {
    title: 'Understanding the Human Brain: New Insights from Neuroscience',
    category: 'Science',
    coverImage:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'High-resolution neural imaging maps how synaptic plasticity adapts across every decade of human adulthood.',
    paragraphs: [
      'Using next-generation functional MRI scanners, neuroscientists have mapped previously unseen neural pathways responsible for memory consolidation.',
      'The findings challenge old assumptions about cognitive aging, proving that targeted learning continuously reshapes cortical circuits.',
    ],
    author: 'Science Desk',
  },
  {
    title: 'Understanding Cryptocurrency: Risks and Opportunities',
    category: 'Business',
    coverImage:
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Institutional adoption and clearer regulatory frameworks are reshaping how digital assets fit into modern portfolios.',
    paragraphs: [
      'Financial institutions are increasingly exploring tokenized settlement rails while weighing market volatility and custody compliance.',
      'Market strategists advise balancing innovation exposure with disciplined risk management.',
    ],
    author: 'Business Desk',
  },
  {
    title: 'Analyzing the Latest Trends in Global Trade',
    category: 'Business',
    coverImage:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Maritime shipping corridors and regional supply chain diversification are redefining international commerce.',
    paragraphs: [
      'Global logistics operators are investing heavily in automated port infrastructure and nearshoring hubs to prevent bottlenecks.',
      'Trade economists project steady recovery in container volumes across major transoceanic routes.',
    ],
    author: 'Business Desk',
  },
  {
    title: 'How Climate Change is Reshaping Global Landscapes',
    category: 'World',
    coverImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Environmental monitoring teams track shifting ecosystems, wildfire prevention strategies, and reforestation milestones.',
    paragraphs: [
      'Satellite telemetry provides real-time insight into forest recovery, coastal resilience, and watershed management worldwide.',
      'Cross-border conservation initiatives are demonstrating measurable success in restoring degraded habitats.',
    ],
    author: 'World Desk',
  },
  {
    title: 'Exploring the Impact of AI on Creative Industries',
    category: 'Arts',
    coverImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    excerpt:
      'Visual artists, filmmakers, and interactive designers blend generative tools with traditional craftsmanship.',
    paragraphs: [
      'Digital studios are adopting assistive workflows to prototype visual concepts faster while preserving human artistic direction.',
      'Exhibitions worldwide are sparking lively dialogue around authorship, originality, and new media aesthetics.',
    ],
    author: 'Arts Desk',
  },
];

const seedDatabase = async () => {
  await connectDB();

  try {
    await User.deleteMany({});
    await Blog.deleteMany({});

    await User.create({
      name: 'Nexus Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });

    for (const item of SAMPLE_BLOGS) {
      await Blog.create(item);
    }

    console.log('Database seeded successfully!');
    console.log(`Admin account created for ${process.env.ADMIN_EMAIL}.`);
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
